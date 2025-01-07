import React, { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
  };

  const findMetadata = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const buffer = event.target!.result as ArrayBuffer;
        const data = new DataView(buffer);
        let i = 0;
        let metadata: any = { atoms: [] };

        // Iterate through the file looking for MP4 atoms
        while (i < data.byteLength) {
          if (i + 8 > data.byteLength) {
            // Ensure there's enough data to read size and type
            break;
          }

          const atomSize = data.getUint32(i); // Atom size
          const atomType = data.getUint32(i + 4); // Atom type

          // Check if atom size is valid
          if (atomSize < 8 || i + atomSize > data.byteLength) {
            reject("Invalid atom size.");
            return;
          }

          // Process known atoms
          if (atomType === 0x66747970) {
            // 'ftyp'
            metadata.atoms.push({
              type: "ftyp",
              size: atomSize,
              data: buffer.slice(i, i + atomSize),
            });
          } else if (atomType === 0x6d6f6f76) {
            // 'moov'
            metadata.moov = buffer.slice(i, i + atomSize);
          } else if (atomType === 0x6d646174) {
            // 'mdat'
            metadata.atoms.push({
              type: "mdat",
              size: atomSize,
              data: buffer.slice(i, i + atomSize),
            });
          }

          i += atomSize; // Move to the next atom
        }

        // Reject if no 'moov' atom found
        if (!metadata.moov) {
          reject("moov atom not found.");
        } else {
          resolve(metadata);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file); // Read the entire file
    });
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    const url = "https://localhost:8045/upload-video/";
    const formData = new FormData();

    formData.append("file", file);

    try {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", url, true);

      const metadataData = await findMetadata(file);
      xhr.setRequestHeader("X-Metadata", JSON.stringify(metadataData));

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(percentComplete);
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
