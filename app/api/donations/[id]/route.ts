// path: app/api/donations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import FoodDonation from "@/models/FoodDonationModel";
import { getServerSession } from "next-auth";
// import authOptions from "@/lib/authOptions"; // Adjust the path if needed
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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