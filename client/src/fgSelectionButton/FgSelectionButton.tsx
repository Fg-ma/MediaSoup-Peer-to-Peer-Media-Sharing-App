import React, { useState } from "react";
import FgButton from "../fgButton/FgButton";
import SelectionPanel from "./lib/SelectionPanel";

export type RecursiveSelections = {
  [selection: string]: any | RecursiveSelections;
};

export default function FgSelectionButton({
  content,
  selections,
  externalRef,
  valueSelectionFunction,
}: {
  content: React.ReactElement;
  selections: RecursiveSelections;
  externalRef?: HTMLElement;
  valueSelectionFunction?: (value: any) => void;
}) {
  const [selectionPanelActive, setSelectionPanelActive] = useState(false);

  const handleMouseDown = () => {
    setSelectionPanelActive(true);
  };

  const handleMouseUp = (event: MouseEvent) => {
    setSelectionPanelActive(false);

    if (valueSelectionFunction) {
      const target = event.target as HTMLElement;

      if (!target) {
        return;
      }

      const selectionValue = target.getAttribute("data-selection-value");

      valueSelectionFunction(selectionValue);
    }
  };

  return (
    <FgButton
      mouseDownFunction={handleMouseDown}
      mouseUpFunction={handleMouseUp}
      contentFunction={() => (
        <>
          {content}
          {selectionPanelActive && <SelectionPanel selections={selections} />}
        </>
      )}
    />
  );
}
