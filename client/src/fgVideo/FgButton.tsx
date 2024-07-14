import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { AnimatePresence, Transition, Variants, motion } from "framer-motion";

export default function FgButton({
  clickFunction,
  holdFunction,
  contentFunction,
  doubleClickFunction,
  holdContent,
  styles,
  defaultDataValue,
}: {
  clickFunction: () => void;
  holdFunction: (event: React.MouseEvent<Element, MouseEvent>) => void;
  contentFunction: () => React.ReactElement;
  doubleClickFunction?: () => void;
  holdContent: React.ReactElement;
  styles: string;
  defaultDataValue: string;
}) {
  const [isHeld, setIsHeld] = useState(false);
  const isHeldRef = useRef(false);
  const holdTimeout = useRef<NodeJS.Timeout>();
  const holdButtonRef = useRef<HTMLButtonElement>(null);
  const isClicked = useRef(false);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const holdTimeoutDuration = 500;
  const doubleClickTimeoutDuration = 250;

  const handleMouseDown = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    if (clickTimeout.current === null) {
      holdTimeout.current = setTimeout(() => {
        isHeldRef.current = true;
        setIsHeld(true);
      }, holdTimeoutDuration);
      isClicked.current = true;
    }
  };

  const handleMouseUp = (event: React.MouseEvent<Element, MouseEvent>) => {
    if (isClicked.current && clickTimeout.current === null) {
      if (!isHeldRef.current) {
        clickTimeout.current = setTimeout(() => {
          clickFunction();
          if (clickTimeout.current !== null) {
            clearTimeout(clickTimeout.current);
            clickTimeout.current = null;
          }
        }, doubleClickTimeoutDuration);
      } else {
        holdFunction(event);
      }

      if (holdTimeout.current !== null) {
        clearTimeout(holdTimeout.current);
      }

      isHeldRef.current = false;
      setIsHeld(false);
      isClicked.current = false;
    }
  };

  const handleDoubleClick = () => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }
    if (doubleClickFunction) {
      doubleClickFunction();
    }
  };

  useEffect(() => {
    const handleWindowMouseUp = (event: MouseEvent) =>
      handleMouseUp(event as unknown as React.MouseEvent<Element, MouseEvent>);

    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, []);

  return (
    <div>
      <button
        ref={holdButtonRef}
        onMouseDown={(event) => handleMouseDown(event)}
        className={styles}
        data-value={defaultDataValue}
        onDoubleClick={handleDoubleClick}
      >
        {contentFunction()}
      </button>
      <AnimatePresence>
        {isHeld && (
          <HoldButtonPortal
            holdContent={holdContent}
            holdButtonRef={holdButtonRef}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const HoldButtonPortalVar: Variants = {
  init: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 100 },
    },
  },
};

const HoldButtonPortalTransition: Transition = {
  transition: {
    opacity: { duration: 0.15, delay: 0.0 },
  },
};

function HoldButtonPortal({
  holdContent,
  holdButtonRef,
}: {
  holdContent: React.ReactElement;
  holdButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  const [portalPosition, setPortalPosition] = useState({ top: 0, left: 0 });
  const portalRef = useRef<HTMLDivElement>(null);

  const getPortalPosition = () => {
    const holdButtonRect = holdButtonRef.current?.getBoundingClientRect();
    const portalRect = portalRef.current?.getBoundingClientRect();

    if (!holdButtonRect || !portalRect) {
      return;
    }

    const top = holdButtonRect.top - portalRect.height / 0.8;
    const left =
      holdButtonRect.left +
      holdButtonRect.width / 2 -
      portalRect.width / 2 / 0.8;

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
      variants={HoldButtonPortalVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={HoldButtonPortalTransition}
    >
      {holdContent}
    </motion.div>,
    document.body
  );
}
