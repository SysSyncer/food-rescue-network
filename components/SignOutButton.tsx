"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    toast.success("You have signed out!");

    await signOut({ redirect: false }); // Prevents auto redirect

    setTimeout(() => {
      router.push("/signin"); // Manually redirect
    }, 1500);
  };

  return (
    <Button variant="outline" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
