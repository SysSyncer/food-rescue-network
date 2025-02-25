"use client";

import { useSignupStore } from "@/store/useSignupStore";

const StepIndicator = () => {
  const step = useSignupStore((state) => state.step);

  return (
    <div className="text-center text-gray-500 mb-4">
      <p className="text-sm font-medium">Step {step} of 3</p>
    </div>
  );
};

export default StepIndicator;
