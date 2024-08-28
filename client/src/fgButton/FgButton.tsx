import React, { useState, useRef, Suspense } from "react";
import { AnimatePresence, Transition, Variants, motion } from "framer-motion";

const FgPortal = React.lazy(() => import("../fgPortal/FgPortal"));

interface FgButtonOptions {
  defaultDataValue?: string;
  holdTimeoutDuration?: number;
  doubleClickTimeoutDuration?: number;
  hoverTimeoutDuration?: number;
  hoverType?: "above" | "below";
  holdType?: "above" | "below";
  disabled?: boolean;
}

const defaultFgButtonOptions: {
  defaultDataValue?: string;
  holdTimeoutDuration: number;
  doubleClickTimeoutDuration: number;
  hoverTimeoutDuration: number;
  hoverType: "above" | "below";
  holdType: "above" | "below";
  disabled: boolean;
} = {
  defaultDataValue: undefined,
  holdTimeoutDuration: 500,
  doubleClickTimeoutDuration: 250,
  hoverTimeoutDuration: 50,
  hoverType: "above",
  holdType: "above",
  disabled: false,
};

export default function FgButton({
  externalId,
  externalRef,
  clickFunction,
  mouseDownFunction,
  mouseUpFunction,
  holdFunction,
  contentFunction,
  doubleClickFunction,
  holdContent,
  hoverContent,
  className,
  style,
  options,
  animationOptions,
  ...rest
}: {
  externalId?: string;
  externalRef?: React.RefObject<HTMLButtonElement>;
  clickFunction?: (event: React.MouseEvent) => void;
  mouseDownFunction?: (event: React.MouseEvent) => void;
  mouseUpFunction?: (event: MouseEvent) => void;
  holdFunction?: (event: React.MouseEvent<Element, MouseEvent>) => void;
  contentFunction?: () => React.ReactElement | undefined;
  doubleClickFunction?: (event: React.MouseEvent) => void;
  holdContent?: React.ReactElement;
  hoverContent?: React.ReactElement;
  className?: string;
  style?: React.CSSProperties;
  options?: FgButtonOptions;
  animationOptions?: {
    variants: Variants;
    transition: Transition;
    initial?: string;
    animate?: string;
    exit?: string;
    whileHover?: string;
  };
}) {
  const fgButtonOptions = {
    ...defaultFgButtonOptions,
    ...options,
  };

  const buttonRef = useRef<HTMLButtonElement>(null);

  const isClicked = useRef(false);

  const holdTimeout = useRef<NodeJS.Timeout>();
  const [isHeld, setIsHeld] = useState(false);
  const isHeldRef = useRef(false);

  const hoverTimeout = useRef<NodeJS.Timeout>();
  const [isHover, setIsHover] = useState(false);

  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    window.addEventListener("mouseup", handleMouseUp);

    isClicked.current = true;

    if (mouseDownFunction) {
      mouseDownFunction(event);
    }

    if (holdFunction && clickTimeout.current === null) {
      holdTimeout.current = setTimeout(() => {
        isHeldRef.current = true;
        setIsHeld(true);
      }, fgButtonOptions.holdTimeoutDuration);
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    window.removeEventListener("mouseup", handleMouseUp);

    if (mouseUpFunction) {
      mouseUpFunction(event);
    }

    if (isClicked.current && clickTimeout.current === null) {
      if (!isHeldRef.current) {
        if (doubleClickFunction) {
          clickTimeout.current = setTimeout(() => {
            if (clickFunction)
              clickFunction(event as unknown as React.MouseEvent);
            if (clickTimeout.current !== null) {
              clearTimeout(clickTimeout.current);
              clickTimeout.current = null;
            }
          }, fgButtonOptions.doubleClickTimeoutDuration);
        } else {
          if (clickFunction)
            clickFunction(event as unknown as React.MouseEvent);
        }
      } else {
        if (holdFunction) {
          holdFunction(event as unknown as React.MouseEvent);
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

  const handleDoubleClick = (event: React.MouseEvent) => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }
    if (doubleClickFunction) {
      doubleClickFunction(event);
    }
    isClicked.current = false;
  };

  const handleMouseEnter = () => {
    if (hoverContent && !hoverTimeout.current) {
      hoverTimeout.current = setTimeout(() => {
        setIsHover(true);
      }, fgButtonOptions.hoverTimeoutDuration);

      document.addEventListener("mousemove", handleMouseMove);
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    const buttonElement = externalRef?.current || buttonRef.current;

    if (buttonElement && !buttonElement.contains(event.target as Node)) {
      setIsHover(false);
      if (hoverTimeout.current !== undefined) {
        clearTimeout(hoverTimeout.current);
        hoverTimeout.current = undefined;
      }

      document.removeEventListener("mousemove", handleMouseMove);
    }
  };

  const ButtonComponent = animationOptions ? motion.button : "button";

  return (
    <>
      <ButtonComponent
        id={externalId}
        ref={externalRef ? externalRef : buttonRef}
        onMouseDown={(event) => handleMouseDown(event)}
        className={className}
        style={style}
        data-value={fgButtonOptions.defaultDataValue}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={handleMouseEnter}
        disabled={fgButtonOptions.disabled}
        {...(animationOptions && {
          variants: animationOptions.variants,
          transition: animationOptions.transition,
          initial: animationOptions.initial,
          animate: animationOptions.animate,
          exit: animationOptions.exit,
          whileHover: animationOptions.whileHover,
        })}
        {...rest}
      >
        {contentFunction && contentFunction()}
      </ButtonComponent>
      {hoverContent && !isHeld && (
        <AnimatePresence>
          {isHover && (
            <Suspense fallback={<div>Loading...</div>}>
              <FgPortal
                type={fgButtonOptions.hoverType}
                content={hoverContent}
                externalRef={externalRef ? externalRef : buttonRef}
              />
            </Suspense>
          )}
        </AnimatePresence>
      )}
      {holdFunction && holdContent && (
        <AnimatePresence>
          {isHeld && (
            <Suspense fallback={<div>Loading...</div>}>
              <FgPortal
                type={fgButtonOptions.holdType}
                content={holdContent}
                externalRef={externalRef ? externalRef : buttonRef}
              />
            </Suspense>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
