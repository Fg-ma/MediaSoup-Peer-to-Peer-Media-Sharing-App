import React, { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useUserInfoContext } from "../../context/userInfoContext/UserInfoContext";
import { useUploadContext } from "../../context/uploadContext/UploadContext";

const tableStaticContentServerBaseUrl =
  process.env.TABLE_STATIC_CONTENT_SERVER_BASE_URL;

export default function UploadTableLayer() {
  const { tableId } = useUserInfoContext();
  const { sendUploadSignal, addCurrentUpload, removeCurrentUpload } =
    useUploadContext();

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [draggingFiles, setDraggingFiles] = useState(false);
  const uploadRef = useRef<HTMLDivElement | null>(null);
  const file = useRef<File | undefined>(undefined);

  const handleFileUpload = async () => {
    if (!file.current) {
      return;
    }

    const contentId = uuidv4();
    const metadata = {
      tableId: tableId.current,
      contentId,
      instanceId: uuidv4(),
      direction: "toTable",
      state: [],
    };

    try {
      const metaRes = await fetch(
        tableStaticContentServerBaseUrl + "upload-meta",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(metadata),
        },
      );

      const { uploadId } = await metaRes.json();

      const formData = new FormData();
      formData.append("file", file.current);
      const filename = file.current.name;
      const xhr = new XMLHttpRequest();

      addCurrentUpload(contentId, {
        uploadUrl: URL.createObjectURL(file.current),
        filename,
        mimeType: "svg",
        size: file.current.size,
        progress: 0,
        paused: false,
      });

      setTimeout(
        () =>
          sendUploadSignal({
            type: "uploadStart",
            header: {
              contentId,
            },
          }),
        250,
      );

      xhr.onload = () => {
        removeCurrentUpload(contentId);

        sendUploadSignal({
          type: "uploadFinish",
          header: {
            contentId,
          },
        });
      };

      xhr.upload.onprogress = (event) => {
        sendUploadSignal({
          type: "uploadProgress",
          header: {
            contentId,
          },
          data: {
            progress: event.loaded / event.total,
          },
        });
      };

      xhr.onerror = () => {
        removeCurrentUpload(contentId);

        sendUploadSignal({
          type: "uploadError",
          header: {
            contentId,
          },
        });
      };

      xhr.open(
        "POST",
        tableStaticContentServerBaseUrl + `upload-file/${uploadId}`,
        true,
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
      className="abosulte pointer-events-none left-0 top-0 z-upload-layer h-full w-full bg-transparent"
      onDragEnter={() => setDraggingFiles(true)}
      onDragLeave={() => setDraggingFiles(false)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {draggingFiles && (
        <div
          className="absolute aspect-video w-1/6 rounded-md border-4 border-dashed border-fg-primary-desaturated bg-fg-primary-desaturated-2 bg-opacity-75"
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
