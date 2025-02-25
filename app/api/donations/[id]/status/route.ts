import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/connectMongo";
import { Types } from "mongoose"; // Import Types
import FoodDonation from "@/models/FoodDonation";
import VolunteerAssignment from "@/models/VolunteerClaim";
import { io } from "@/server"; // Import the WebSocket server

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { params } = context;
    const { id } = params; // Fix: Extract ID correctly
    const { status } = await request.json();
    const userId = new Types.ObjectId(session.user.id);
    const userRole = session.user.role;

    // Allowed status transitions
    const statusFlow: Record<string, string[]> = {
      available: ["claimed"],
      claimed: ["in transit"],
      "in transit": ["delivered"],
      delivered: ["confirmed"],
      confirmed: [], // No transitions after confirmed
    };

    // Validate status
    if (!Object.keys(statusFlow).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const donation = await FoodDonation.findById(id);
    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    // Ensure valid status transition
    if (
      donation.status !== status &&
      !statusFlow[donation.status].includes(status)
    ) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${donation.status} to ${status}`,
        },
        { status: 400 }
      );
    }

    // Volunteers can update the status up to "delivered"
    if (userRole === "volunteer") {
      const assignment = await VolunteerAssignment.findOne({
        donation_id: id,
        volunteer_id: userId,
      });

      if (!assignment) {
        return NextResponse.json(
          { error: "You are not assigned to this donation" },
          { status: 403 }
        );
      }
    }

    // Handle confirmation logic for "delivered"
    if (status === "delivered") {
      if (
        !donation.confirmedBy.some(
          (objId) => objId.toString() === userId.toString()
        )
      ) {
        donation.confirmedBy.push(userId);
      }

      if (donation.confirmedBy.length >= 2) {
        donation.status = "confirmed"; // Fully confirmed
      } else {
        donation.status = "delivered"; // Waiting for second confirmation
      }
    } else {
      donation.status = status;
    }

    await donation.save();

    // Emit WebSocket event
    io.emit("donationStatusUpdated", {
      donationId: id,
      status: donation.status,
    });

    return NextResponse.json({
      message: "Donation status updated successfully",
      status: donation.status,
    });
  } catch (error) {
    console.error("Error updating donation status:", error);
    return NextResponse.json(
      { error: "Failed to update donation status" },
      { status: 500 }
    );
  }
}
