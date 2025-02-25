"use client";

import { useSignupStore } from "@/store/useSignupStore";
import StepIndicator from "@/components/stepIndicator";
import SignupStep1 from "@/components/volunteer/SignupStep1";
import SignupStep2 from "@/components/volunteer/SignupStep2";
import SignupStep3 from "@/components/volunteer/SignupStep3";

export default function SignupPage() {
  const step = useSignupStore((state) => state.step);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <StepIndicator />
      {step === 1 ? (
        <SignupStep1 />
      ) : step === 2 ? (
        <SignupStep2 />
      ) : (
        <SignupStep3 />
      )}
    </div>
  );
}
