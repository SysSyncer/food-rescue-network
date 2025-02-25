"use client";

import { useState } from "react";
import { useSignupStore } from "@/store/useSignupStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

const SignupStep3 = () => {
  const { name, email, password, role, profileImage } = useSignupStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, profileImage }),
      });

      if (!res.ok) throw new Error("Signup failed");

      toast.success("Signup successful!");
      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error || null;
      toast.error(message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Review & Submit</h2>
      <p>
        <strong>Name:</strong> {name}
      </p>
      <p>
        <strong>Email:</strong> {email}
      </p>
      <p>
        <strong>Role:</strong> {role}
      </p>
      {profileImage && (
        <Image
          src={profileImage}
          alt="Profile"
          className="w-20 h-20 rounded-full mx-auto"
        />
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => useSignupStore.setState({ step: 2 })}
        >
          Back
        </Button>
        <Button onClick={handleSignup} disabled={loading}>
          {loading ? "Signing up..." : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default SignupStep3;
