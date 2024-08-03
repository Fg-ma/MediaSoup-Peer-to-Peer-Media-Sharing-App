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

export default function SliderValuePortal({
  value,
  handleRef,
  precision,
  units,
}: {
  value: number;
  handleRef: React.RefObject<HTMLDivElement>;
  precision: number;
  units?: string;
}) {
  const [portalPosition, setPortalPosition] = useState({ top: 0, left: 0 });
  const portalRef = useRef<HTMLDivElement>(null);

  const getPortalPosition = () => {
    if (!handleRef.current || !portalRef.current) {
      return;
    }

    const handleRect = handleRef.current.getBoundingClientRect();

    const top = handleRect.top - portalRef.current.clientHeight;

    const left = handleRect.left + handleRect.width;

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
  }, [
    handleRef.current?.getBoundingClientRect().top,
    handleRef.current?.getBoundingClientRect().left,
  ]);

  return ReactDOM.createPortal(
    <motion.div
      ref={portalRef}
      className={`slider-value-portal ${
        !portalPosition.top && !portalPosition.left && "opacity-0"
      } absolute w-max h-min z-[60] bg-white rounded p-1 font-K2D text-md shadow`}
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
      {value.toFixed(precision)} {units && units}
    </motion.div>,
    document.body
  );
}
