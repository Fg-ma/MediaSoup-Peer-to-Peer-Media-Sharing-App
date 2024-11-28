import React, { useRef, useState } from "react";
import FgButton from "../fgButton/FgButton";
import SelectionPanel from "./lib/SelectionPanel";

export type RecursiveSelections = {
  value: string;
  [selection: string]: string | RecursiveSelections;
};

const defaultFgSelectionButtonOptions = {
  mode: "hold",
};

export default function FgSelectionButton({
  content,
  selections,
  valueSelectionFunction,
  mouseDownFunction,
  mouseUpFunction,
  options,
}: {
  content: React.ReactElement;
  selections: RecursiveSelections;
  valueSelectionFunction?: (value: string[]) => void;
  mouseDownFunction?: (event: React.MouseEvent) => void;
  mouseUpFunction?: (event: MouseEvent) => void;
  options?: {
    mode?: "hold" | "pick";
  };
}) {
  const fgSelectionButtonOptions = {
    ...defaultFgSelectionButtonOptions,
    ...options,
  };

  const [selectionPanelActive, setSelectionPanelActive] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const previousPanels = useRef<string[]>([]);
  const panelRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

  const handleMouseDown = (event: React.MouseEvent) => {
    if (!selectionPanelActive) {
      previousPanels.current = [];
      setSelectionPanelActive(true);

      if (mouseDownFunction) {
        mouseDownFunction(event);
      }

      if (fgSelectionButtonOptions.mode === "pick") {
        setTimeout(() => {
          document.addEventListener("mousedown", handleMouseUp);
        }, 0);
      }
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (fgSelectionButtonOptions.mode === "pick") {
      document.removeEventListener("mousedown", handleMouseUp);
    }

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
      {...(fgSelectionButtonOptions.mode === "hold"
        ? { mouseUpFunction: handleMouseUp }
        : {})}
      contentFunction={() => (
        <>
          {content}
          {selectionPanelActive && (
            <SelectionPanel
              panelRefs={panelRefs}
              previousPanels={previousPanels}
              position='right'
              selections={selections}
              isParentScrolling={false}
              externalRef={buttonRef}
            />
          )}
        </>
      )}
    />
  );
}
