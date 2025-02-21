import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import FoodDonation from "@/models/FoodDonationModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "donor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const data = await request.json();
    console.log("Received data:", data); // For debugging

    // Ensure all required fields are present
    if (
      !data.title ||
      !data.description ||
      !data.quantity ||
      !data.pickup_address ||
      !data.expiry_date
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Collect the image URLs (ensure it's an array, even if no images are uploaded)
    const imageUrls = data.images || [];

    // Assign donor_id and images to the data
    data.donor_id = session.user.id;
    data.images = imageUrls;

    // Create the donation document
    const donation = await FoodDonation.create(data);
    return NextResponse.json(donation);
  } catch (error) {
    console.error("Error creating donation:", error); // For debugging
    return NextResponse.json({ error: "Failed to create donation" }, { status: 500 });
  }
}