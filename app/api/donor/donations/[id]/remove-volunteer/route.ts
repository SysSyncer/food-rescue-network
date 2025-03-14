import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import FoodDonation from "@/models/FoodDonation";
import VolunteerClaim from "@/models/VolunteerClaim";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { io, connectedUsers } from "@/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; volunteerId: string } }
) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "donor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id: donationId, volunteerId } = params;

    if (!donationId || !volunteerId) {
      return NextResponse.json(
        { error: "Donation ID and Volunteer ID are required" },
        { status: 400 }
      );
    }

    // Find the donation and ensure the donor owns it
    const donation = await FoodDonation.findById(donationId);
    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    if (!donation.donor_id.equals(session.user.id)) {
      // ✅ Optimized
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Remove the volunteer claim
    const volunteerClaim = await VolunteerClaim.findOneAndDelete({
      donation_id: donationId,
      volunteer_id: volunteerId,
    });

    if (!volunteerClaim) {
      return NextResponse.json(
        { error: "Volunteer claim not found" },
        { status: 404 }
      );
    }

    // Remove the volunteer from the claimed_volunteers list in FoodDonation
    await FoodDonation.findByIdAndUpdate(donationId, {
      $pull: { claimed_volunteers: volunteerClaim._id },
    });

    // Notify the volunteer via WebSocket
    const socketId = connectedUsers.get(volunteerId);
    if (socketId) {
      io.to(socketId).emit("volunteer_removed", {
        message: "You have been removed from a donation claim.",
        donationId,
      });
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
