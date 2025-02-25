import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import FoodDonation from "@/models/FoodDonation";
import VolunteerAssignment from "@/models/VolunteerClaim";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "volunteer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const volunteerId = searchParams.get("volunteer_id");

    if (!volunteerId) {
      return NextResponse.json(
        { error: "Volunteer ID is required" },
        { status: 400 }
      );
    }

    // Fetch donations assigned to this volunteer
    const claimedDonations = await VolunteerAssignment.find({
      volunteer_id: volunteerId,
    }).populate({
      path: "donation_id",
      model: FoodDonation, // ✅ Explicitly mention the model
      select:
        "title description quantity food_type pickup_address expiry_date status", // ✅ Select specific fields
    });

    return NextResponse.json(claimedDonations);
  } catch (error) {
    console.error("Error fetching claimed donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch claimed donations" },
      { status: 500 }
    );
  }
}
