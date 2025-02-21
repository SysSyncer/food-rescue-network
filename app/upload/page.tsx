"use client";

import { useState } from "react";

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus(`Image uploaded successfully: ${data.url}`);
      } else {
        setUploadStatus(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      setUploadStatus("An error occurred during upload.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">Upload Image</h1>
      <input type="file" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        className="px-4 py-2 mt-2 text-white bg-blue-500 rounded"
      >
        Upload
      </button>
      {uploadStatus && <p className="mt-4">{uploadStatus}</p>}
    </div>
  );
};

export default UploadPage;
