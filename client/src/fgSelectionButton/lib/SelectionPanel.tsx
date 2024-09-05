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
  previousPanels,
  portal,
  position,
  selections,
  externalRef,
  externalPanelRef,
}: {
  previousPanels: React.MutableRefObject<string[]>;
  portal: boolean;
  position: "left" | "right";
  selections: RecursiveSelections;
  externalRef?: React.RefObject<HTMLElement>;
  externalPanelRef?: React.RefObject<HTMLDivElement>;
}) {
  const [portalPosition, setPortalPosition] = useState<{
    position: "left" | "right";
    left: number;
    top: number;
  } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [panelElements, setPanelElements] = useState<React.ReactElement[]>([]);

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
            previousPanels={previousPanels}
            content={selection}
            selections={selectionValue}
          />,
        ]);
      }
    }
  }, [selections]);

  useEffect(() => {
    getStaticPanelPosition();
  }, [panelElements]);

  const getStaticPanelPosition = () => {
    const externalRect = externalRef?.current?.getBoundingClientRect();
    const portalRef = externalPanelRef ? externalPanelRef : panelRef;
    const viewportWidth = window.innerWidth;

    if (!externalRect || !portalRef.current) {
      return;
    }

    const top =
      externalRect.top +
      externalRect.height / 2 -
      portalRef.current.clientHeight / 2;

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

  if (portal) {
    return ReactDOM.createPortal(
      <motion.div
        ref={externalPanelRef ? externalPanelRef : panelRef}
        className='max-h-80 w-max absolute z-[99999999999999] p-2 m-2 shadow-md rounded bg-white font-K2D text-lg'
        style={{
          top: `${portalPosition?.top}px`,
          left: `${portalPosition?.left}px`,
        }}
        variants={SelectionPanelVar}
        initial='init'
        animate='animate'
        exit='init'
        transition={SelectionPanelTransition}
      >
        {panelElements}
        <div
          className={`h-full w-2 absolute ${
            portalPosition?.position === "right" ? "right-full" : "left-full"
          } top-0`}
        ></div>
      </motion.div>,
      document.body
    );
  } else {
    return (
      <div
        ref={externalPanelRef ? externalPanelRef : panelRef}
        className='max-h-80 w-max absolute top-1/2 -translate-y-1/2 m-2 z-[99999999999999]'
        style={{
          left:
            portalPosition?.position === "right"
              ? `calc(100% + 0.5rem)`
              : undefined,
          right:
            portalPosition?.position !== "right"
              ? `calc(100% + 0.5rem)`
              : undefined,
        }}
      >
        <motion.div
          className='max-h-80 h-full w-full overflow-y-auto p-2 shadow-md rounded bg-white font-K2D text-lg flex flex-col space-y-1'
          variants={SelectionPanelVar}
          initial='init'
          animate='animate'
          exit='init'
          transition={SelectionPanelTransition}
        >
          {panelElements}
        </motion.div>
        <div
          className={`h-full w-4 absolute ${
            portalPosition?.position === "right" ? "right-full" : "left-full"
          } top-0`}
        ></div>
      </div>
    );
  }
}
