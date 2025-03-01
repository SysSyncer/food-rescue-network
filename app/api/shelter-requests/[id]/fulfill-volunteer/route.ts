import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import VolunteerClaim from "@/models/VolunteerClaim";
import ShelterRequest from "@/models/ShelterRequest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { io, connectedUsers } from "@/server"; // WebSocket server

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  // Ensure the user is a shelter
  if (!session || session.user.role !== "shelter") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const shelterRequestId = params.id;
    const { volunteer_id, donation_id } = await req.json(); // Required fields

    // Validate required fields
    if (!volunteer_id || !donation_id) {
      return NextResponse.json(
        { error: "Volunteer ID and Donation ID are required" },
        { status: 400 }
      );
    }

    // Check if the shelter request exists and belongs to this shelter
    const shelterRequest = await ShelterRequest.findById(shelterRequestId);
    if (!shelterRequest) {
      return NextResponse.json(
        { error: "Shelter request not found" },
        { status: 404 }
      );
    }
    if (shelterRequest.shelter_id.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to modify this request" },
        { status: 403 }
      );
    }

    // Find the volunteer claim
    const volunteerClaim = await VolunteerClaim.findOne({
      volunteer_id,
      shelter_request_id: shelterRequestId,
      donation_id,
    });

    if (!volunteerClaim) {
      return NextResponse.json(
        { error: "Volunteer claim not found" },
        { status: 404 }
      );
    }

    // Ensure the current status is "promised"
    if (volunteerClaim.shelter_request_status !== "promised") {
      return NextResponse.json(
        { error: "This volunteer’s donation is not in a promised state" },
        { status: 400 }
      );
    }

    // Update the statuses
    volunteerClaim.shelter_request_status = "fulfilled";
    volunteerClaim.donor_request_status = "donated";
    await volunteerClaim.save();

    console.log("Volunteer claim fulfilled:", volunteerClaim);

    // Emit WebSocket event to notify the volunteer
    const volunteerSocketId = connectedUsers.get(volunteer_id);
    if (volunteerSocketId) {
      io.to(volunteerSocketId).emit("volunteer_fulfilled", {
        shelter_request_id: shelterRequestId,
        donation_id,
        volunteer_id,
        shelter_request_status: "fulfilled",
        donor_request_status: "donated",
      });
      console.log(`Real-time update sent to volunteer ${volunteer_id}`);
    }

    return NextResponse.json(
      { message: "Volunteer claim fulfilled", volunteerClaim },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fulfilling volunteer claim:", error);
    return NextResponse.json(
      { error: "Failed to fulfill volunteer claim" },
      { status: 500 }
    );
  }
}
