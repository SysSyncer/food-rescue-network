import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import VolunteerClaim from "@/models/VolunteerClaim";
import ShelterRequest from "@/models/ShelterRequest";
import { io, connectedUsers } from "@/server";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: { shelterRequestId: string } }
) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "volunteer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const volunteerId = new mongoose.Types.ObjectId(session.user.id);
    const shelterRequestId = new mongoose.Types.ObjectId(
      params.shelterRequestId
    );

    // Check if the shelter request exists
    const shelterRequest = await ShelterRequest.findById(shelterRequestId);
    if (!shelterRequest) {
      return NextResponse.json(
        { error: "Shelter request not found" },
        { status: 404 }
      );
    }

    // Find an active VolunteerClaim for this volunteer without a shelter request assigned
    const volunteerClaim = await VolunteerClaim.findOne({
      volunteer_id: volunteerId,
      shelter_request_id: { $exists: false }, // Only claims without a shelter request
    });

    if (!volunteerClaim) {
      return NextResponse.json(
        {
          error:
            "No active donation claim found or already linked to a shelter",
        },
        { status: 400 }
      );
    }

    // Update VolunteerClaim to link it with the shelter request
    volunteerClaim.shelter_request_id = shelterRequestId;
    volunteerClaim.shelter_request_status = "promised";
    await volunteerClaim.save();

    // Emit WebSocket event to notify the shelter
    const shelterSocketId = connectedUsers.get(
      shelterRequest.shelter_id.toString()
    );
    if (shelterSocketId) {
      io.to(shelterSocketId).emit("volunteer_promised", {
        shelterRequestId: shelterRequest._id,
        volunteerId: session.user.id,
      });
    }

    return NextResponse.json(
      { message: "Volunteer promised to shelter request successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error promising to shelter request:", error);
    return NextResponse.json(
      { error: "Failed to promise to shelter request" },
      { status: 500 }
    );
  }
}
