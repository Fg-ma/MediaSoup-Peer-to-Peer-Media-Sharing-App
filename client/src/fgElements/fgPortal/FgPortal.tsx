import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Transition, Variants, motion } from "framer-motion";

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
  type,
  mouseType = "topRight",
  content,
  externalRef,
  externalPortalRef,
  zValue = 51,
}: {
  type: "above" | "below" | "mouse";
  mouseType?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  content: React.ReactElement;
  externalRef?: React.RefObject<HTMLElement>;
  externalPortalRef?: React.RefObject<HTMLDivElement>;
  zValue?: number;
}) {
  const [portalPosition, setPortalPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const internalPortalRef = useRef<HTMLDivElement>(null);
  const portalRef = externalPortalRef ?? internalPortalRef;
  const mouseOffsets = {
    topLeft: { left: -8, top: -40 },
    topRight: { left: 12, top: -40 },
    bottomLeft: { left: -8, top: 0 },
    bottomRight: { left: 16, top: 0 },
  };

  const getStaticPortalPosition = () => {
    const externalRect = externalRef?.current?.getBoundingClientRect();

    if (!externalRect || !portalRef.current) {
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const portalWidth = portalRef.current.clientWidth;
    const portalHeight = portalRef.current.clientHeight;

    let top: number = 0;
    if (type === "above") {
      top = externalRect.top - portalHeight;

      // Check if it goes off the screen above, then switch to below
      if (top < 0) {
        top = externalRect.top + externalRect.height;

        // Check if it goes off screen and set to bottom of screen if so
        if (top + portalRef.current.clientHeight > viewportHeight) {
          top = viewportHeight - portalHeight;
        }
      }
    } else if (type === "below") {
      top = externalRect.top + externalRect.height;

      // Check if it goes off the screen below, then switch to above
      if (top + portalRef.current.clientHeight > viewportHeight) {
        top = externalRect.top - portalHeight;

        // Check if it goes off screen and set to zero if so
        if (top < 0) {
          top = 0;
        }
      }
    }

    let left = externalRect.left + externalRect.width / 2 - portalWidth / 2;

    // Adjust left to prevent going off the left side of the screen
    if (left < 0) {
      left = 0;
    }

    // Adjust left to prevent going off the right side of the screen
    if (left + portalWidth > viewportWidth) {
      left = viewportWidth - portalWidth;
    }

    setPortalPosition({
      top: top,
      left: left,
    });
  };

  const getDynamicPortalPosition = (event: MouseEvent) => {
    setPortalPosition({
      left:
        event.clientX +
        mouseOffsets[mouseType].left -
        (mouseType === "bottomLeft" || mouseType === "topLeft"
          ? portalRef.current?.clientWidth ?? 0
          : 0),
      top: event.clientY + mouseOffsets[mouseType].top,
    });
  };

  useEffect(() => {
    if (type === "above" || type === "below") getStaticPortalPosition();

    if (type === "mouse")
      window.addEventListener("mousemove", getDynamicPortalPosition);

    return () => {
      if (type === "mouse")
        window.removeEventListener("mousemove", getDynamicPortalPosition);
    };
  }, [content]);

  if (type === "mouse" && portalPosition === null) return;

  return ReactDOM.createPortal(
    <motion.div
      ref={portalRef}
      className={`absolute`}
      style={{
        top: `${portalPosition?.top}px`,
        left: `${portalPosition?.left}px`,
        zIndex: zValue,
      }}
      variants={FgPortalVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={FgPortalTransition}
    >
      {content}
    </motion.div>,
    document.body
  );
}
