import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectMongo from "@/lib/connectMongo";
import UserDetails, { IUserDetails } from "@/models/UserDetails";
import { authOptions } from "../../auth/[...nextauth]/route";
import cloudinary from "@/lib/cloudinary";
import sharp from "sharp";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    const userDetails = await UserDetails.findOne({ _id: session.user.id })
      .select("name phone location profileImage")
      .lean<IUserDetails>();

    console.log(userDetails);
    if (!userDetails) {
      return NextResponse.json(
        { error: "User details not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        name: userDetails.name ?? "",
        phone: userDetails.phone ?? "",
        location: userDetails.location ?? "",
        profileImage: userDetails.profileImage ?? "",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const { name, phone, location, profileImage } = await req.json();

    const updatedUser = await UserDetails.findOneAndUpdate(
      { _id: session.user.id },
      { $set: { name, phone, location, profileImage } },
      { new: true, upsert: true } // Creates a new document if one doesn't exist
    );

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        userDetails: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// export async function PATCH(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     await connectMongo();
//     const formData = await req.formData();
//     const file = formData.get("file") as Blob | null;

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     // Convert Blob to Buffer
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // Upload to Cloudinary
//     const uploadResult = await new Promise((resolve, reject) => {
//       cloudinary.uploader
//         .upload_stream({ folder: "profile_images" }, (error, result) => {
//           if (error) reject(error);
//           else resolve(result);
//         })
//         .end(buffer);
//     });

//     // Ensure upload result has a URL
//     if (
//       !uploadResult ||
//       typeof uploadResult !== "object" ||
//       !("secure_url" in uploadResult)
//     ) {
//       throw new Error("Failed to upload image to Cloudinary");
//     }

//     const profileImage = uploadResult.secure_url;

//     await UserDetails.findOneAndUpdate(
//       { userId: session.user.id },
//       { $set: { profileImage } },
//       { new: true, upsert: true }
//     );

//     return NextResponse.json({ profileImage }, { status: 200 });
//   } catch (error) {
//     console.error("Error uploading profile image:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert Blob to Buffer
    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    // Compress & resize image using sharp
    buffer = await sharp(buffer)
      .resize(500, 500, { fit: "cover" }) // Resize to 500x500 (adjust as needed)
      .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
      .toBuffer();

    console.log("image compressed");
    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "profile_images" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    if (
      !uploadResult ||
      typeof uploadResult !== "object" ||
      !("secure_url" in uploadResult)
    ) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    const profileImage = uploadResult.secure_url;

    await UserDetails.findOneAndUpdate(
      { _id: session.user.id },
      { $set: { profileImage } },
      { new: true, upsert: true }
    );

    return NextResponse.json({ profileImage }, { status: 200 });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
