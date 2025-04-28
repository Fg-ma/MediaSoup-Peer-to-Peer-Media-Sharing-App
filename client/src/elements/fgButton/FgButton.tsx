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
  toggleClickCloseWhenOutside?: boolean;
  dragPreventDefault?: boolean;
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
  toggleClickCloseWhenOutside: boolean;
  dragPreventDefault: boolean;
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
  toggleClickCloseWhenOutside: true,
  dragPreventDefault: false,
};

export default function FgButton({
  externalId,
  externalRef,
  scrollingContainerRef,
  clickFunction,
  pointerDownFunction,
  pointerUpFunction,
  holdFunction,
  contentFunction,
  doubleClickFunction,
  dragFunction,
  startDragFunction,
  stopDragFunction,
  referenceDragElement,
  focusFunction,
  blurFunction,
  holdContent,
  hoverContent,
  toggleClickContent,
  closeHoldToggle,
  setCloseHoldToggle,
  setExternalClickToggleState,
  holdToggleExclusionRefs,
  className,
  style,
  type = "button",
  options,
  animationOptions,
  ...rest
}: {
  externalId?: string;
  externalRef?: React.RefObject<HTMLButtonElement>;
  scrollingContainerRef?: React.RefObject<HTMLDivElement>;
  clickFunction?: (event: React.MouseEvent) => void;
  pointerDownFunction?: (event: React.PointerEvent) => void;
  pointerUpFunction?: (event: PointerEvent) => void;
  holdFunction?: (event: PointerEvent) => void;
  contentFunction?: () => React.ReactElement | undefined;
  doubleClickFunction?: (event: React.MouseEvent) => void;
  dragFunction?: (
    displacement: { x: number; y: number },
    event: PointerEvent,
  ) => void;
  startDragFunction?: (event: React.DragEvent<HTMLButtonElement>) => void;
  stopDragFunction?: (event: React.DragEvent<HTMLButtonElement>) => void;
  referenceDragElement?: React.RefObject<HTMLElement>;
  focusFunction?: (event: React.FocusEvent) => void;
  blurFunction?: (event: React.FocusEvent) => void;
  holdContent?: React.ReactElement;
  hoverContent?: React.ReactElement;
  toggleClickContent?: React.ReactElement;
  closeHoldToggle?: boolean;
  setCloseHoldToggle?: React.Dispatch<React.SetStateAction<boolean>>;
  setExternalClickToggleState?: React.Dispatch<React.SetStateAction<boolean>>;
  holdToggleExclusionRefs?: React.RefObject<HTMLDivElement>[];
  className?: string;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
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
    undefined,
  );

  // Use useCallback to memoize the toggleHold function
  const toggleHold = useCallback(
    (event: PointerEvent) => {
      if (
        !holdContentRef.current?.contains(event.target as Node) &&
        !holdToggleExclusionRefs?.some((ref) =>
          ref.current?.contains(event.target as Node),
        )
      ) {
        document.removeEventListener("pointerdown", toggleHold);
        setIsHeldToggle(false);
      }
    },
    [holdContentRef, setIsHeldToggle],
  );

  // Use useCallback to memoize the togglePopup function
  const togglePopup = useCallback(
    (event: PointerEvent) => {
      if (
        !toggleClickContentRef.current ||
        !toggleClickContentRef.current.contains(event.target as Node)
      ) {
        if (
          !(externalRef ? externalRef : buttonRef).current?.contains(
            event.target as Node,
          )
        ) {
          setIsClickToggle(false);
          if (setExternalClickToggleState) setExternalClickToggleState(false);
        }
        document.removeEventListener("pointerup", togglePopup);
      }
    },
    [toggleClickContentRef, setIsClickToggle, setExternalClickToggleState],
  );

  const fgButtonController = new FgButtonController(
    fgButtonOptions,
    clickFunction,
    pointerDownFunction,
    pointerUpFunction,
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
    setExternalClickToggleState,
    isClickToggle,
    setIsHeld,
    isHeldRef,
    setIsHeldToggle,
    setIsHover,
    startDragPosition,
    buttonRef,
    externalRef,
    referenceDragElement,
  );

  useEffect(() => {
    if (closeHoldToggle) {
      document.removeEventListener("pointerdown", toggleHold);
      setIsHeldToggle(false);
      if (setCloseHoldToggle) setCloseHoldToggle(false);
    }
  }, [closeHoldToggle]);

  useEffect(() => {
    if (!isHover) return;

    document.addEventListener(
      "visibilitychange",
      fgButtonController.handleVisibilityChange,
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        fgButtonController.handleVisibilityChange,
      );
    };
  }, [isHover]);

  useEffect(() => {
    if (scrollingContainerRef && scrollingContainerRef.current) {
      scrollingContainerRef.current.addEventListener(
        "scroll",
        fgButtonController.handleScrollingContainerScroll,
      );
    }

    return () => {
      if (scrollingContainerRef && scrollingContainerRef.current) {
        scrollingContainerRef.current.removeEventListener(
          "scroll",
          fgButtonController.handleScrollingContainerScroll,
        );
      }
    };
  }, [scrollingContainerRef?.current]);

  const ButtonComponent = (
    animationOptions ? motion.button : "button"
  ) as React.ElementType;

  return (
    <>
      <ButtonComponent
        ref={externalRef ? externalRef : buttonRef}
        id={externalId}
        className={className}
        style={style}
        onPointerDown={fgButtonController.handlePointerDown}
        onDoubleClick={fgButtonController.handleDoubleClick}
        onPointerEnter={fgButtonController.handlePointerEnter}
        onFocus={focusFunction}
        onBlur={blurFunction}
        draggable={
          dragFunction !== undefined ||
          startDragFunction !== undefined ||
          stopDragFunction !== undefined
        }
        {...(startDragFunction && {
          onDragStart: (event: React.DragEvent<HTMLButtonElement>) => {
            if (fgButtonOptions.dragPreventDefault) {
              event.preventDefault();
              document.onpointerup = () => {
                if (stopDragFunction) stopDragFunction(event);
                document.onpointerup = null;
              };
            }
            const img = new Image();
            img.src =
              "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz4=";
            event.dataTransfer.setDragImage(img, 0, 0);
            startDragPosition.current = { x: event.clientX, y: event.clientY };
            if (startDragFunction) startDragFunction(event);
          },
        })}
        {...(dragFunction && {
          onDrag: (event: PointerEvent) => {
            fgButtonController.handleDragPointerMove(event);
          },
        })}
        {...(stopDragFunction && {
          onDragEnd: (event: React.DragEvent<HTMLButtonElement>) => {
            if (stopDragFunction) stopDragFunction(event);
          },
        })}
        data-value={fgButtonOptions.defaultDataValue}
        disabled={fgButtonOptions.disabled}
        {...(animationOptions && {
          variants: animationOptions.variants,
          transition: animationOptions.transition,
          initial: animationOptions.initial,
          animate: animationOptions.animate,
          exit: animationOptions.exit,
          whileHover: animationOptions.whileHover,
        })}
        type={type}
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
      {holdContent && (
        <AnimatePresence>
          {(isHeld || isHeldToggle) && (
            <Suspense fallback={<div>Loading...</div>}>
              <FgPortal
                type={fgButtonOptions.holdType}
                content={holdContent}
                externalRef={externalRef ? externalRef : buttonRef}
                externalPortalRef={holdContentRef}
                zValue={499900}
                spacing={fgButtonOptions.holdSpacing}
              />
            </Suspense>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
