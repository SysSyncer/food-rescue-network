import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import VolunteerClaim from "@/models/VolunteerClaim";
import ShelterRequest from "@/models/ShelterRequest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { io, connectedUsers } from "@/server"; // WebSocket server

export async function DELETE(
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

    // Ensure the volunteer hasn't already fulfilled the request
    if (volunteerClaim.shelter_request_status === "fulfilled") {
      return NextResponse.json(
        { error: "Cannot remove a fulfilled volunteer" },
        { status: 400 }
      );
    }

    // Delete the volunteer claim
    await VolunteerClaim.deleteOne({ _id: volunteerClaim._id });

    console.log("Volunteer removed from shelter request:", volunteerClaim);

    // Emit WebSocket event to notify the volunteer
    const volunteerSocketId = connectedUsers.get(volunteer_id);
    if (volunteerSocketId) {
      io.to(volunteerSocketId).emit("volunteer_removed", {
        shelter_request_id: shelterRequestId,
        donation_id,
        volunteer_id,
      });
      console.log(`Real-time update sent to volunteer ${volunteer_id}`);
    }

    return NextResponse.json(
      { message: "Volunteer removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing volunteer:", error);
    return NextResponse.json(
      { error: "Failed to remove volunteer" },
      { status: 500 }
    );
  }
}
