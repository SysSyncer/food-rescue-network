import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("Received file:", file.name, file.type, file.size);

    // Convert file to a Base64 data URL
    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Upload directly using Cloudinary's `upload` method
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "food_donation",
    });

    console.log("Cloudinary Upload Success:", result);

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
