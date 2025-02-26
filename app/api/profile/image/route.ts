import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectMongo from "@/lib/connectMongo";
import User from "@/models/User";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileImage } = await req.json();

    if (!profileImage) {
      return NextResponse.json(
        { error: "Profile image URL is required." },
        { status: 400 }
      );
    }

    await connectMongo();
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { profileImage },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Profile image updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
