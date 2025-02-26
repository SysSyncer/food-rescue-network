import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectMongo from "@/lib/connectMongo";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, location } = await req.json();

    if (!name || !phone || !location) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    await connectMongo();
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { name, phone, location },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Profile updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
