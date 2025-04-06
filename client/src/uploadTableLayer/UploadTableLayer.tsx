import React, { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useUserInfoContext } from "../context/userInfoContext/UserInfoContext";

const staticContentServerBaseUrl = process.env.STATIC_CONTENT_SERVER_BASE_URL;

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

    const metadata = {
      table_id: table_id.current,
      contentId: uuidv4(),
      instanceId: uuidv4(),
      direction: "toTable",
      state: [],
    };

    try {
      const metaRes = await fetch(staticContentServerBaseUrl + "upload-meta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      const { uploadId } = await metaRes.json();

      const formData = new FormData();
      formData.append("file", file.current);

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        staticContentServerBaseUrl + `upload-file/${uploadId}`,
        true
      );

      xhr.send(formData);
    } catch (error) {
      console.error("Error sending metadata:", error);
    }
  };

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
