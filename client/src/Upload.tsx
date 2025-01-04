import React, { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    const url = "https://localhost:8045"; // Your uWebSockets server URL
    const formData = new FormData();
    formData.append("file", file);

    try {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", url, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setUploadStatus("File uploaded successfully!");
        } else {
          setUploadStatus("File upload failed.");
        }
      };

      xhr.onerror = () => {
        setUploadStatus("An error occurred during the upload.");
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("An unexpected error occurred.");
    }
  };

  return (
    <div>
      <input type='file' onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload</button>
      {uploadProgress > 0 && <p>Progress: {uploadProgress}%</p>}
      {uploadStatus && <p>Status: {uploadStatus}</p>}
    </div>
  );
}
