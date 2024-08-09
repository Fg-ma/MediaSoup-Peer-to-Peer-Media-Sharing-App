import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import HoverPortal from "./lib/HoverPortal";
import HoldPortal from "./lib/HoldPortal";

export default function FgButton({
  externalRef,
  clickFunction,
  holdFunction,
  contentFunction,
  doubleClickFunction,
  holdContent,
  hoverContent,
  className,
  style,
  defaultDataValue,
  holdTimeoutDuration = 500,
  doubleClickTimeoutDuration = 250,
  hoverTimeoutDuration = 50,
  hoverType = "above",
  holdType = "above",
  disabled = false,
}: {
  externalRef?: React.RefObject<HTMLButtonElement>;
  clickFunction: () => void;
  holdFunction?: (event: React.MouseEvent<Element, MouseEvent>) => void;
  contentFunction?: () => React.ReactElement | undefined;
  doubleClickFunction?: () => void;
  holdContent?: React.ReactElement;
  hoverContent?: React.ReactElement;
  className?: string;
  style?: React.CSSProperties;
  defaultDataValue?: string;
  holdTimeoutDuration?: number;
  doubleClickTimeoutDuration?: number;
  hoverTimeoutDuration?: number;
  hoverType?: "above" | "below";
  holdType?: "above" | "below";
  disabled?: boolean;
}) {
  const [isHeld, setIsHeld] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const isHeldRef = useRef(false);
  const holdTimeout = useRef<NodeJS.Timeout>();
  const hoverTimeout = useRef<NodeJS.Timeout>();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isClicked = useRef(false);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    isClicked.current = true;

    if (holdFunction && clickTimeout.current === null) {
      holdTimeout.current = setTimeout(() => {
        isHeldRef.current = true;
        setIsHeld(true);
      }, holdTimeoutDuration);
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
    isClicked.current = false;
  };

  useEffect(() => {
    const handleWindowMouseUp = (event: MouseEvent) =>
      handleMouseUp(event as unknown as React.MouseEvent<Element, MouseEvent>);

    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverContent) {
      hoverTimeout.current = setTimeout(() => {
        setIsHover(true);
      }, hoverTimeoutDuration);

      window.addEventListener("mousemove", handleMouseMove);
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const buttonElement = externalRef?.current || buttonRef.current;

    if (!buttonElement || !buttonElement.contains(target)) {
      window.removeEventListener("mousemove", handleMouseMove);

      if (hoverContent) {
        if (hoverTimeout.current !== null) {
          clearTimeout(hoverTimeout.current);
        }
        setIsHover(false);
      }
    }
  };

  return (
    <>
      <button
        ref={externalRef ? externalRef : buttonRef}
        onMouseDown={(event) => handleMouseDown(event)}
        className={className}
        style={style}
        data-value={defaultDataValue}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={handleMouseEnter}
        disabled={disabled}
      >
        {contentFunction && contentFunction()}
      </button>
      {hoverContent && !isHeld && (
        <AnimatePresence>
          {isHover && (
            <HoverPortal
              hoverType={hoverType}
              hoverContent={hoverContent}
              buttonRef={externalRef ? externalRef : buttonRef}
            />
          )}
        </AnimatePresence>
      )}
      {holdFunction && holdContent && (
        <AnimatePresence>
          {isHeld && (
            <HoldPortal
              holdType={holdType}
              holdContent={holdContent}
              buttonRef={externalRef ? externalRef : buttonRef}
            />
          )}
        </AnimatePresence>
      )}
    </>
  );
}
