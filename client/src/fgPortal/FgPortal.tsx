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
}: {
  type: "above" | "below" | "mouse";
  mouseType?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  content: React.ReactElement;
  externalRef?: React.RefObject<HTMLElement>;
}) {
  const [portalPosition, setPortalPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const portalRef = useRef<HTMLDivElement>(null);
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

    let top: number = 0;
    if (type === "above") {
      top = externalRect.top - portalRef.current.clientHeight;
    } else if (type === "below") {
      top = externalRect.top + externalRect.height;
    }
    const left =
      externalRect.left +
      externalRect.width / 2 -
      portalRef.current.clientWidth / 2;

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
      className='absolute z-[51]'
      style={{
        top: `${portalPosition?.top}px`,
        left: `${portalPosition?.left}px`,
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
