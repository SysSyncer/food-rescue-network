import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert the file to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary in the "profileImage" folder
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "profileImage" }, // Changed folder name
        (error, uploadResult) => {
          if (error) {
            reject(error);
          } else {
            resolve(uploadResult);
          }
        }
      );
      uploadStream.end(buffer);
    });

    // @ts-ignore: Ignore TypeScript error for dynamic properties
    return NextResponse.json({ url: (result as any).secure_url });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
