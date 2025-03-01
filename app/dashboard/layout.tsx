"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // ✅ Import Sonner for notifications
import { Badge } from "@/components/ui/badge";

interface IChildren {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: IChildren) {
  const { data: session } = useSession();
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!session?.user) return; // ✅ Prevent API call if user is not available

      try {
        const res = await fetch("/api/user/details");

        if (!res.ok) throw new Error("Failed to fetch user details");

        const data = await res.json();
        setName(data.name || "");
        setProfileImage(data.profileImage || null);
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to load profile image. Try again later.");
      }
    };

    fetchUserDetails();
  }, [session]);

  const handleProfile = () => {
    if (!session?.user?.role) return;
    router.push(`/${session.user.role}/profile`);
  };

  const handleSignOut = async () => {
    toast.success("You have signed out!");
    await signOut({ redirect: false });
    router.push("/signin");
  };

  const getGreetings = () => {
    const hours = new Date().getHours();
    if (hours >= 0 && hours < 12) return "Good Morning";
    if (hours >= 12 && hours < 16) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="flex justify-center min-h-screen">
      <div className="container max-w-[90%]">
        <nav className="flex items-center justify-between py-2 mt-4 mb-5 bg-white rounded-md">
          {/* Left Side: Welcome Message */}
          <div className="font-semibold sm:max-w-[180px] md:max-w-[240px] md:text-2xl text-xl">
            {`${getGreetings()}, ${name}`}
          </div>

          {/* Right Side: Role Badge + Profile Dropdown */}
          <div className="flex items-center gap-4">
            {/* Role Badge */}
            {session?.user?.role && (
              <Badge variant="outline">
                {session.user.role.charAt(0).toUpperCase() +
                  session.user.role.slice(1)}
              </Badge>
            )}

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={profileImage || "/defaultProfile.png"}
                    alt="Profile"
                  />
                  <AvatarFallback>
                    {name ? name.charAt(0).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={handleProfile}>
                  <User size={16} />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut size={16} />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
        {children}
      </div>
    </div>
  );
}
