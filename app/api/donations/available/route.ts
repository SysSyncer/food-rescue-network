import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import FoodDonation from "@/models/FoodDonation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  // Ensure the user is authenticated and is a volunteer
  if (!session || session.user.role !== "volunteer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const availableDonations = await FoodDonation.find({ status: "available" });

    return NextResponse.json(availableDonations);
  } catch (error) {
    console.error("Error fetching available donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}
