import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { AnimatePresence, Transition, Variants, motion } from "framer-motion";

export default function FgButton({
  clickFunction,
  holdFunction,
  contentFunction,
  doubleClickFunction,
  holdContent,
  hoverContent,
  styles,
  defaultDataValue,
}: {
  clickFunction: () => void;
  holdFunction?: (event: React.MouseEvent<Element, MouseEvent>) => void;
  contentFunction?: () => React.ReactElement;
  doubleClickFunction?: () => void;
  holdContent?: React.ReactElement;
  hoverContent?: React.ReactElement;
  styles?: string;
  defaultDataValue?: string;
}) {
  const [isHeld, setIsHeld] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const isHeldRef = useRef(false);
  const holdTimeout = useRef<NodeJS.Timeout>();
  const hoverTimeout = useRef<NodeJS.Timeout>();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isClicked = useRef(false);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const holdTimeoutDuration = 500;
  const doubleClickTimeoutDuration = 250;
  const hoverTimeoutDuration = 50;

  const handleMouseDown = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    if (holdFunction && clickTimeout.current === null) {
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
        if (doubleClickFunction) {
          clickTimeout.current = setTimeout(() => {
            clickFunction();
            if (clickTimeout.current !== null) {
              clearTimeout(clickTimeout.current);
              clickTimeout.current = null;
            }
          }, doubleClickTimeoutDuration);
        } else {
          clickFunction();
        }
      } else {
        if (holdFunction) {
          holdFunction(event);
        }
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
        ref={buttonRef}
        onMouseDown={(event) => handleMouseDown(event)}
        className={styles}
        data-value={defaultDataValue}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => {
          if (hoverContent) {
            hoverTimeout.current = setTimeout(() => {
              setIsHover(true);
            }, hoverTimeoutDuration);
          }
        }}
        onMouseLeave={() => {
          if (hoverContent) {
            if (hoverTimeout.current !== null) {
              clearTimeout(hoverTimeout.current);
            }
            setIsHover(false);
          }
        }}
      >
        {contentFunction && contentFunction()}
      </button>
      {hoverContent && !isHeld && (
        <AnimatePresence>
          {isHover && (
            <HoverPortal hoverContent={hoverContent} buttonRef={buttonRef} />
          )}
        </AnimatePresence>
      )}
      {holdFunction && holdContent && (
        <AnimatePresence>
          {isHeld && (
            <HoldPortal holdContent={holdContent} buttonRef={buttonRef} />
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

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

function HoldPortal({
  holdContent,
  buttonRef,
}: {
  holdContent: React.ReactElement;
  buttonRef: React.RefObject<HTMLButtonElement>;
}) {
  const [portalPosition, setPortalPosition] = useState({ top: 0, left: 0 });
  const portalRef = useRef<HTMLDivElement>(null);

  const getPortalPosition = () => {
    const holdButtonRect = buttonRef.current?.getBoundingClientRect();
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

function HoverPortal({
  hoverContent,
  buttonRef,
}: {
  hoverContent: React.ReactElement;
  buttonRef: React.RefObject<HTMLButtonElement>;
}) {
  const [portalPosition, setPortalPosition] = useState({ top: 0, left: 0 });
  const portalRef = useRef<HTMLDivElement>(null);

  const getPortalPosition = () => {
    const holdButtonRect = buttonRef.current?.getBoundingClientRect();
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
