import React, {
  useState,
  useRef,
  Suspense,
  useEffect,
  useCallback,
} from "react";
import { AnimatePresence, Transition, Variants, motion } from "framer-motion";
import FgButtonController from "./lib/FgButtonController";

const FgPortal = React.lazy(() => import("../fgPortal/FgPortal"));

export type FgButtonOptions = {
  defaultDataValue?: string;
  holdTimeoutDuration?: number;
  doubleClickTimeoutDuration?: number;
  hoverTimeoutDuration?: number;
  hoverZValue?: number;
  hoverType?: "above" | "below" | "left" | "right";
  hoverSpacing?: number;
  holdType?: "above" | "below" | "left" | "right";
  holdKind?: "disappear" | "toggle";
  holdSpacing?: number;
  disabled?: boolean;
};

const defaultFgButtonOptions: {
  defaultDataValue?: string;
  holdTimeoutDuration: number;
  doubleClickTimeoutDuration: number;
  hoverTimeoutDuration: number;
  hoverType: "above" | "below" | "left" | "right";
  hoverSpacing?: number;
  holdType: "above" | "below" | "left" | "right";
  holdKind: "disappear" | "toggle";
  holdSpacing?: number;
  disabled: boolean;
} = {
  defaultDataValue: undefined,
  holdTimeoutDuration: 500,
  doubleClickTimeoutDuration: 250,
  hoverTimeoutDuration: 50,
  hoverType: "above",
  hoverSpacing: undefined,
  holdType: "above",
  holdKind: "disappear",
  holdSpacing: undefined,
  disabled: false,
};

export default function FgButton({
  externalId,
  externalRef,
  scrollingContainerRef,
  clickFunction,
  mouseDownFunction,
  mouseUpFunction,
  touchStartFunction,
  touchEndFunction,
  holdFunction,
  contentFunction,
  doubleClickFunction,
  dragFunction,
  referenceDragElement,
  focusFunction,
  blurFunction,
  holdContent,
  hoverContent,
  toggleClickContent,
  closeHoldToggle,
  setCloseHoldToggle,
  closeClickToggle,
  setCloseClickToggle,
  className,
  style,
  options,
  animationOptions,
  ...rest
}: {
  externalId?: string;
  externalRef?: React.RefObject<HTMLButtonElement>;
  scrollingContainerRef?: React.RefObject<HTMLDivElement>;
  clickFunction?: (event: React.MouseEvent) => void;
  mouseDownFunction?: (event: React.MouseEvent) => void;
  mouseUpFunction?: (event: MouseEvent) => void;
  touchStartFunction?: (event: React.TouchEvent) => void;
  touchEndFunction?: (event: React.TouchEvent) => void;
  holdFunction?: (event: React.MouseEvent<Element, MouseEvent>) => void;
  contentFunction?: () => React.ReactElement | undefined;
  doubleClickFunction?: (event: React.MouseEvent) => void;
  dragFunction?: (
    displacement: { x: number; y: number },
    event: MouseEvent
  ) => void;
  referenceDragElement?: React.RefObject<HTMLElement>;
  focusFunction?: (event: React.FocusEvent) => void;
  blurFunction?: (event: React.FocusEvent) => void;
  holdContent?: React.ReactElement;
  hoverContent?: React.ReactElement;
  toggleClickContent?: React.ReactElement;
  closeHoldToggle?: boolean;
  setCloseHoldToggle?: React.Dispatch<React.SetStateAction<boolean>>;
  closeClickToggle?: boolean;
  setCloseClickToggle?: React.Dispatch<React.SetStateAction<boolean>>;
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

  const holdTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const [isHeld, setIsHeld] = useState(false);
  const [isHeldToggle, setIsHeldToggle] = useState(false);
  const isHeldRef = useRef(false);
  const holdContentRef = useRef<HTMLDivElement>(null);

  const hoverTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const [isHover, setIsHover] = useState(false);

  const [isClickToggle, setIsClickToggle] = useState(false);
  const toggleClickContentRef = useRef<HTMLDivElement>(null);

  const clickTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const startDragPosition = useRef<{ x: number; y: number } | undefined>(
    undefined
  );

  // Use useCallback to memoize the toggleHold function
  const toggleHold = useCallback(
    (event: MouseEvent) => {
      if (
        !holdContentRef.current ||
        !holdContentRef.current.contains(event.target as Node)
      ) {
        window.removeEventListener("mousedown", toggleHold);
        setIsHeldToggle(false);
      }
    },
    [holdContentRef, setIsHeldToggle]
  );

  // Use useCallback to memoize the togglePopup function
  const togglePopup = useCallback(
    (event: MouseEvent) => {
      if (
        !toggleClickContentRef.current ||
        !toggleClickContentRef.current.contains(event.target as Node)
      ) {
        window.removeEventListener("mouseup", togglePopup);
        setIsClickToggle(false);
      }
    },
    [toggleClickContentRef, setIsClickToggle]
  );

  const fgButtonController = new FgButtonController(
    fgButtonOptions,
    clickFunction,
    mouseDownFunction,
    mouseUpFunction,
    doubleClickFunction,
    holdFunction,
    dragFunction,
    toggleHold,
    togglePopup,
    hoverContent,
    toggleClickContent,
    clickTimeout,
    holdTimeout,
    hoverTimeout,
    isClicked,
    setIsClickToggle,
    isClickToggle,
    setIsHeld,
    isHeldRef,
    setIsHeldToggle,
    setIsHover,
    startDragPosition,
    buttonRef,
    externalRef,
    scrollingContainerRef,
    referenceDragElement
  );

  useEffect(() => {
    if (closeHoldToggle) {
      window.removeEventListener("mousedown", toggleHold);
      setIsHeldToggle(false);
      if (setCloseHoldToggle) setCloseHoldToggle(false);
    }
  }, [closeHoldToggle]);

  useEffect(() => {
    if (closeClickToggle) {
      window.removeEventListener("mouseup", togglePopup);
      setIsClickToggle(false);
      if (setCloseClickToggle) setCloseClickToggle(false);
    }
  }, [closeClickToggle]);

  const ButtonComponent = animationOptions ? motion.button : "button";

  return (
    <>
      <ButtonComponent
        id={externalId}
        ref={externalRef ? externalRef : buttonRef}
        onMouseDown={(event) => fgButtonController.handleMouseDown(event)}
        onTouchStart={touchStartFunction}
        onTouchEnd={touchEndFunction}
        className={className}
        style={style}
        data-value={fgButtonOptions.defaultDataValue}
        onDoubleClick={fgButtonController.handleDoubleClick}
        onMouseEnter={fgButtonController.handleMouseEnter}
        onFocus={focusFunction}
        onBlur={blurFunction}
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
                spacing={fgButtonOptions.hoverSpacing}
                content={hoverContent}
                externalRef={externalRef ? externalRef : buttonRef}
                zValue={fgButtonOptions.hoverZValue}
              />
            </Suspense>
          )}
        </AnimatePresence>
      )}
      {toggleClickContent && (
        <AnimatePresence>
          {isClickToggle && (
            <Suspense fallback={<div>Loading...</div>}>
              <FgPortal
                type={fgButtonOptions.hoverType}
                spacing={fgButtonOptions.holdSpacing}
                content={toggleClickContent}
                externalRef={externalRef ? externalRef : buttonRef}
                externalPortalRef={toggleClickContentRef}
                zValue={fgButtonOptions.hoverZValue}
              />
            </Suspense>
          )}
        </AnimatePresence>
      )}
      {holdFunction && holdContent && (
        <AnimatePresence>
          {(isHeld || isHeldToggle) && (
            <Suspense fallback={<div>Loading...</div>}>
              <FgPortal
                type={fgButtonOptions.holdType}
                content={holdContent}
                externalRef={externalRef ? externalRef : buttonRef}
                externalPortalRef={holdContentRef}
                zValue={9999999999}
              />
            </Suspense>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
