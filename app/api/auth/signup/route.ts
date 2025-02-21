import { NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import User from "@/models/UserModel";

// Signup handler
export async function POST(req: Request) {
  try {
    await connectMongo();

    const { name, email, password, role, phone, location } = await req.json();

    // Check for missing fields
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Create the user
    const newUser = new User({
      name,
      email,
      password,
      role,
      phone,
      location,
    });

    await newUser.save();

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}