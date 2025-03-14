import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import VolunteerClaim from "@/models/VolunteerClaim";
import ShelterRequest from "@/models/ShelterRequest";
import { io, connectedUsers } from "@/server";
import mongoose from "mongoose";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { shelterRequestId: string } }
) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "volunteer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const shelterRequestId = new mongoose.Types.ObjectId(
      params.shelterRequestId
    );
    const volunteerId = new mongoose.Types.ObjectId(session.user.id);

    // Find the VolunteerClaim entry
    const claim = await VolunteerClaim.findOne({
      shelter_request_id: shelterRequestId,
      volunteer_id: volunteerId,
    });

    if (!claim) {
      return NextResponse.json(
        { error: "Shelter promise not found or unauthorized" },
        { status: 404 }
      );
    }

    // Fetch the ShelterRequest entry to get shelter_id
    const shelterRequest = await ShelterRequest.findById(
      shelterRequestId
    ).select("shelter_id");

    if (!shelterRequest) {
      return NextResponse.json(
        { error: "Associated shelter request not found" },
        { status: 404 }
      );
    }

    const shelterId = shelterRequest.shelter_id.toString();

    // Remove volunteer from VolunteerClaim model
    await VolunteerClaim.deleteOne({ _id: claim._id });

    // Update ShelterRequest model: Remove volunteer from promised_volunteers
    await ShelterRequest.findByIdAndUpdate(shelterRequestId, {
      $pull: { promised_volunteers: volunteerId },
    });

    // Emit WebSocket event to notify the shelter
    const shelterSocketId = connectedUsers.get(shelterId);
    if (shelterSocketId) {
      io.to(shelterSocketId).emit("volunteer_cancelled_promise", {
        shelterRequestId,
        volunteerId: session.user.id,
      });
    }

    return NextResponse.json(
      { message: "Promise successfully canceled" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error canceling promise:", error);
    return NextResponse.json(
      { error: "Failed to cancel promise" },
      { status: 500 }
    );
  }
}
