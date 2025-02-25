import { NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import ShelterRequest from "@/models/ShelterRequest";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  await connectMongo();

  // Extract shelter_id from query params
  const { searchParams } = new URL(req.url);
  const shelter_id = searchParams.get("shelter_id");

  if (!shelter_id) {
    return NextResponse.json(
      { error: "Missing shelter_id parameter" },
      { status: 400 }
    );
  }

  try {
    // Fetch all requests made by the shelter
    const requests = await ShelterRequest.find({ shelter_id }).populate(
      "donation_id"
    );

    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    console.error("Error fetching shelter requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch shelter requests" },
      { status: 500 }
    );
  }
}
