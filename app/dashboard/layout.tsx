"use client";

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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface IChildren {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: IChildren) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleProfile = () => {
    router.push(`/${session?.user.role}/profile`);
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    toast.success("You have signed out!");
    await signOut({ redirect: false }); // Prevent auto-redirect
    router.push("/signin"); // Manually redirect
  };

  // Extract First Two Letters for Avatar Fallback
  const IconLetters = session?.user?.name
    ? session.user.name.substring(0, 2).toUpperCase()
    : ""; // Default "DN" if no name

  const getGreetings = () => {
    const hours = new Date().getHours();
    if (hours >= 0 && hours < 12) return "Good Morning";
    if (hours >= 12 && hours < 16) return "Good Afternoon";
    if (hours >= 16 && hours <= 23) return "Good Evening";
  };

  return (
    <>
      <div className="flex justify-center min-h-screen">
        <div className="container max-w-[90%]">
          <nav className="flex items-center justify-between py-2 mt-4 bg-white rounded-md">
            {/* Left Side: Welcome Message */}
            <div className="font-semibold sm:max-w-[180px] md:max-w-[240px] md:text-2xl text-xl">
              {session?.user?.name
                ? `${getGreetings()} ${session.user.name}`
                : ""}
            </div>

            {/* Right Side: Role Badge + Profile Dropdown */}
            <div className="flex items-center gap-4">
              {/* Role Badge */}
              <Badge variant="outline">{session?.user.role}</Badge>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      src={session?.user?.profileImage || ""}
                      alt="Profile"
                    />
                    <AvatarFallback>{IconLetters}</AvatarFallback>
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
          {/* <SignOutButton /> */}
        </div>
      </div>
    </>
  );
}
