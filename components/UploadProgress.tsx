"use client";

import { useState } from "react";
import axios from "axios";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";

interface UploadProgressProps {
  onUploadComplete: (url: string) => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  onUploadComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState("");

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

      if (response.data.url) {
        setImageUrl(response.data.url);
        onUploadComplete(response.data.url);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div>
      <Input
        type="file"
        onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
        className="mb-5"
      />
      {progress > 0 && (
        <Progress value={progress} max={100}>
          {progress}%
        </Progress>
      )}
    </div>
  );
};

export default UploadProgress;
