"use client";

import { useState } from "react";
import { useSignupStore } from "@/store/useSignupStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils"; // Helper for conditional classNames

const roles = ["donor", "volunteer", "shelter"];

const SignupStep1 = () => {
  const { name, email, password, role, setFormData, setStep } =
    useSignupStore();
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleNext = () => {
    if (!name || !email || !password || !role) return;
    if (password !== confirmPassword) return alert("Passwords do not match!");
    setStep(2);
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setFormData({ name: e.target.value })}
      />
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setFormData({ email: e.target.value })}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setFormData({ password: e.target.value })}
      />
      <Input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <div className="flex space-x-2">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() =>
              setFormData({ role: r as "donor" | "volunteer" | "shelter" })
            }
            className={cn(
              "px-4 py-2 border rounded-md text-sm",
              role === r ? "bg-blue-500 text-white" : "bg-gray-100"
            )}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      <Button
        className="w-full"
        onClick={handleNext}
        disabled={!name || !email || !password || !role}
      >
        Next
      </Button>
    </div>
  );
};

export default SignupStep1;
