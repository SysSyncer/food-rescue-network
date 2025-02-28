import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    console.log(`Received ${files.length} files for upload.`);

    const uploadPromises = files.map(async (file) => {
      try {
        // Validate file type (only images allowed)
        if (!file.type.startsWith("image/")) {
          throw new Error(`Invalid file type: ${file.type}`);
        }

        // Convert file to a Buffer
        const arrayBuffer = await file.arrayBuffer();
        let buffer = Buffer.from(arrayBuffer);

        // Compress & resize image using sharp
        buffer = await sharp(buffer)
          .resize(800, 600, { fit: "inside" }) // Resize while maintaining aspect ratio
          .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
          .toBuffer();

        // Upload to Cloudinary using streams
        return new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "food_donation" },
            (error, result) => {
              if (error) {
                console.error(`Upload failed for ${file.name}:`, error);
                reject(error);
              } else {
                console.log(`Upload success: ${result?.secure_url}`);
                resolve(result?.secure_url as string);
              }
            }
          );

          uploadStream.end(buffer);
        });
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        return null;
      }
    });

    // Wait for all uploads to complete
    const imageUrls = (await Promise.all(uploadPromises)).filter(Boolean);

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: "All uploads failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrls });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
