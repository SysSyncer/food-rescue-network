"use client";

import { useState } from "react";
import UploadProgress from "@/components/UploadProgress";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface SignupStep2Props {
  onNext: (imageUrl: string) => void;
  onBack: () => void;
}

const SignupStep2: React.FC<SignupStep2Props> = ({ onNext, onBack }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleUploadComplete = (url: string) => {
    setImageUrl(url);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <h2 className="text-xl font-semibold">Upload Profile Picture</h2>
      <UploadProgress onUploadComplete={handleUploadComplete} />

      {imageUrl && (
        <Image
          src={imageUrl}
          alt="Profile"
          className="w-20 h-20 mt-2 rounded-full"
          width={80}
          height={80}
        />
      )}

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button disabled={!imageUrl} onClick={() => onNext(imageUrl!)}>
          Next
        </Button>
        <SignupStep2
          onNext={(imageUrl) => console.log("Next step with:", imageUrl)}
          onBack={() => console.log("Going back")}
        />
      </div>
    </div>
  );
};

export default SignupStep2;
