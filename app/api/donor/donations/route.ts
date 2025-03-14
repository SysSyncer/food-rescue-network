import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import VolunteerClaim from "@/models/VolunteerClaim";
import FoodDonation from "@/models/FoodDonation";
import UserDetails from "@/models/UserDetails";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "donor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const donations = await FoodDonation.find({ donor_id: session.user.id })
      .populate({
        path: "claimed_volunteers",
        model: VolunteerClaim,
        select: "volunteer_id donor_request_status shelter_request_status",
        populate: {
          path: "volunteer_id",
          model: UserDetails,
          select: "name phone",
        },
      })
      .select(
        "food_type donation_description image_url status volunteer_pool_size createdAt updatedAt"
      ) // ✅ Select only required fields
      .lean();

    console.log(donations);

    return NextResponse.json(donations, { status: 200 });
  } catch (error) {
    console.error("Error fetching donor's donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}
