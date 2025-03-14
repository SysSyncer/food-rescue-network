import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import FoodDonation from "@/models/FoodDonation";
import { getServerSession } from "next-auth";
import VolunteerClaim from "@/models/VolunteerClaim";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "donor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const donationId = searchParams.get("donationId");

    if (!donationId) {
      return NextResponse.json(
        { error: "Donation ID is required" },
        { status: 400 }
      );
    }

    const donation = await FoodDonation.findById(donationId)
      .populate({ path: "donor_id", select: "email" }) // ✅ Simplified
      .populate({
        path: "claimed_volunteers",
        model: "VolunteerClaim",
        populate: { path: "volunteer_id", select: "name email" }, // ✅ Simplified
      })
      .lean();

    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    if (donation.donor_id.toString() !== session.user.id) {
      // ✅ Optimized
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(donation, { status: 200 });
  } catch (error) {
    console.error("Error fetching donation:", error);
    return NextResponse.json(
      { error: "Failed to fetch donation" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "donor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const data = await request.json();
    console.log("Received data:", data); // Debugging

    // Validate required fields
    if (
      !data.food_type ||
      !data.image_url ||
      !data.quantity ||
      !data.pickup_address ||
      !data.expiry_date ||
      !data.volunteer_pool_size
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate numeric values
    if (isNaN(data.quantity) || isNaN(data.volunteer_pool_size)) {
      return NextResponse.json(
        { error: "Quantity and Volunteer Pool Size must be numbers" },
        { status: 400 }
      );
    }

    // Ensure image_url is an array
    const imageUrls = Array.isArray(data.image_url) ? data.image_url : [];

    // Ensure expiry_date is a valid Date
    const expiryDate = new Date(data.expiry_date);
    if (isNaN(expiryDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid expiry date format" },
        { status: 400 }
      );
    }

    // Create donation object
    const donationData = {
      donor_id: session.user.id,
      donation_description: data.donation_description,
      food_type: data.food_type,
      quantity: Number(data.quantity),
      pickup_address: data.pickup_address,
      expiry_date: expiryDate,
      image_url: imageUrls,
      volunteer_pool_size: Number(data.volunteer_pool_size),
      status: "available", // Default status
    };

    // Save donation to database
    const donation = await FoodDonation.create(donationData);
    console.log("Created donation document: ", donation);

    // Emit WebSocket event to notify donor of new donation
    // const socketId = connectedUsers.get(session.user.id);
    // console.log("Socket id: ", socketId);
    // if (socketId) {
    //   io.to(socketId).emit("donation_created", donation);
    //   console.log(`Real-time update sent to donor ${session.user.id}`);
    // }

    return NextResponse.json(donation, { status: 201 });
  } catch (error) {
    console.error("Error creating donation:", error);
    return NextResponse.json(
      { error: "Failed to create donation" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "donor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const donationId = searchParams.get("donationId");

    if (!donationId) {
      // ✅ Added Validation
      return NextResponse.json(
        { error: "Donation ID is required" },
        { status: 400 }
      );
    }

    const donation = await FoodDonation.findById(donationId);
    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    if (donation.donor_id.toString() !== session.user.id) {
      // ✅ Optimized
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const volunteerClaims = await VolunteerClaim.find({
      donation_id: donationId,
    });

    if (volunteerClaims.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete. Volunteers have already claimed this donation.",
        },
        { status: 400 }
      );
    }

    await FoodDonation.findByIdAndDelete(donationId);

    return NextResponse.json(
      { message: "Donation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting donation:", error);
    return NextResponse.json(
      { error: "Failed to delete donation" },
      { status: 500 }
    );
  }
}
