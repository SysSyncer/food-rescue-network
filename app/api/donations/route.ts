import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import FoodDonation from "@/models/FoodDonation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { io, connectedUsers } from "@/server"; // Import WebSocket server

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
    const socketId = connectedUsers.get(session.user.id);
    console.log("Socket id: ", socketId);
    if (socketId) {
      io.to(socketId).emit("donation_created", donation);
      console.log(`Real-time update sent to donor ${session.user.id}`);
    }

    return NextResponse.json(donation, { status: 201 });
  } catch (error) {
    console.error("Error creating donation:", error);
    return NextResponse.json(
      { error: "Failed to create donation" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "donor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Fetch all donations by the logged-in donor (lean for better performance)
    const donations = await FoodDonation.find({ donor_id: session.user.id })
      .select(
        "food_type quantity pickup_address expiry_date claimed_volunteers image_url volunteer_pool_size status createdAt"
      )
      .lean();

    return NextResponse.json(donations, { status: 200 });
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
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
      return NextResponse.json(
        { error: "Donation ID is required" },
        { status: 400 }
      );
    }

    // Find the donation and verify ownership
    const donation = await FoodDonation.findOne({
      _id: donationId,
      donor_id: session.user.id,
    });

    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found or unauthorized" },
        { status: 404 }
      );
    }

    // Notify claimed volunteers if any
    if (donation.claimed_volunteers?.length > 0) {
      donation.claimed_volunteers.forEach((volunteerId) => {
        const volunteerIdStr = volunteerId.toString(); // Convert ObjectId to string
        const socketId = connectedUsers.get(volunteerIdStr);

        if (socketId) {
          io.to(socketId).emit("donation_deleted", { donationId });
          console.log(
            `Notified volunteer ${volunteerIdStr} about donation deletion`
          );
        }
      });
    }

    // Delete the donation
    await FoodDonation.deleteOne({ _id: donationId });

    // Notify donor that the deletion was successful
    const donorSocketId = connectedUsers.get(session.user.id);
    if (donorSocketId) {
      io.to(donorSocketId).emit("donation_removed", { donationId });
      console.log(`Notified donor ${session.user.id} about donation removal`);
    }

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
