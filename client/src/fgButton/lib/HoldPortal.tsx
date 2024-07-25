import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Transition, Variants, motion } from "framer-motion";

const HoldPortalVar: Variants = {
  init: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 100 },
    },
  },
};

const HoldPortalTransition: Transition = {
  transition: {
    opacity: { duration: 0.15 },
  },
};

export default function HoldPortal({
  holdType,
  holdContent,
  buttonRef,
}: {
  holdType: "above" | "below";
  holdContent: React.ReactElement;
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
    if (holdType === "above") {
      top = buttonRect.top - portalRef.current.clientHeight;
    } else if (holdType === "below") {
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
  }, []);

  return ReactDOM.createPortal(
    <motion.div
      ref={portalRef}
      className={`${
        !portalPosition.top && !portalPosition.left && "opacity-0"
      } absolute w-min h-min z-20`}
      style={{
        top: `${portalPosition.top}%`,
        left: `${portalPosition.left}%`,
      }}
      variants={HoldPortalVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={HoldPortalTransition}
    >
      {holdContent}
    </motion.div>,
    document.body
  );
}
