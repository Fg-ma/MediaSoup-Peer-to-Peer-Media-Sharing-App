import React, { useRef, useState } from "react";
import FgButton from "../fgButton/FgButton";
import SelectionPanel from "./lib/SelectionPanel";
import { AnimatePresence } from "framer-motion";

export type RecursiveSelections = {
  value: string;
  [selection: string]: any | RecursiveSelections;
};

export default function FgSelectionButton({
  content,
  selections,
  valueSelectionFunction,
  mouseDownFunction,
  mouseUpFunction,
}: {
  content: React.ReactElement;
  selections: RecursiveSelections;
  valueSelectionFunction?: (value: string[]) => void;
  mouseDownFunction?: (event: React.MouseEvent) => void;
  mouseUpFunction?: (event: MouseEvent) => void;
}) {
  const [selectionPanelActive, setSelectionPanelActive] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const previousPanels = useRef<string[]>([]);
  const panelRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

  const handleMouseDown = (event: React.MouseEvent) => {
    previousPanels.current = [];
    setSelectionPanelActive(true);

    if (mouseDownFunction) {
      mouseDownFunction(event);
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    setSelectionPanelActive(false);

    if (valueSelectionFunction) {
      const target = event.target as HTMLElement;

      if (!target) {
        return;
      }

      const selectionValue = target.getAttribute("data-selection-value");

      if (selectionValue) {
        valueSelectionFunction(selectionValue.split("-fg-"));
      }
    }

    if (mouseUpFunction) {
      mouseUpFunction(event);
    }
  };

  return (
    <FgButton
      externalRef={buttonRef}
      className='relative'
      mouseDownFunction={handleMouseDown}
      mouseUpFunction={handleMouseUp}
      contentFunction={() => (
        <>
          {content}
          {selectionPanelActive && (
            <SelectionPanel
              panelRefs={panelRefs}
              previousPanels={previousPanels}
              position='right'
              selections={selections}
              externalRef={buttonRef}
            />
          )}
        </>
      )}
    />
  );
}
