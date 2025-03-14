import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import VolunteerClaim from "@/models/VolunteerClaim";
import FoodDonation from "@/models/FoodDonation";
import { io, connectedUsers } from "@/server";
import mongoose from "mongoose";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { claimId: string } }
) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "volunteer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const claimId = new mongoose.Types.ObjectId(params.claimId);
    const volunteerId = new mongoose.Types.ObjectId(session.user.id);

    // Find the VolunteerClaim entry
    const claim = await VolunteerClaim.findOne({
      _id: claimId,
      volunteer_id: volunteerId,
    });

    if (!claim) {
      return NextResponse.json(
        { error: "Claim not found or unauthorized" },
        { status: 404 }
      );
    }

    const donationId = claim.donation_id.toString();

    // Fetch the FoodDonation entry to get donor_id
    const donation = await FoodDonation.findById(donationId).select("donor_id");

    if (!donation) {
      return NextResponse.json(
        { error: "Associated donation not found" },
        { status: 404 }
      );
    }

    const donorId = donation.donor_id.toString();

    // Remove volunteer from VolunteerClaim model
    await VolunteerClaim.deleteOne({ _id: claimId });

    // Update FoodDonation model: Remove volunteer from claimed_volunteers
    await FoodDonation.findByIdAndUpdate(donationId, {
      $pull: { claimed_volunteers: volunteerId },
    });

    // Emit WebSocket event to notify the donor
    const donorSocketId = connectedUsers.get(donorId);
    if (donorSocketId) {
      io.to(donorSocketId).emit("volunteer_cancelled_claim", {
        donationId,
        volunteerId: session.user.id,
      });
    }

    return NextResponse.json(
      { message: "Claim successfully canceled" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error canceling claim:", error);
    return NextResponse.json(
      { error: "Failed to cancel claim" },
      { status: 500 }
    );
  }
}
