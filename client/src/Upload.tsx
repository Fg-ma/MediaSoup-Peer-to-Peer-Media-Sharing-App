import React, { useState } from "react";

export default function Upload() {
  // Define state types
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setVideoFile(file);
    }
  };

  // Handle the file upload
  const handleUpload = async () => {
    if (!videoFile) {
      alert("Please select a video file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", videoFile);

    setIsUploading(true);

    try {
      const response = await fetch("https://localhost:8045/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("File uploaded successfully");
      } else {
        console.error("File upload failed");
      }
    } catch (error) {
      console.error("Error during file upload:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='flex items-center justify-center flex-col'>
      <input type='file' accept='video/*' onChange={handleFileChange} />
      {videoFile && <p>Selected file: {videoFile.name}</p>}
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </button>
      {isUploading && (
        <div>
          <p>Upload Progress: {uploadProgress}%</p>
        </div>
      )}
    </div>
  );
}
