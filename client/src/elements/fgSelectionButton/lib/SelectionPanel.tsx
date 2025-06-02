import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { motion, Transition, Variants } from "framer-motion";
import SelectionPanelButton from "./SelectionPanelButton";
import ExpandingSelectionPanelButton from "./ExpandingSelectionPanelButton";
import { RecursiveSelections } from "../FgSelectionButton";

const SelectionPanelVar: Variants = {
  init: { opacity: 0 },
  animate: { opacity: 1 },
};

const SelectionPanelTransition: Transition = {
  transition: {
    opacity: { duration: 0.025 },
  },
};

export default function SelectionPanel({
  panelRefs,
  previousPanels,
  position,
  selections,
  isParentScrolling,
  externalRef,
  externalPanelRef,
  onRendered,
}: {
  panelRefs: React.MutableRefObject<React.RefObject<HTMLDivElement>[]>;
  previousPanels: React.MutableRefObject<string[]>;
  position: "left" | "right";
  selections: RecursiveSelections;
  isParentScrolling: boolean;
  externalRef?: React.RefObject<HTMLElement>;
  externalPanelRef?: React.RefObject<HTMLDivElement>;
  onRendered?: () => void;
}) {
  const [portalPosition, setPortalPosition] = useState<{
    position: "left" | "right";
    left: number;
    top: number;
  } | null>(null);
  const [panelElements, setPanelElements] = useState<React.ReactElement[]>([]);
  const [scrollingAvailable, setScrollingAvailable] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollingContainerRef = useRef<HTMLDivElement>(null);
  const scrollUpButtonRef = useRef<HTMLDivElement>(null);
  const scrollDownButtonRef = useRef<HTMLDivElement>(null);
  const scrollInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (onRendered) onRendered();
  }, []);

  useEffect(() => {
    if (
      scrollingContainerRef.current &&
      scrollingContainerRef.current.clientHeight !==
        scrollingContainerRef.current.scrollHeight
    ) {
      setScrollingAvailable(true);
    } else {
      setScrollingAvailable(false);
    }
  }, [
    scrollingContainerRef.current?.clientHeight,
    scrollingContainerRef.current?.scrollHeight,
  ]);

  useEffect(() => {
    setPanelElements([]);

    for (const selection in selections) {
      const selectionValue = selections[selection];

      if (selection === "value") {
        continue;
      }

      if (typeof selectionValue !== "object") {
        setPanelElements((prev) => [
          ...prev,
          <SelectionPanelButton
            key={selection}
            previousPanels={previousPanels}
            content={selection}
            selectionValue={selectionValue}
          />,
        ]);
      } else {
        setPanelElements((prev) => [
          ...prev,
          <ExpandingSelectionPanelButton
            key={selection}
            panelRefs={panelRefs}
            previousPanels={previousPanels}
            isParentScrolling={scrollingAvailable}
            content={selection}
            selections={selectionValue}
            parentPanelRef={externalPanelRef ? externalPanelRef : panelRef}
          />,
        ]);
      }
    }
  }, [selections, scrollingAvailable]);

  useEffect(() => {
    getStaticPanelPosition();
  }, [
    panelElements,
    externalPanelRef?.current?.clientWidth,
    panelRef.current?.clientWidth,
  ]);

  const getStaticPanelPosition = () => {
    const externalRect = externalRef?.current?.getBoundingClientRect();
    const portalRef = externalPanelRef ? externalPanelRef : panelRef;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (!externalRect || !portalRef.current) {
      return;
    }

    let top =
      externalRect.top +
      externalRect.height / 2 -
      portalRef.current.clientHeight / 2;

    // Check if the panel overflows the top of the viewport
    if (top < 0) {
      top = 0; // Adjust to fit within the top boundary of the viewport
    }

    // Check if the panel overflows the bottom of the viewport
    const panelBottom = top + portalRef.current.clientHeight;
    if (panelBottom > viewportHeight) {
      // Adjust to fit within the bottom boundary of the viewport
      top = viewportHeight - portalRef.current.clientHeight;
    }

    let left: number = 0;
    let currentPosition = position;
    if (position === "left") {
      if (externalRect.left - portalRef.current.clientWidth > 0) {
        left = externalRect.left - portalRef.current.clientWidth;
      } else {
        left = externalRect.right;
        currentPosition = "right";
      }
    } else if (position === "right") {
      if (externalRect.right + portalRef.current.clientWidth < viewportWidth) {
        left = externalRect.right;
      } else {
        left = externalRect.left - portalRef.current.clientWidth;
        currentPosition = "left";
      }
    }

    setPortalPosition({
      position: currentPosition,
      top,
      left,
    });
  };

  const handleHoverScrollUpPointerMove = (event: PointerEvent) => {
    if (!scrollUpButtonRef.current?.contains(event.target as Node)) {
      document.removeEventListener(
        "pointermove",
        handleHoverScrollUpPointerMove,
      );

      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
        scrollInterval.current = undefined;
      }
    }
  };

  const handleHoverScrollUp = () => {
    document.addEventListener("pointermove", handleHoverScrollUpPointerMove);

    if (!scrollInterval.current) {
      scrollInterval.current = setInterval(() => {
        if (scrollingContainerRef.current) {
          scrollingContainerRef.current.scrollTop -= 1; // Scroll upwards
        }
      }, 2);
    }
  };

  const handleHoverScrollDownPointerMove = (event: PointerEvent) => {
    if (!scrollDownButtonRef.current?.contains(event.target as Node)) {
      document.removeEventListener(
        "pointermove",
        handleHoverScrollDownPointerMove,
      );

      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
        scrollInterval.current = undefined;
      }
    }
  };

  const handleHoverScrollDown = () => {
    document.addEventListener("pointermove", handleHoverScrollDownPointerMove);

    if (!scrollInterval.current) {
      scrollInterval.current = setInterval(() => {
        if (scrollingContainerRef.current) {
          scrollingContainerRef.current.scrollTop += 1; // Scroll downwards
        }
      }, 2);
    }
  };

  return ReactDOM.createPortal(
    <div
      ref={externalPanelRef ? externalPanelRef : panelRef}
      className="absolute z-selection-button-panel flex max-h-80 w-max"
      style={{
        top: `${portalPosition?.top}px`,
        left: `${portalPosition?.left}px`,
      }}
    >
      {portalPosition?.position === "right" && (
        <div className="flex flex-col">
          <div
            className={`${isParentScrolling ? "w-[3.1875rem]" : "w-4"} grow`}
          ></div>
        </div>
      )}
      {scrollingAvailable && (
        <div
          ref={scrollUpButtonRef}
          className={`absolute top-0 z-10 h-4 ${
            portalPosition?.position === "right"
              ? isParentScrolling
                ? "left-[3.1875rem]"
                : "left-4"
              : "left-0"
          }`}
          style={{
            // prettier-ignore
            width: `calc(100% - ${isParentScrolling && portalPosition?.position === "right" ? "5.75rem" : "3.5rem"})`,
          }}
          onPointerEnter={handleHoverScrollUp}
        ></div>
      )}
      <div
        className={`h-max max-h-80 w-full rounded bg-fg-white px-2 shadow-md ${
          scrollingAvailable ? "py-4" : "py-2"
        }`}
      >
        {scrollingAvailable && (
          <div
            className={`pointer-events-none absolute top-4 z-10 ${
              portalPosition?.position === "right"
                ? isParentScrolling
                  ? "left-[3.6875rem]"
                  : "left-6"
                : "left-1"
            }`}
            style={{
              // prettier-ignore
              width: `calc(100% - ${isParentScrolling && portalPosition?.position === "right" ? "5.75rem" : "3.5rem"})`,
              height: "calc(100% - 2rem)",
              // prettier-ignore
              boxShadow: "inset 0px 10px 8px -4px rgba(255, 255, 255, 1), inset 0px -10px 8px -4px rgba(255, 255, 255, 1)",
            }}
          />
        )}
        <motion.div
          ref={scrollingContainerRef}
          className="small-vertical-scroll-bar flex h-max max-h-[18rem] w-full flex-col space-y-1 overflow-y-auto font-K2D text-lg"
          variants={SelectionPanelVar}
          initial="init"
          animate="animate"
          exit="init"
          transition={SelectionPanelTransition}
        >
          {scrollingAvailable && <div className="min-h-1.5 w-full"></div>}
          {panelElements}
          {scrollingAvailable && <div className="min-h-1.5 w-full"></div>}
        </motion.div>
      </div>
      {scrollingAvailable && (
        <div
          ref={scrollDownButtonRef}
          className={`absolute bottom-0 z-10 h-4 ${
            portalPosition?.position === "right"
              ? isParentScrolling
                ? "left-[3.1875rem]"
                : "left-4"
              : "left-0"
          }`}
          style={{
            // prettier-ignore
            width: `calc(100% - ${isParentScrolling && portalPosition?.position === "right" ? "5.75rem" : "3.5rem"})`,
          }}
          onPointerEnter={handleHoverScrollDown}
        ></div>
      )}
      {portalPosition?.position === "left" && (
        <div className="flex flex-col">
          <div className="w-4 grow"></div>
        </div>
      )}
    </div>,
    document.body,
  );
}
