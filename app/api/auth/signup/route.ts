import { NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import User from "@/models/User";
import argon2 from "argon2";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, profileImage } = await req.json();

    await connectMongo();

    const existingUser = await User.findOne({ email, role });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await argon2.hash(password);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      profileImage,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
