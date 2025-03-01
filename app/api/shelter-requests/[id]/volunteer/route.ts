import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import VolunteerClaim from "@/models/VolunteerClaim";
import ShelterRequest from "@/models/ShelterRequest";
import FoodDonation from "@/models/FoodDonation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { io, connectedUsers } from "@/server"; // WebSocket server

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  // Ensure the user is a volunteer
  if (!session || session.user.role !== "volunteer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const shelterRequestId = params.id;
    const { donation_id } = await req.json(); // Volunteer must specify which donation they're promising

    // Ensure donation_id is provided
    if (!donation_id) {
      return NextResponse.json(
        { error: "Donation ID is required" },
        { status: 400 }
      );
    }

    // Check if the shelter request exists
    const shelterRequest = await ShelterRequest.findById(shelterRequestId);
    if (!shelterRequest) {
      return NextResponse.json(
        { error: "Shelter request not found" },
        { status: 404 }
      );
    }

    // Check if the donation exists
    const donation = await FoodDonation.findById(donation_id);
    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    // Ensure the volunteer hasn't already promised this donation for this request
    const existingClaim = await VolunteerClaim.findOne({
      volunteer_id: session.user.id,
      shelter_request_id: shelterRequestId,
      donation_id: donation_id,
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: "You have already promised this donation for this request" },
        { status: 400 }
      );
    }

    // Create a new VolunteerClaim
    const volunteerClaim = await VolunteerClaim.create({
      volunteer_id: session.user.id,
      shelter_request_id: shelterRequestId,
      donation_id,
      shelter_request_status: "promised",
      donor_request_status: "claimed",
    });

    console.log("Volunteer claimed a shelter request:", volunteerClaim);

    // Emit WebSocket event to notify the shelter about the new promise
    const shelterSocketId = connectedUsers.get(
      shelterRequest.shelter_id.toString()
    );
    if (shelterSocketId) {
      io.to(shelterSocketId).emit("volunteer_promised", {
        shelter_request_id: shelterRequestId,
        volunteer_id: session.user.id,
        donation_id,
        shelter_request_status: "promised",
        donor_request_status: "claimed",
      });
      console.log(
        `Real-time update sent to shelter ${shelterRequest.shelter_id}`
      );
    }

    return NextResponse.json(volunteerClaim, { status: 201 });
  } catch (error) {
    console.error("Error processing volunteer promise:", error);
    return NextResponse.json(
      { error: "Failed to process volunteer promise" },
      { status: 500 }
    );
  }
}
