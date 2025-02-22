// path: app/api/donations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import FoodDonation, {IFoodDonation} from "@/models/FoodDonationModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "donor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = params;

    // Find the donation by ID
    const donation = await FoodDonation.findById(id);

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // Ensure the donor is the owner
    if (donation.donor_id.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(donation);
  } catch (error) {
    console.error("Error fetching donation:", error);
    return NextResponse.json({ error: "Failed to fetch donation" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "donor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { params } = context;
    const { id } = params;
    const data = await request.json();
    console.log(data);

    // Find the existing donation
    const donation = await FoodDonation.findById(id);
    console.log(donation)
    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // Ensure the donor is the owner
    if (donation.donor_id.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Allowed fields for update
    const allowedFields: (keyof typeof donation)[] = [
      "title",
      "description",
      "quantity",
      "food_type",
      "pickup_address",
      "expiry_date",
      "images",
      "status",
    ];

    // Retain existing values for required fields if not provided in request
    allowedFields.forEach((field) => {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        data[field] = donation[field]; // Preserve previous value
      }
    });

    // Perform the update
    Object.assign(donation, data);
    console.log(donation);

    await donation.save();
    return NextResponse.json(donation);
  } catch (error) {
    console.error("Error updating donation:", error);
    return NextResponse.json({ error: "Failed to update donation" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "donor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const donation = await FoodDonation.findById(params.id);
    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // Check if the logged-in donor is the creator of the donation
    if (donation.donor_id.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedData = await request.json();
    const updatedDonation = await FoodDonation.findByIdAndUpdate(params.id, updatedData, { new: true });

    return NextResponse.json(updatedDonation);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update donation" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "donor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = params;

    // Find the donation
    const donation = await FoodDonation.findById(id);
    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // Ensure the donor is the owner
    if (donation.donor_id.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete the donation
    await FoodDonation.findByIdAndDelete(id);

    return NextResponse.json({ message: "Donation deleted successfully" });
  } catch (error) {
    console.error("Error deleting donation:", error);
    return NextResponse.json({ error: "Failed to delete donation" }, { status: 500 });
  }
}