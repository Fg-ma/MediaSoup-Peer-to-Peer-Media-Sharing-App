import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Transition, Variants, motion } from "framer-motion";

const HoverPortalVar: Variants = {
  init: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 100 },
    },
  },
};

const HoverPortalTransition: Transition = {
  transition: {
    opacity: { duration: 0.001 },
    scale: { duration: 0.001 },
  },
};

export default function HoverPortal({
  hoverType,
  hoverContent,
  buttonRef,
}: {
  hoverType: "above" | "below";
  hoverContent: React.ReactElement;
  buttonRef: React.RefObject<HTMLButtonElement>;
}) {
  const [portalPosition, setPortalPosition] = useState({ top: 0, left: 0 });
  const portalRef = useRef<HTMLDivElement>(null);

  const getPortalPosition = () => {
    const buttonRect = buttonRef.current?.getBoundingClientRect();

    if (!buttonRect || !portalRef.current) {
      return;
    }

    let top: number = 0;
    if (hoverType === "above") {
      top = buttonRect.top - portalRef.current.clientHeight;
    } else if (hoverType === "below") {
      top = buttonRect.top + buttonRect.height;
    }
    const left =
      buttonRect.left +
      buttonRect.width / 2 -
      portalRef.current.clientWidth / 2;

    const bodyRect = document.body.getBoundingClientRect();
    const topPercent = (top / bodyRect.height) * 100;
    const leftPercent = (left / bodyRect.width) * 100;

    setPortalPosition({
      top: topPercent,
      left: leftPercent,
    });
  };

  useEffect(() => {
    getPortalPosition();
  }, [hoverContent]);

  return ReactDOM.createPortal(
    <motion.div
      ref={portalRef}
      className={`${
        (portalPosition.top === 0 || portalPosition.left === 0) && "opacity-0"
      } absolute z-20`}
      style={{
        top: `${portalPosition.top}%`,
        left: `${portalPosition.left}%`,
      }}
      variants={HoverPortalVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={HoverPortalTransition}
    >
      {hoverContent}
    </motion.div>,
    document.body
  );
}
