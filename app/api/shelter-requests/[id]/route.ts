import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import ShelterRequest from "@/models/ShelterRequest";
import VolunteerClaim from "@/models/VolunteerClaim";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { io } from "@/server";
import mongoose from "mongoose";

// GET: Fetch a single shelter request by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "shelter") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
  }

  try {
    const shelterRequest = await ShelterRequest.findOne({
      _id: id,
      shelter_id: session.user.id,
    })
      .select("food_type quantity status createdAt")
      .lean();

    if (!shelterRequest) {
      return NextResponse.json(
        { error: "Shelter request not found" },
        { status: 404 }
      );
    }

    // Fetch volunteers for this request
    const volunteers = await VolunteerClaim.find({ shelter_request_id: id })
      .populate("volunteer_id", "name profileImage") // Get volunteer details
      .select(
        "volunteer_id shelter_request_status donor_request_status claimedAt"
      )
      .lean();

    return NextResponse.json(
      { ...shelterRequest, volunteers },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching shelter request:", error);
    return NextResponse.json(
      { error: "Failed to fetch shelter request" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a shelter request
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectMongo();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "shelter") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const deletedRequest = await ShelterRequest.findByIdAndDelete(params.id);
    if (!deletedRequest)
      return NextResponse.json(
        { error: "Shelter request not found" },
        { status: 404 }
      );

    io.emit("shelter_request_deleted", { id: params.id }); // WebSocket update

    return NextResponse.json(
      { message: "Shelter request deleted" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
