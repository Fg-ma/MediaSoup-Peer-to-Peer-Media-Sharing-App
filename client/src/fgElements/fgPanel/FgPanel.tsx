import React, { useState, useRef, useEffect, Suspense } from "react";
import ReactDOM from "react-dom";
import { Transition, Variants, motion } from "framer-motion";
import FgPanelController from "./lib/FgPanelController";

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
  backgroundColor = "#ffffff",
  secondaryBackgroundColor = "#f3f3f3",
}: {
  content?: React.ReactNode;
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
  const panelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isDragging = useRef(false);
  const startPosition = useRef({ x: 0, y: 0 });
  const isResizing = useRef(false);
  const resizingDirection = useRef<"se" | "sw" | "nw" | "ne" | undefined>(
    undefined
  );

  const fgPanelController = new FgPanelController(
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
    panelInsertionPointRef
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
      document.addEventListener("keydown", fgPanelController.handleKeyDown);
    }

    return () => {
      if (closeCallback && isHover) {
        document.removeEventListener(
          "keydown",
          fgPanelController.handleKeyDown
        );
      }
    };
  }, [isHover]);

  useEffect(() => {
    document.addEventListener("mousedown", fgPanelController.handlePanelClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        fgPanelController.handlePanelClick
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
          onMouseDown={fgPanelController.handleDragMouseDown}
          className='h-3 absolute top-0 cursor-pointer'
          style={{
            width: `calc(100% - ${resizeable ? "1.5rem" : "0rem"})`,
            left: `${resizeable ? "0.75rem" : "0rem"}`,
          }}
        />
      )}
      {moveable && (
        <div
          onMouseDown={fgPanelController.handleDragMouseDown}
          className='h-3 absolute bottom-0 cursor-pointer'
          style={{
            width: `calc(100% - ${resizeable ? "1.5rem" : "0rem"})`,
            left: `${resizeable ? "0.75rem" : "0rem"}`,
          }}
        />
      )}
      {moveable && (
        <div
          onMouseDown={fgPanelController.handleDragMouseDown}
          className='w-3 absolute left-0 cursor-pointer'
          style={{
            height: `calc(100% - ${resizeable ? "1.5rem" : "0rem"})`,
            top: `${resizeable ? "0.75rem" : "0rem"}`,
          }}
        />
      )}
      {moveable && (
        <div
          onMouseDown={fgPanelController.handleDragMouseDown}
          className='w-3 absolute right-0 cursor-pointer'
          style={{
            height: `calc(100% - ${resizeable ? "1.5rem" : "0rem"})`,
            top: `${resizeable ? "0.75rem" : "0rem"}`,
          }}
        />
      )}
      {resizeable && (closePosition !== "bottomLeft" || !closeCallback) && (
        <div
          onMouseDown={(event) =>
            fgPanelController.handleResizeMouseDown(event, "se")
          }
          className='w-3 aspect-square absolute right-0 bottom-0 cursor-se-resize'
        />
      )}
      {resizeable && (closePosition !== "bottomRight" || !closeCallback) && (
        <div
          onMouseDown={(event) =>
            fgPanelController.handleResizeMouseDown(event, "sw")
          }
          className='w-3 aspect-square absolute left-0 bottom-0 cursor-sw-resize'
        />
      )}
      {resizeable && (closePosition !== "topLeft" || !closeCallback) && (
        <div
          onMouseDown={(event) =>
            fgPanelController.handleResizeMouseDown(event, "nw")
          }
          className='w-3 aspect-square absolute left-0 top-0 cursor-nw-resize'
        />
      )}
      {resizeable && (closePosition !== "topRight" || !closeCallback) && (
        <div
          onMouseDown={(event) =>
            fgPanelController.handleResizeMouseDown(event, "ne")
          }
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
              closeLabelElement ? (
                closeLabelElement
              ) : (
                <div
                  className='mb-1 w-max py-1 px-2 text-black font-K2D text-md shadow-lg rounded-md relative bottom-0'
                  style={{ backgroundColor: backgroundColor }}
                >
                  Close (x)
                </div>
              )
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
    panelInsertionPointRef && panelInsertionPointRef.current
      ? panelInsertionPointRef.current
      : document.body
  );
}
