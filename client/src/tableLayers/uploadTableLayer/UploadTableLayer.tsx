import React, { useEffect, useRef, useState } from "react";
import { useToolsContext } from "../../context/toolsContext/ToolsContext";

export default function UploadTableLayer({
  tableTopRef,
}: {
  tableTopRef: React.RefObject<HTMLDivElement>;
}) {
  const { uploader } = useToolsContext();

  const [hovering, setHovering] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const uploadRef = useRef<HTMLDivElement | null>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();

    if (
      e.dataTransfer?.files?.length &&
      tableTopRef.current?.contains(e.target as Node)
    ) {
      const fileArray = Array.from(e.dataTransfer.files);
      for (const file of fileArray) {
        uploader.current?.uploadToTable(file, [], {
          position: { top: position.y, left: position.x },
          scale: { x: 25, y: 25 },
          rotation: 0,
        });
      }
      setHovering(false);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    if (e.dataTransfer?.types.includes("Files")) {
      e.preventDefault();
    }

    if (uploadRef.current) {
      const rect = uploadRef.current.getBoundingClientRect();
      const relativeX = Math.max(
        0,
        Math.min(
          (5 / 6) * 100,
          ((e.clientX - rect.left) / uploadRef.current.clientWidth) * 100,
        ),
      );
      const relativeY = Math.max(
        0,
        Math.min(
          (5 / 6) * 100,
          ((e.clientY - rect.top) / uploadRef.current.clientHeight) * 100,
        ),
      );

      // Save the relative position in the ref
      setPosition({ x: relativeX, y: relativeY });
    }

    if (
      e.dataTransfer?.types.includes("Files") &&
      tableTopRef.current?.contains(e.target as Node)
    ) {
      if (!hovering) {
        setHovering(true);
      }
    } else {
      if (hovering) {
        setHovering(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleDrop]);

  return (
    <div
      ref={uploadRef}
      className="pointer-events-none absolute left-0 top-0 z-upload-layer h-full w-full"
    >
      {hovering && (
        <div
          className="absolute aspect-square w-1/6 rounded-md border-4 border-dashed border-fg-red bg-fg-red-light"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            pointerEvents: "none",
          }}
        ></div>
      )}
    </div>
  );
}
