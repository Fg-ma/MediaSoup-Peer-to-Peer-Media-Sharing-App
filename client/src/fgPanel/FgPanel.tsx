import React, { useState, useRef, useEffect, Suspense } from "react";
import ReactDOM from "react-dom";
import { Transition, Variants, motion } from "framer-motion";

const FgButton = React.lazy(() => import("../fgButton/FgButton"));

const PanelTransition: Transition = {
  transition: {
    opacity: { duration: 0.15 },
  },
};

export default function FgPanel({
  content,
  initPosition = { x: 0, y: 0 },
  initWidth = "100px",
  initHeight = "100px",
  minWidth = 0,
  minHeight = 0,
  resizeable = true,
  moveable = true,
  resizeCallback,
  focusCallback,
  closeCallback,
  closePosition,
  shadow = {
    left: false,
    right: false,
    bottom: false,
    top: false,
  },
  backgroundColor = "#ffffff",
  secondaryBackgroundColor = "#f3f3f3",
}: {
  content: React.ReactNode;
  initPosition?: {
    x?: number;
    y?: number;
    referenceElement?: HTMLElement;
    placement?: "above" | "below" | "left" | "right";
    padding?: number;
  };
  initWidth?: string;
  initHeight?: string;
  minWidth?: number;
  minHeight?: number;
  resizeable?: boolean;
  moveable?: boolean;
  resizeCallback?: () => void;
  focusCallback?: (focus: boolean) => void;
  closeCallback?: () => void;
  closePosition?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  shadow?: {
    left?: boolean;
    right?: boolean;
    bottom?: boolean;
    top?: boolean;
  };
  backgroundColor?: string;
  secondaryBackgroundColor?: string;
}) {
  const PanelVar: Variants = {
    init: { opacity: 0, scale: 0.8 },
    animate: (focus: boolean) => ({
      opacity: 1,
      scale: 1,
      backgroundColor: focus ? backgroundColor : secondaryBackgroundColor,
      transition: {
        scale: { type: "spring", stiffness: 100 },
        backgroundColor: { duration: 0.3, ease: "linear" },
      },
    }),
  };

  const [rerender, setRerender] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [position, setPosition] = useState<{ x?: number; y?: number }>({
    x: initPosition.x,
    y: initPosition.y,
  });
  const [size, setSize] = useState<{ width: string; height: string }>({
    width: initWidth,
    height: initHeight,
  });
  const [focus, setFocus] = useState(true);
  const [focusClicked, setFocusClicked] = useState(true);
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
          newSize.width = `${Math.max(minWidth, event.clientX - rect.left)}px`;
          newSize.height = `${Math.max(minHeight, event.clientY - rect.top)}px`;
          break;
        case "sw":
          newSize.width = `${Math.max(minWidth, rect.right - event.clientX)}px`;
          newSize.height = `${Math.max(minHeight, event.clientY - rect.top)}px`;
          if (minWidth < rect.right - event.clientX) {
            setPosition((prev) => ({ ...prev, x: event.clientX }));
          }
          break;
        case "nw":
          newSize.width = `${Math.max(minWidth, rect.right - event.clientX)}px`;
          newSize.height = `${Math.max(
            minHeight,
            rect.bottom - event.clientY
          )}px`;
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
          newSize.width = `${Math.max(minWidth, event.clientX - rect.left)}px`;
          // prettier-ignore
          newSize.height = `${Math.max(minHeight, rect.bottom - event.clientY)}px`;
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
    event.preventDefault();

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    isResizing.current = true;
    resizingDirection.current = direction;
  };

  const handleDragMouseDown = (event: React.MouseEvent) => {
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

  useEffect(() => {
    if (resizeCallback) {
      resizeCallback();
    }
  }, [size]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!closeCallback || event.target instanceof HTMLInputElement) return;

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

  const handlePanelClick = (event: MouseEvent) => {
    if (panelRef.current) {
      const value = panelRef.current.contains(event.target as Node);
      setFocus(value);
      setFocusClicked(value);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handlePanelClick);

    return () => {
      document.removeEventListener("mousedown", handlePanelClick);
    };
  }, []);

  if (focusCallback) {
    useEffect(() => {
      focusCallback(focus);
    }, [focus]);
  }

  return ReactDOM.createPortal(
    <motion.div
      ref={panelRef}
      onMouseEnter={() => {
        setFocus(true);
      }}
      onMouseLeave={() => {
        if (!focusClicked) {
          setFocus(false);
        }
      }}
      onHoverEnd={closeCallback && (() => setIsHover(false))}
      onHoverStart={closeCallback && (() => setIsHover(true))}
      className={`${
        focusClicked ? "z-[50]" : focus ? "z-[49]" : "z-0"
      } shadow-lg rounded absolute p-3 overflow-hidden`}
      style={{
        opacity:
          position.x === undefined || position.y === undefined ? "0%" : "100%",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging.current ? "pointer" : "",
      }}
      custom={focus}
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
      {moveable && (
        <div
          onMouseDown={handleDragMouseDown}
          className='h-3 absolute top-0 cursor-pointer'
          style={{
            width: `calc(100% - ${resizeable ? "1.5rem" : "0rem"})`,
            left: `${resizeable ? "0.75rem" : "0rem"}`,
          }}
        />
      )}
      {moveable && (
        <div
          onMouseDown={handleDragMouseDown}
          className='h-3 absolute bottom-0 cursor-pointer'
          style={{
            width: `calc(100% - ${resizeable ? "1.5rem" : "0rem"})`,
            left: `${resizeable ? "0.75rem" : "0rem"}`,
          }}
        />
      )}
      {moveable && (
        <div
          onMouseDown={handleDragMouseDown}
          className='w-3 absolute left-0 cursor-pointer'
          style={{
            height: `calc(100% - ${resizeable ? "1.5rem" : "0rem"})`,
            top: `${resizeable ? "0.75rem" : "0rem"}`,
          }}
        />
      )}
      {moveable && (
        <div
          onMouseDown={handleDragMouseDown}
          className='w-3 absolute right-0 cursor-pointer'
          style={{
            height: `calc(100% - ${resizeable ? "1.5rem" : "0rem"})`,
            top: `${resizeable ? "0.75rem" : "0rem"}`,
          }}
        />
      )}
      {resizeable && (closePosition !== "bottomLeft" || !closeCallback) && (
        <div
          onMouseDown={(event) => handleResizeMouseDown(event, "se")}
          className='w-3 aspect-square absolute right-0 bottom-0 cursor-se-resize'
        />
      )}
      {resizeable && (closePosition !== "bottomRight" || !closeCallback) && (
        <div
          onMouseDown={(event) => handleResizeMouseDown(event, "sw")}
          className='w-3 aspect-square absolute left-0 bottom-0 cursor-sw-resize'
        />
      )}
      {resizeable && (closePosition !== "topLeft" || !closeCallback) && (
        <div
          onMouseDown={(event) => handleResizeMouseDown(event, "nw")}
          className='w-3 aspect-square absolute left-0 top-0 cursor-nw-resize'
        />
      )}
      {resizeable && (closePosition !== "topRight" || !closeCallback) && (
        <div
          onMouseDown={(event) => handleResizeMouseDown(event, "ne")}
          className='w-3 aspect-square absolute right-0 top-0 cursor-ne-resize'
        />
      )}
      {closeCallback && closePosition && (
        <Suspense fallback={<div>Loading...</div>}>
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
              <div
                className='mb-1 w-max py-1 px-2 text-black font-K2D text-md shadow-lg rounded-md relative bottom-0'
                style={{ backgroundColor: backgroundColor }}
              >
                Close (x)
              </div>
            }
          />
        </Suspense>
      )}
      <motion.div
        className='z-10 absolute left-3 top-3 pointer-events-none'
        style={{
          width: "calc(100% - 1.5rem)",
          height: "calc(100% - 1.5rem)",
        }}
        animate={{
          // prettier-ignore
          boxShadow: `${shadow.left ? `inset 10px 0px 5px -5px ${focus ? backgroundColor : secondaryBackgroundColor}` : ""}${(shadow.left && shadow.right) || (shadow.left && shadow.bottom) || (shadow.left && shadow.top) ? ", " : ""}${shadow.right ? `inset -10px 0px 5px -5px ${focus ? backgroundColor : secondaryBackgroundColor}` : ""}${(shadow.right && shadow.top) || (shadow.right && shadow.bottom) ? ", " : ""}${shadow.top ? `inset 0px 10px 5px -5px ${focus ? backgroundColor : secondaryBackgroundColor}` : ""}${(shadow.top && shadow.bottom) ? ", " : ""}${shadow.bottom ? `inset 0px -10px 5px -5px ${focus ? backgroundColor : secondaryBackgroundColor}` : ""}`,
        }}
        transition={{
          boxShadow: { duration: 0.3, ease: "linear" },
        }}
      />
    </motion.div>,
    document.body
  );
}
