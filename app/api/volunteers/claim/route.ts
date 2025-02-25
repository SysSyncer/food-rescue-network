import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import FoodDonation from "@/models/FoodDonation";
import VolunteerAssignment from "@/models/VolunteerClaim";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { io } from "@/server"; // WebSocket for real-time updates

export async function POST(request: NextRequest) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  // Ensure the user is authenticated and is a volunteer
  if (!session || session.user.role !== "volunteer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { donation_id } = await request.json();

    // Validate donation ID
    if (!donation_id) {
      return NextResponse.json(
        { error: "Donation ID is required" },
        { status: 400 }
      );
    }

    // Check if the donation exists and is available
    const donation = await FoodDonation.findById(donation_id);
    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    if (donation.status !== "available") {
      return NextResponse.json(
        { error: "Donation is not available for claiming" },
        { status: 400 }
      );
    }

    // Check if the volunteer already claimed this donation
    const existingAssignment = await VolunteerAssignment.findOne({
      volunteer_id: session.user.id,
      donation_id: donation._id,
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "You have already claimed this donation" },
        { status: 400 }
      );
    }

    // Assign the donation to the volunteer
    const assignment = await VolunteerAssignment.create({
      volunteer_id: session.user.id,
      donation_id: donation._id,
      status: "claimed", // ✅ Changed from "assigned" to "claimed"
    });

    // Update the donation status to "claimed"
    donation.status = "claimed"; // ✅ Changed from "assigned"
    await donation.save();

    // Emit WebSocket event for real-time updates
    io.emit("donationStatusUpdated", {
      donationId: donation._id,
      status: "claimed", // ✅ Ensure consistency
    });

    return NextResponse.json({
      message: "Donation claimed successfully",
      assignment,
    });
  } catch (error) {
    console.error("Error claiming donation:", error);
    return NextResponse.json(
      { error: "Failed to claim donation" },
      { status: 500 }
    );
  }
}
