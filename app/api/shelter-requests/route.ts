import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import ShelterRequest from "@/models/ShelterRequest";
import VolunteerClaim from "@/models/VolunteerClaim";
import UserDetails from "@/models/UserDetails";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { io } from "@/server"; // WebSocket server

export async function POST(req: NextRequest) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  // Check if the user is a shelter
  if (!session || session.user.role !== "shelter") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    console.log("I came here");
    const data = await req.json();
    // Validate required fields
    if (!data.food_type || !data.quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure image_url is an array (in case of multiple images)
    const imageUrls = Array.isArray(data.image_url) ? data.image_url : [];

    // Create a new shelter request
    const shelterRequest = await ShelterRequest.create({
      shelter_id: session.user.id,
      food_type: data.food_type,
      request_description: data.request_description,
      quantity: Number(data.quantity),
      image_url: imageUrls,
      status: "in_need",
    });

    console.log("Created shelter request:", shelterRequest);

    // Emit WebSocket event to notify volunteers
    // io.emit("shelter_request_created", shelterRequest);

    return NextResponse.json(shelterRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating shelter request:", error);
    return NextResponse.json(
      { error: "Failed to create shelter request" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  await connectMongo();
  const session = await getServerSession(authOptions);
  // Ensure the user is a shelter
  if (!session || session.user.role !== "shelter") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const shelterRequests = await ShelterRequest.find({
      shelter_id: session.user.id,
    })
      .populate({
        path: "promised_volunteers",
        model: VolunteerClaim,
        select: "volunteer_id donor_request_status shelter_request_status",
        populate: {
          path: "volunteer_id",
          model: UserDetails,
          select: "name phone",
        },
      })
      .select(
        "food_type quantity image_url status createdAt promised_volunteers fulfilled_volunteers"
      )
      .lean();
    console.log("Hello there, ", shelterRequests);
    // Fetch volunteer counts for each request
    // const shelterRequestsWithCounts = await Promise.all(
    //   shelterRequests.map(async (request) => {
    //     const promisedCount = await VolunteerClaim.countDocuments({
    //       shelter_request_id: request._id,
    //       shelter_request_status: "promised",
    //     });

    //     const fulfilledCount = await VolunteerClaim.countDocuments({
    //       shelter_request_id: request._id,
    //       shelter_request_status: "fulfilled",
    //     });

    //     return {
    //       ...request,
    //       promised_volunteers: promisedCount,
    //       fulfilled_volunteers: fulfilledCount,
    //     };
    //   })
    // );
    // console.log(shelterRequestsWithCounts);
    // return NextResponse.json(shelterRequestsWithCounts, { status: 200 });
    return NextResponse.json(shelterRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching shelter requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch shelter requests" },
      { status: 500 }
    );
  }
}
