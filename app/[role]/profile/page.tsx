"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import defaultProfileIcon from "@/public/defaultProfile.png";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  // State for form fields
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(
    defaultProfileIcon.src
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user profile details
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const res = await fetch("/api/user/details", {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setName(data.name ?? "");
        setPhone(data.phone ?? "");
        setLocation(data.location ?? "");
        setProfileImage(data.profileImage || defaultProfileIcon.src);
      } catch (error) {
        toast.error("Error fetching profile.");
      }
    };

    fetchProfile();
  }, [session?.user?.id]);

  // Handle Profile Update
  const handleProfileUpdate = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/details", {
        method: "POST",
        body: JSON.stringify({ name, phone, location }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to update profile.");
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Error updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/user/details", {
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (!data.profileImage) throw new Error("Invalid response from server");

      setProfileImage(data.profileImage || defaultProfileIcon.src);
      toast.success("Profile image updated!");
    } catch (error) {
      toast.error("Error uploading image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-lg p-6 mx-auto bg-white rounded-md shadow-md">
      <h2 className="mb-4 text-2xl font-semibold text-center">Profile</h2>

      {/* Back Button */}
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        ← Back
      </Button>

      <div className="space-y-4">
        {/* Profile Image Upload */}
        <div className="flex flex-col items-center">
          <Avatar className="w-24 h-24">
            {isUploading ? (
              <Skeleton className="w-24 h-24 rounded-full" />
            ) : (
              <AvatarImage src={profileImage || undefined} alt="Profile" />
            )}
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
          <Label className="px-4 py-2 mt-2 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300">
            Change Picture
            <Input
              type="file"
              className="hidden"
              onChange={handleImageUpload}
            />
          </Label>
        </div>

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
          <Input value={session?.user?.email ?? ""} disabled />
        </div>

        {/* Role (Disabled) */}
        <div>
          <Label>Role</Label>
          <Input value={session?.user?.role ?? ""} disabled />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleProfileUpdate}
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
