"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import defaultProfileIcon from "@/public/defaultProfile.png";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, update } = useSession();

  // State for form fields (Ensure no undefined values)
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Ensure session updates the state correctly
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setPhone(session.user.phone || "");
      setLocation(session.user.location || "");
      setProfileImage(session.user.profileImage || "");
    }
  }, [session]);

  // Handle Profile Update
  const handleProfileUpdate = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        body: JSON.stringify({ name, phone, location }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update profile.");

      toast.success("Profile updated successfully!");
      update(); // Refresh session
    } catch (error) {
      toast.error("Error updating profile.");
    }
  };

  // Handle Profile Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true); // Start uploading
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL!, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload failed");

      setProfileImage(data.secure_url);

      // Update profile image in DB
      await fetch("/api/profile/image", {
        method: "PATCH",
        body: JSON.stringify({ profileImage: data.secure_url }),
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Profile image updated!");
      update(); // Refresh session
    } catch (error) {
      toast.error("Error uploading image.");
    } finally {
      setIsUploading(false); // Upload finished
    }
  };

  return (
    <div className="max-w-lg p-6 mx-auto bg-white rounded-md shadow-md">
      <h2 className="mb-4 text-2xl font-semibold text-center">Profile</h2>

      {/* Profile Image Upload */}
      <div className="flex flex-col items-center gap-3">
        <Image
          src={profileImage || defaultProfileIcon}
          alt="Profile Image"
          width={100}
          height={100}
          className="border rounded-full"
        />
        <Input
          type="file"
          onChange={handleImageUpload}
          disabled={isUploading}
        />
        {isUploading && <p className="text-sm text-gray-500">Uploading...</p>}
      </div>

      <div className="mt-4 space-y-4">
        {/* Name */}
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {/* Phone */}
        <div>
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        {/* Location */}
        <div>
          <Label>Location</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Email (Disabled) */}
        <div>
          <Label>Email</Label>
          <Input value={session?.user?.email || ""} disabled />
        </div>

        {/* Role (Disabled) */}
        <div>
          <Label>Role</Label>
          <Input value={session?.user?.role || ""} disabled />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleProfileUpdate}
          className="w-full"
          disabled={isUploading}
        >
          {isUploading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
