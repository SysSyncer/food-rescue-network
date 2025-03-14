import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import FoodDonation from "@/models/FoodDonation";
// import UserDetails from "@/models/UserDetails";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "volunteer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Fetch only available donations that haven't reached the volunteer pool limit
    const availableDonations = await FoodDonation.find({
      status: "available",
      $expr: { $lt: ["$claimed_volunteers_count", "$volunteer_pool_size"] }, // ✅ Ensuring available spots for volunteers
    }).select(
      "food_type quantity pickup_address expiry_date image_url volunteer_pool_size claimed_volunteers_count createdAt"
    );

    const donations = await FoodDonation.find({});
    console.log("\n\n", donations, "\n\n");
    console.log("\n\n", availableDonations, "\n\n");

    return NextResponse.json(availableDonations, { status: 200 });
  } catch (error) {
    console.error("Error fetching available donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch available donations" },
      { status: 500 }
    );
  }
}
