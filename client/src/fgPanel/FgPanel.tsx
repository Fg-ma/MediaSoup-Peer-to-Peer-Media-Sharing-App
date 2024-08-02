import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

export default function FgPanel({
  content,
  minWidth = 0,
  minHeight = 0,
  resizeCallback,
}: {
  content: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
  resizeCallback?: () => void;
}) {
  const [rerender, setRerender] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 560, height: 384 });
  const panelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPosition = useRef({ x: 0, y: 0 });
  const isResizing = useRef(false);
  const resizingDirection = useRef<"se" | "sw" | "nw" | "ne" | undefined>(
    undefined
  );

  const handleMouseMove = (event: React.MouseEvent | MouseEvent) => {
    if (isDragging.current && !isResizing.current) {
      setPosition({
        x: event.clientX - startPosition.current.x,
        y: event.clientY - startPosition.current.y,
      });
    } else if (isResizing.current && !isDragging.current) {
      if (!panelRef.current) {
        return;
      }

      const rect = panelRef.current.getBoundingClientRect();
      const newSize = { ...size };

      switch (resizingDirection.current) {
        case "se":
          newSize.width = Math.max(minWidth, event.clientX - rect.left);
          newSize.height = Math.max(minHeight, event.clientY - rect.top);
          break;
        case "sw":
          newSize.width = Math.max(minWidth, rect.right - event.clientX);
          newSize.height = Math.max(minHeight, event.clientY - rect.top);
          if (minWidth < rect.right - event.clientX) {
            setPosition((prev) => ({ ...prev, x: event.clientX }));
          }
          break;
        case "nw":
          newSize.width = Math.max(minWidth, rect.right - event.clientX);
          newSize.height = Math.max(minHeight, rect.bottom - event.clientY);
          if (
            minWidth < rect.right - event.clientX ||
            minHeight < rect.bottom - event.clientY
          ) {
            setPosition((prev) => {
              const newPosition = {
                ...prev,
              };

              if (minWidth < rect.right - event.clientX) {
                newPosition.x = event.clientX;
              }
              if (minHeight < rect.bottom - event.clientY) {
                newPosition.y = event.clientY;
              }

              return newPosition;
            });
          }
          break;
        case "ne":
          newSize.width = Math.max(minWidth, event.clientX - rect.left);
          newSize.height = Math.max(minHeight, rect.bottom - event.clientY);
          if (minHeight < rect.bottom - event.clientY) {
            setPosition((prev) => ({ ...prev, y: event.clientY }));
          }
          break;
      }

      setSize(newSize);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    isDragging.current = false;
    isResizing.current = false;

    setRerender((prev) => !prev);
  };

  const handleResizeMouseDown = (
    event: React.MouseEvent,
    direction: "se" | "sw" | "ne" | "nw"
  ) => {
    event.stopPropagation();
    event.preventDefault();

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    isResizing.current = true;
    resizingDirection.current = direction;
  };

  const handleDragMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (
      event.target === containerRef.current ||
      containerRef.current?.contains(event.target as Node)
    ) {
      return;
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    isDragging.current = true;

    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      startPosition.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }
  };

  useEffect(() => {
    if (isResizing.current && resizingDirection.current) {
      document.body.style.cursor = `${resizingDirection.current}-resize`;
    } else {
      document.body.style.cursor = "";
    }
  }, [isResizing.current]);

  const handleCursorMovement = (event: React.MouseEvent) => {
    if (
      event.target === containerRef.current ||
      containerRef.current?.contains(event.target as Node)
    ) {
      if (panelRef.current && panelRef.current.style.cursor !== "") {
        panelRef.current.style.cursor = "";
      }
      return;
    }

    if (panelRef.current) {
      panelRef.current.style.cursor = "pointer";
    }
  };

  useEffect(() => {
    if (resizeCallback) {
      resizeCallback();
    }
  }, [size]);

  return ReactDOM.createPortal(
    <div
      ref={panelRef}
      onMouseDown={handleDragMouseDown}
      onMouseMove={handleCursorMovement}
      className='z-50 shadow-lg rounded absolute p-5 bg-white'
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging.current ? "pointer" : "",
      }}
    >
      <div
        ref={containerRef}
        style={{ zIndex: 100, width: "100%", height: "100%" }}
      >
        {content}
      </div>
      <div
        onMouseDown={(event) => handleResizeMouseDown(event, "se")}
        className='w-5 aspect-square absolute right-0 bottom-0 cursor-se-resize'
      />
      <div
        onMouseDown={(event) => handleResizeMouseDown(event, "sw")}
        className='w-5 aspect-square absolute left-0 bottom-0 cursor-sw-resize'
      />
      <div
        onMouseDown={(event) => handleResizeMouseDown(event, "nw")}
        className='w-5 aspect-square absolute left-0 top-0 cursor-nw-resize'
      />
      <div
        onMouseDown={(event) => handleResizeMouseDown(event, "ne")}
        className='w-5 aspect-square absolute right-0 top-0 cursor-ne-resize'
      />
    </div>,
    document.body
  );
}
