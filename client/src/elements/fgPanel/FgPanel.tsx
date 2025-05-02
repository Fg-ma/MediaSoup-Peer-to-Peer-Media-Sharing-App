import React, { useState, useRef, useEffect, Suspense } from "react";
import ReactDOM from "react-dom";
import { Transition, Variants, motion } from "framer-motion";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import FgPanelController from "./lib/FgPanelController";

const FgButton = React.lazy(() => import("../fgButton/FgButton"));

const PanelTransition: Transition = {
  transition: {
    opacity: { duration: 0.15 },
  },
};

export default function FgPanel({
  externalRef,
  content,
  className,
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
  closeLabelElement,
  closePosition,
  panelBoundariesRef,
  panelBoundariesScrollingContainerRef,
  panelInsertionPointRef,
  shadow = {
    left: false,
    right: false,
    bottom: false,
    top: false,
  },
  backgroundColor = "#f2f2f2",
  secondaryBackgroundColor = "#d6d6d6",
}: {
  externalRef?: React.RefObject<HTMLDivElement>;
  content?: React.ReactNode;
  className?: string;
  initPosition?: {
    x?: number;
    y?: number;
    referenceElement?: HTMLElement;
    placement?: "above" | "below" | "left" | "right";
    padding?: number;
    relativeToBoundaries?: "center";
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
  closeLabelElement?: React.ReactElement;
  closePosition?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  panelBoundariesRef?: React.RefObject<HTMLDivElement>;
  panelBoundariesScrollingContainerRef?: React.RefObject<HTMLDivElement>;
  panelInsertionPointRef?: React.RefObject<HTMLDivElement>;
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

  const [_, setRerender] = useState(false);
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
  const panelRef = externalRef ?? useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isDragging = useRef(false);
  const startPosition = useRef({ x: 0, y: 0 });
  const isResizing = useRef(false);
  const resizingDirection = useRef<"se" | "sw" | "nw" | "ne" | undefined>(
    undefined,
  );

  const fgPanelController = useRef(
    new FgPanelController(
      setRerender,
      setPosition,
      size,
      setSize,
      setFocus,
      setFocusClicked,
      panelRef,
      containerRef,
      closeButtonRef,
      isDragging,
      startPosition,
      isResizing,
      resizingDirection,
      minWidth,
      minHeight,
      closeCallback,
      panelBoundariesRef,
      panelBoundariesScrollingContainerRef,
      panelInsertionPointRef,
    ),
  );

  useEffect(() => {
    if (
      !initPosition.referenceElement ||
      !initPosition.placement ||
      !panelRef.current
    ) {
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const referenceRect = initPosition.referenceElement.getBoundingClientRect();
    const panelHeight = panelRef.current.clientHeight;
    const panelWidth = panelRef.current.clientWidth;

    let top: number;
    if (initPosition.placement === "above") {
      top = referenceRect.top - panelHeight - (initPosition.padding ?? 0);

      // Check if it goes off the screen above, then switch to below
      if (top < 0) {
        top = referenceRect.bottom + (initPosition.padding ?? 0);

        // Check if it goes off screen and set to bottom of screen if so
        if (top + panelHeight > viewportHeight) {
          top = viewportHeight - panelHeight;
        }
      }
    } else if (initPosition.placement === "below") {
      top = referenceRect.bottom + (initPosition.padding ?? 0);

      // Check if it goes off the screen below, then switch to above
      if (top + panelHeight > viewportHeight) {
        top = referenceRect.top - panelHeight - (initPosition.padding ?? 0);

        // Check if it goes off screen and set to zero if so
        if (top < 0) {
          top = 0;
        }
      }
    } else {
      top =
        referenceRect.top +
        referenceRect.height / 2 -
        panelRef.current.clientHeight / 2;

      // Constrain vertically
      if (top < 0) top = 0;
      if (top + panelHeight > viewportHeight)
        top = viewportHeight - panelHeight;
    }

    let left: number;
    if (initPosition.placement === "left") {
      left = referenceRect.left - panelWidth - (initPosition.padding ?? 0);

      // Check if it goes off the screen left, switch to right
      if (left < 0) {
        left = referenceRect.right + (initPosition.padding ?? 0);

        if (left + panelWidth > viewportWidth) {
          left = viewportWidth - panelWidth; // Stick to right edge
        }
      }
    } else if (initPosition.placement === "right") {
      left = referenceRect.right + (initPosition.padding ?? 0);

      // Check if it goes off the screen right, switch to left
      if (left + panelWidth > viewportWidth) {
        left = referenceRect.left - panelWidth - (initPosition.padding ?? 0);

        if (left < 0) {
          left = 0; // Stick to left edge
        }
      }
    } else {
      left =
        referenceRect.left +
        referenceRect.width / 2 -
        panelRef.current.clientWidth / 2;

      // Constrain horizontally
      if (left < 0) left = 0;
      if (left + panelWidth > viewportWidth) left = viewportWidth - panelWidth;
    }

    setPosition({ x: left, y: top });
  }, [
    initPosition.referenceElement,
    initPosition.placement,
    initPosition.padding,
  ]);

  useEffect(() => {
    if (
      !initPosition.relativeToBoundaries ||
      !panelBoundariesRef ||
      !panelBoundariesRef.current ||
      !panelRef.current
    ) {
      return;
    }

    const boundariesRect = panelBoundariesRef.current.getBoundingClientRect();
    const panelRect = panelRef.current.getBoundingClientRect();

    const left = (boundariesRect.width - panelRect.width) / 2;
    const top = (boundariesRect.height - panelRect.height) / 2;

    setPosition({ x: left > 0 ? left : 0, y: top > 0 ? top : 0 });
  }, [initPosition.relativeToBoundaries]);

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

  useEffect(() => {
    if (closeCallback && isHover) {
      document.addEventListener(
        "keydown",
        fgPanelController.current.handleKeyDown,
      );
    }

    return () => {
      if (closeCallback && isHover) {
        document.removeEventListener(
          "keydown",
          fgPanelController.current.handleKeyDown,
        );
      }
    };
  }, [isHover]);

  useEffect(() => {
    document.addEventListener(
      "pointerdown",
      fgPanelController.current.handlePanelClick,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        fgPanelController.current.handlePanelClick,
      );
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
      onPointerEnter={() => {
        setFocus(true);
      }}
      onPointerLeave={() => {
        if (!focusClicked) {
          setFocus(false);
        }
      }}
      onHoverEnd={closeCallback && (() => setIsHover(false))}
      onHoverStart={closeCallback && (() => setIsHover(true))}
      className={`fg-panel ${className} ${
        focusClicked
          ? "z-panel-focused-clicked"
          : focus
            ? "z-panel-focused-hover"
            : "z-panel-unfocused"
      } absolute overflow-hidden rounded-md p-3 shadow-lg`}
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
      initial="init"
      animate="animate"
      exit="init"
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
          onPointerDown={fgPanelController.current.handleDragPointerDown}
          className="absolute top-0 h-3 cursor-pointer"
          style={{
            width: `calc(100% - ${resizeable ? "1.5rem" : "0rem"})`,
            left: `${resizeable ? "0.75rem" : "0rem"}`,
          }}
        />
      )}
      {moveable && (
        <div
          onPointerDown={fgPanelController.current.handleDragPointerDown}
          className="absolute bottom-0 h-3 cursor-pointer"
          style={{
            width: `calc(100% - ${resizeable ? "1.5rem" : "0rem"})`,
            left: `${resizeable ? "0.75rem" : "0rem"}`,
          }}
        />
      )}
      {moveable && (
        <div
          onPointerDown={fgPanelController.current.handleDragPointerDown}
          className="absolute left-0 w-3 cursor-pointer"
          style={{
            height: `calc(100% - ${resizeable ? "1.5rem" : "0rem"})`,
            top: `${resizeable ? "0.75rem" : "0rem"}`,
          }}
        />
      )}
      {moveable && (
        <div
          onPointerDown={fgPanelController.current.handleDragPointerDown}
          className="absolute right-0 w-3 cursor-pointer"
          style={{
            height: `calc(100% - ${resizeable ? "1.5rem" : "0rem"})`,
            top: `${resizeable ? "0.75rem" : "0rem"}`,
          }}
        />
      )}
      {resizeable && (closePosition !== "bottomLeft" || !closeCallback) && (
        <div
          onPointerDown={(event) =>
            fgPanelController.current.handleResizePointerDown(event, "se")
          }
          className="absolute bottom-0 right-0 aspect-square w-3 cursor-se-resize"
        />
      )}
      {resizeable && (closePosition !== "bottomRight" || !closeCallback) && (
        <div
          onPointerDown={(event) =>
            fgPanelController.current.handleResizePointerDown(event, "sw")
          }
          className="absolute bottom-0 left-0 aspect-square w-3 cursor-sw-resize"
        />
      )}
      {resizeable && (closePosition !== "topLeft" || !closeCallback) && (
        <div
          onPointerDown={(event) =>
            fgPanelController.current.handleResizePointerDown(event, "nw")
          }
          className="absolute left-0 top-0 aspect-square w-3 cursor-nw-resize"
        />
      )}
      {resizeable && (closePosition !== "topRight" || !closeCallback) && (
        <div
          onPointerDown={(event) =>
            fgPanelController.current.handleResizePointerDown(event, "ne")
          }
          className="absolute right-0 top-0 aspect-square w-3 cursor-ne-resize"
        />
      )}
      {closeCallback && closePosition && (
        <Suspense fallback={<div>Loading...</div>}>
          <FgButton
            externalRef={closeButtonRef}
            clickFunction={closeCallback}
            className={`absolute flex aspect-square w-3 items-center justify-center rounded-full hover:bg-fg-red-light ${
              closePosition === "topRight"
                ? "right-0 top-0"
                : closePosition === "topLeft"
                  ? "left-0 top-0"
                  : closePosition === "bottomRight"
                    ? "bottom-0 left-0"
                    : closePosition === "bottomLeft"
                      ? "bottom-0 right-0"
                      : ""
            }`}
            hoverContent={
              closeLabelElement ? (
                closeLabelElement
              ) : (
                <FgHoverContentStandard content="Close (x)" />
              )
            }
          />
        </Suspense>
      )}
      <motion.div
        className="pointer-events-none absolute left-3 top-3 z-10"
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
    panelInsertionPointRef && panelInsertionPointRef.current
      ? panelInsertionPointRef.current
      : document.body,
  );
}
