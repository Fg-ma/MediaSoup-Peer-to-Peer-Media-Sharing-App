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

  // Handle drag over event to allow drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Optionally, you can add styles to show drop zone active (e.g., change color)
  };

  // Handle drag leave event (optional, to reset styles)
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Reset styles here if necessary
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const file = droppedFiles[0];
      setFile(file); // Set the file to the state (or handle it further)
      console.log("Dropped file:", file);
    }
  };

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          width: "300px",
          height: "200px",
          border: "2px dashed #aaa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9f9f9",
          color: "#aaa",
          cursor: "pointer",
        }}
      >
        <p>{file ? file.name : "Drag a file here or select one"}</p>
      </div>

      <input
        type='file'
        onChange={handleFileChange}
        style={{ marginTop: "10px" }}
      />
      <button onClick={handleFileUpload} style={{ marginTop: "10px" }}>
        Upload
      </button>

      {uploadProgress > 0 && <p>Progress: {uploadProgress}%</p>}
      {uploadStatus && <p>Status: {uploadStatus}</p>}
    </div>
  );
}
