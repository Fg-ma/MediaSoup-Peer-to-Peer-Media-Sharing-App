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

    if (!externalRect || !portalRef.current) {
      return;
    }

    const top =
      externalRect.top +
      externalRect.height / 2 -
      portalRef.current.clientHeight / 2;

    let left: number = 0;
    if (position === "left") {
      left = externalRect.left - portalRef.current.clientWidth;
    } else if (position === "right") {
      left = externalRect.right;
    }

    setPortalPosition({
      top: top,
      left: left,
    });
  };

  if (portal) {
    return ReactDOM.createPortal(
      <motion.div
        ref={externalPanelRef ? externalPanelRef : panelRef}
        className='w-max absolute z-[99999999999999] py-2 m-2 shadow-md rounded bg-white font-K2D text-lg'
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
        <div className='h-full w-2 absolute right-full top-0'></div>
      </motion.div>,
      document.body
    );
  } else {
    return (
      <motion.div
        ref={externalPanelRef ? externalPanelRef : panelRef}
        className='w-max absolute left-full top-1/2 -translate-y-1/2 m-2 z-[99999999999999] py-2 shadow-md rounded bg-white font-K2D text-lg'
        variants={SelectionPanelVar}
        initial='init'
        animate='animate'
        exit='init'
        transition={SelectionPanelTransition}
      >
        {panelElements}
        <div className='h-full w-2 absolute right-full top-0'></div>
      </motion.div>
    );
  }
}
