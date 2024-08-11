import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Transition, Variants, motion } from "framer-motion";
import FgButton from "../fgButton/FgButton";

const PanelVar: Variants = {
  init: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 100 },
    },
  },
};

const PanelTransition: Transition = {
  transition: {
    opacity: { duration: 0.15 },
  },
};

export default function FgPanel({
  content,
  initPosition = { x: 0, y: 0 },
  initWidth = 100,
  initHeight = 100,
  minWidth = 0,
  minHeight = 0,
  resizeCallback,
  closeCallback,
  closePosition,
}: {
  content: React.ReactNode;
  initPosition?: {
    x?: number;
    y?: number;
    referenceElement?: HTMLElement;
    placement?: "above" | "below" | "left" | "right";
    padding?: number;
  };
  initWidth?: number;
  initHeight?: number;
  minWidth?: number;
  minHeight?: number;
  resizeCallback?: () => void;
  closeCallback?: () => void;
  closePosition?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
}) {
  const [rerender, setRerender] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [position, setPosition] = useState<{ x?: number; y?: number }>({
    x: initPosition.x,
    y: initPosition.y,
  });
  const [size, setSize] = useState({ width: initWidth, height: initHeight });
  const panelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isDragging = useRef(false);
  const startPosition = useRef({ x: 0, y: 0 });
  const isResizing = useRef(false);
  const resizingDirection = useRef<"se" | "sw" | "nw" | "ne" | undefined>(
    undefined
  );

  useEffect(() => {
    if (
      !initPosition.referenceElement ||
      !initPosition.placement ||
      !panelRef.current
    ) {
      return;
    }

    const referenceRect = initPosition.referenceElement.getBoundingClientRect();

    let top: number;
    if (initPosition.placement === "above") {
      top = referenceRect.top - panelRef.current.clientHeight;

      if (initPosition.padding) {
        top -= initPosition.padding;
      }
    } else if (initPosition.placement === "below") {
      top = referenceRect.bottom;

      if (initPosition.padding) {
        top += initPosition.padding;
      }
    } else {
      top =
        referenceRect.top +
        referenceRect.height / 2 -
        panelRef.current.clientHeight / 2;
    }

    let left: number;
    if (initPosition.placement === "left") {
      left = referenceRect.left - panelRef.current.clientWidth;

      if (initPosition.padding) {
        left -= initPosition.padding;
      }
    } else if (initPosition.placement === "right") {
      left = referenceRect.right;

      if (initPosition.padding) {
        left += initPosition.padding;
      }
    } else {
      left =
        referenceRect.left +
        referenceRect.width / 2 -
        panelRef.current.clientWidth / 2;
    }

    setPosition({ x: left, y: top });
  }, [
    initPosition.referenceElement,
    initPosition.placement,
    initPosition.padding,
  ]);

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
      containerRef.current?.contains(event.target as Node) ||
      closeButtonRef.current?.contains(event.target as Node)
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

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!closeCallback) return;

    const key = event.key.toLowerCase();
    if (["x", "delete", "escape"].includes(key)) {
      closeCallback();
    }
  };

  useEffect(() => {
    if (closeCallback && isHover) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (closeCallback && isHover) {
        document.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [isHover]);

  return ReactDOM.createPortal(
    <motion.div
      ref={panelRef}
      onMouseDown={handleDragMouseDown}
      onMouseMove={handleCursorMovement}
      onHoverEnd={closeCallback && (() => setIsHover(false))}
      onHoverStart={closeCallback && (() => setIsHover(true))}
      className='z-50 shadow-lg rounded absolute p-3 bg-white'
      style={{
        opacity:
          position.x === undefined || position.y === undefined ? "0%" : "100%",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging.current ? "pointer" : "",
      }}
      variants={PanelVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={PanelTransition}
    >
      <div
        ref={containerRef}
        style={{ zIndex: 100, width: "100%", height: "100%" }}
      >
        {content}
      </div>
      {(closePosition !== "bottomLeft" || !closeCallback) && (
        <div
          onMouseDown={(event) => handleResizeMouseDown(event, "se")}
          className='w-3 aspect-square absolute right-0 bottom-0 cursor-se-resize'
        />
      )}
      {(closePosition !== "bottomRight" || !closeCallback) && (
        <div
          onMouseDown={(event) => handleResizeMouseDown(event, "sw")}
          className='w-3 aspect-square absolute left-0 bottom-0 cursor-sw-resize'
        />
      )}
      {(closePosition !== "topLeft" || !closeCallback) && (
        <div
          onMouseDown={(event) => handleResizeMouseDown(event, "nw")}
          className='w-3 aspect-square absolute left-0 top-0 cursor-nw-resize'
        />
      )}
      {(closePosition !== "topRight" || !closeCallback) && (
        <div
          onMouseDown={(event) => handleResizeMouseDown(event, "ne")}
          className='w-3 aspect-square absolute right-0 top-0 cursor-ne-resize'
        />
      )}
      {closeCallback && closePosition && (
        <FgButton
          externalRef={closeButtonRef}
          clickFunction={closeCallback}
          className={`w-3 aspect-square absolute flex items-center justify-center ${
            closePosition === "topRight"
              ? "right-0 top-0"
              : closePosition === "topLeft"
              ? "left-0 top-0"
              : closePosition === "bottomRight"
              ? "left-0 bottom-0"
              : closePosition === "bottomLeft"
              ? "right-0 bottom-0"
              : ""
          }`}
          hoverContent={
            <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
              Close (x)
            </div>
          }
        />
      )}
    </motion.div>,
    document.body
  );
}
