import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import VolunteerClaim from "@/models/VolunteerClaim";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "volunteer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const volunteerId = new mongoose.Types.ObjectId(session.user.id);

    // Fetch active claims of the volunteer
    const claims = await VolunteerClaim.find({ volunteer_id: volunteerId })
      .populate({
        path: "donation_id",
        select:
          "food_type quantity pickup_address expiry_date image_url status",
      })
      .populate({
        path: "shelter_request_id",
        select: "request_details shelter_id",
      })
      .select("donor_request_status shelter_request_status claimedAt") // Selecting only necessary fields
      .lean();

    return NextResponse.json(claims, { status: 200 });
  } catch (error) {
    console.error("Error fetching volunteer claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}
