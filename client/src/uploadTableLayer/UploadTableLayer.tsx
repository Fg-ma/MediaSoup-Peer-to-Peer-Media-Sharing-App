import React, { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useUserInfoContext } from "../context/userInfoContext/UserInfoContext";

export default function UploadTableLayer() {
  const { table_id } = useUserInfoContext();

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [draggingFiles, setDraggingFiles] = useState(false);
  const uploadRef = useRef<HTMLDivElement | null>(null);
  const file = useRef<File | undefined>(undefined);

  const handleFileUpload = async () => {
    if (!file.current) {
      return;
    }

    const url = `https://localhost:8045/upload/${
      table_id.current
    }/${uuidv4()}/true`;
    const formData = new FormData();
    formData.append("file", file.current);

    try {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", url, true);

      xhr.send(formData);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const newFile = droppedFiles[0];
      file.current = newFile;
      setDraggingFiles(false);
      handleFileUpload();
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();

    if (uploadRef.current) {
      const rect = uploadRef.current.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const relativeY = event.clientY - rect.top;

      // Save the relative position in the ref
      setPosition({ x: relativeX, y: relativeY });
    }
  };

  return (
    <div
      ref={uploadRef}
      className='w-full h-full abosulte top-0 left-0 bg-transparent pointer-events-none'
      onDragEnter={() => setDraggingFiles(true)}
      onDragLeave={() => setDraggingFiles(false)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {draggingFiles && (
        <div
          className='absolute w-1/6 aspect-video bg-fg-primary-desaturated-2 bg-opacity-75 border-4 border-fg-primary-desaturated border-dashed rounded-md'
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            pointerEvents: "none",
          }}
        ></div>
      )}
    </div>
  );
}
