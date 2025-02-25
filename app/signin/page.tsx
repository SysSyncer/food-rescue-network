"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { useToast } from "@/hooks/use-toast";
import { toast, Toaster } from "sonner";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Sign-In Failed", {
        description: result.error,
      });
    } else {
      toast.success("Sign-In Successful", {
        description: "Welcome back!",
      });
      router.push("/dashboard");
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full font-semibold">
                Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-center">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-green-700 underline focus:text-green-500"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
