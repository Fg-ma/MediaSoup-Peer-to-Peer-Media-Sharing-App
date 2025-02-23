import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Transition, Variants, motion } from "framer-motion";
import FgPortalController from "./lib/FgPortalController";

const FgPortalVar: Variants = {
  init: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 100 },
    },
  },
};

const FgPortalTransition: Transition = {
  transition: {
    opacity: { duration: 0.001 },
    scale: { duration: 0.001 },
  },
};

export default function FgPortal({
  className,
  type = "above",
  mouseType = "topRight",
  spacing,
  content,
  externalRef,
  externalPortalRef,
  insertionPoint,
  zValue = 51,
  options = {
    animate: true,
  },
}: {
  className?: string;
  type?: "above" | "below" | "left" | "right" | "mouse";
  mouseType?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  spacing?: number;
  content?: React.ReactElement;
  externalRef?: React.RefObject<HTMLElement>;
  externalPortalRef?: React.RefObject<HTMLDivElement>;
  insertionPoint?: React.RefObject<HTMLElement>;
  zValue?: number;
  options?: {
    animate: boolean;
  };
}) {
  const [portalPosition, setPortalPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const internalPortalRef = useRef<HTMLDivElement>(null);
  const portalRef = externalPortalRef ?? internalPortalRef;

  const fgPortalController = new FgPortalController(
    externalRef,
    portalRef,
    spacing,
    type,
    mouseType,
    setPortalPosition
  );

  useEffect(() => {
    if (insertionPoint) {
      setPortalPosition({ left: 0, top: 0 });
    } else {
      if (
        type === "above" ||
        type === "below" ||
        type === "left" ||
        type === "right"
      ) {
        fgPortalController.getStaticPortalPosition();
      }
    }

    if (type === "mouse")
      window.addEventListener(
        "pointermove",
        fgPortalController.getDynamicPortalPosition
      );

    return () => {
      if (type === "mouse")
        window.removeEventListener(
          "pointermove",
          fgPortalController.getDynamicPortalPosition
        );
    };
  }, [content]);

  if (type === "mouse" && portalPosition === null) return;

  return ReactDOM.createPortal(
    <motion.div
      ref={portalRef}
      className={`${className} absolute`}
      style={{
        top: `${portalPosition?.top}px`,
        left: `${portalPosition?.left}px`,
        zIndex: zValue,
      }}
      {...(options.animate
        ? {
            variants: FgPortalVar,
            initial: "init",
            animate: "animate",
            exit: "init",
            transition: FgPortalTransition,
          }
        : {})}
    >
      {content}
    </motion.div>,
    insertionPoint && insertionPoint.current
      ? insertionPoint.current
      : document.body
  );
}
