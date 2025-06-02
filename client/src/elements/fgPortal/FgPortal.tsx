import React, { useState, useRef, useLayoutEffect } from "react";
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
  zValue = 500000,
  top = 50,
  left = 50,
  options = {
    animate: true,
  },
}: {
  className?: string;
  type?: "above" | "below" | "left" | "right" | "mouse" | "staticTopDomain";
  mouseType?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  spacing?: number;
  content?: React.ReactElement;
  externalRef?: React.RefObject<HTMLElement>;
  externalPortalRef?: React.RefObject<HTMLDivElement>;
  insertionPoint?: React.RefObject<HTMLElement>;
  zValue?: number;
  top?: number;
  left?: number;
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

  const fgPortalController = useRef(
    new FgPortalController(
      externalRef,
      portalRef,
      spacing,
      type,
      mouseType,
      setPortalPosition,
    ),
  );

  useLayoutEffect(() => {
    if (insertionPoint) {
      setPortalPosition({ left: 0, top: 0 });
    } else {
      if (
        type === "above" ||
        type === "below" ||
        type === "left" ||
        type === "right"
      ) {
        fgPortalController.current.getStaticPortalPosition();
      }
    }

    if (type === "mouse")
      window.addEventListener(
        "pointermove",
        fgPortalController.current.getDynamicPortalPosition,
      );

    if (type === "mouse")
      return () => {
        window.removeEventListener(
          "pointermove",
          fgPortalController.current.getDynamicPortalPosition,
        );
      };
  }, [content, externalRef?.current]);

  if (type === "mouse" && portalPosition === null) return;

  return ReactDOM.createPortal(
    <motion.div
      ref={portalRef}
      className={`${className} absolute`}
      style={{
        top:
          type !== "staticTopDomain" ? `${portalPosition?.top}px` : `${top}%`,
        left:
          type !== "staticTopDomain" ? `${portalPosition?.left}px` : `${left}%`,
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
    insertionPoint && insertionPoint.current && type !== "staticTopDomain"
      ? insertionPoint.current
      : document.body,
  );
}
