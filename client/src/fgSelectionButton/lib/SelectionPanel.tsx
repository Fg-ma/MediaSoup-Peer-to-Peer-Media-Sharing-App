import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { motion, Transition, Variants } from "framer-motion";
import { RecursiveSelections } from "../FgSelectionButton";
import SelectionPanelButton from "./SelectionPanelButton";
import ExpandingSelectionPanelButton from "./ExpandingSelectionPanelButton";

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

  const handleHoverScrollUpMouseMove = (event: MouseEvent) => {
    if (!scrollUpButtonRef.current?.contains(event.target as Node)) {
      document.removeEventListener("mousemove", handleHoverScrollUpMouseMove);

      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
        scrollInterval.current = undefined;
      }
    }
  };

  const handleHoverScrollUp = () => {
    document.addEventListener("mousemove", handleHoverScrollUpMouseMove);

    if (!scrollInterval.current) {
      scrollInterval.current = setInterval(() => {
        if (scrollingContainerRef.current) {
          scrollingContainerRef.current.scrollTop -= 1; // Scroll upwards
        }
      }, 2);
    }
  };

  const handleHoverScrollDownMouseMove = (event: MouseEvent) => {
    if (!scrollDownButtonRef.current?.contains(event.target as Node)) {
      document.removeEventListener("mousemove", handleHoverScrollDownMouseMove);

      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
        scrollInterval.current = undefined;
      }
    }
  };

  const handleHoverScrollDown = () => {
    document.addEventListener("mousemove", handleHoverScrollDownMouseMove);

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
      className='max-h-80 w-max absolute z-[99999999999999] flex'
      style={{
        top: `${portalPosition?.top}px`,
        left: `${portalPosition?.left}px`,
      }}
    >
      {portalPosition?.position === "right" && (
        <div className='flex flex-col'>
          <div
            className={`${isParentScrolling ? "w-[3.1875rem]" : "w-4"} grow`}
          ></div>
        </div>
      )}
      {scrollingAvailable && (
        <div
          ref={scrollUpButtonRef}
          className={`absolute top-0 h-4 z-[999999999999999] ${
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
          onMouseEnter={handleHoverScrollUp}
        ></div>
      )}
      <div
        className={`px-2 max-h-80 h-max w-full shadow-md rounded bg-white ${
          scrollingAvailable ? "py-4" : "py-2"
        }`}
      >
        {scrollingAvailable && (
          <div
            className={`absolute top-4 pointer-events-none z-[999999999999999] ${
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
          className='small-vertical-scroll-bar max-h-[18rem] h-max w-full overflow-y-auto font-K2D text-lg flex flex-col space-y-1'
          variants={SelectionPanelVar}
          initial='init'
          animate='animate'
          exit='init'
          transition={SelectionPanelTransition}
        >
          {scrollingAvailable && <div className='w-full min-h-1.5'></div>}
          {panelElements}
          {scrollingAvailable && <div className='w-full min-h-1.5'></div>}
        </motion.div>
      </div>
      {scrollingAvailable && (
        <div
          ref={scrollDownButtonRef}
          className={`absolute bottom-0 h-4 z-[999999999999999] ${
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
          onMouseEnter={handleHoverScrollDown}
        ></div>
      )}
      {portalPosition?.position === "left" && (
        <div className='flex flex-col'>
          <div className='w-4 grow'></div>
        </div>
      )}
    </div>,
    document.body
  );
}
