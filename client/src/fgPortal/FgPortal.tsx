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
  content,
  buttonRef,
}: {
  type: "above" | "below" | "mouse";
  content: React.ReactElement;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}) {
  const [portalPosition, setPortalPosition] = useState({ top: 0, left: 0 });
  const portalRef = useRef<HTMLDivElement>(null);

  const getStaticPortalPosition = () => {
    const buttonRect = buttonRef?.current?.getBoundingClientRect();

    if (!buttonRect || !portalRef.current) {
      return;
    }

    let top: number = 0;
    if (type === "above") {
      top = buttonRect.top - portalRef.current.clientHeight;
    } else if (type === "below") {
      top = buttonRect.top + buttonRect.height;
    }
    const left =
      buttonRect.left +
      buttonRect.width / 2 -
      portalRef.current.clientWidth / 2;

    setPortalPosition({
      top: top,
      left: left,
    });
  };

  const getDynamicPortalPosition = (event: MouseEvent) => {
    setPortalPosition({
      top: event.clientY - 40,
      left: event.clientX + 12,
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

  return ReactDOM.createPortal(
    <motion.div
      ref={portalRef}
      className={`${
        (portalPosition.top === 0 || portalPosition.left === 0) && "opacity-0"
      } absolute z-[51]`}
      style={{
        top: `${portalPosition.top}px`,
        left: `${portalPosition.left}px`,
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
