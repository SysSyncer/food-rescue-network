import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import FoodDonation from "@/models/FoodDonation";
import VolunteerClaim from "@/models/VolunteerClaim";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { io, connectedUsers } from "@/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { donationId: string } }
) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "volunteer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const donation = await FoodDonation.findById(params.donationId);
    if (!donation || donation.status !== "available") {
      return NextResponse.json(
        { error: "Donation not available" },
        { status: 400 }
      );
    }

    // Check if volunteer already claimed this donation
    const existingClaim = await VolunteerClaim.findOne({
      volunteer_id: session.user.id,
      donation_id: donation._id,
    });
    if (existingClaim) {
      return NextResponse.json(
        { error: "You have already claimed this donation" },
        { status: 400 }
      );
    }

    // Ensure there is space in the volunteer pool
    if (donation.claimed_volunteers.length >= donation.volunteer_pool_size) {
      return NextResponse.json(
        { error: "Volunteer pool is full" },
        { status: 400 }
      );
    }

    // Create volunteer claim
    const volunteerClaim = await VolunteerClaim.create({
      volunteer_id: session.user.id,
      donation_id: donation._id,
      donor_request_status: "claimed",
    });

    const volunteerId = new Types.ObjectId(session.user.id);
    // Update donation's claimed volunteers count
    donation.claimed_volunteers.push(volunteerId);
    await donation.save();

    // Notify donor via WebSocket
    const socketId = connectedUsers.get(donation.donor_id.toString());
    if (socketId) {
      io.to(socketId).emit("volunteer_claimed", {
        donationId: donation._id,
        volunteerId: session.user.id,
      });
    }

    return NextResponse.json(volunteerClaim, { status: 201 });
  } catch (error) {
    console.error("Error claiming donation:", error);
    return NextResponse.json(
      { error: "Failed to claim donation" },
      { status: 500 }
    );
  }
}
