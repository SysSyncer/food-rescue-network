"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

export default function VolunteerNavbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
      {/* Left Side: Welcome Message */}
      <div className="text-lg font-semibold">
        {session?.user?.name ? `Welcome, ${session.user.name}` : "Welcome"}
      </div>

      {/* Right Side: Role Badge & Profile Icon */}
      <div className="flex items-center gap-4">
        <Badge variant="outline">Volunteer</Badge>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={session?.user?.image || ""} alt="Profile" />
              <AvatarFallback>
                {session?.user?.name?.charAt(0) || "V"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
