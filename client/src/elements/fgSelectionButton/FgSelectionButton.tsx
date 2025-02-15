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
  pointerDownFunction,
  pointerUpFunction,
  options,
}: {
  content: React.ReactElement;
  selections: RecursiveSelections;
  valueSelectionFunction?: (value: string[]) => void;
  pointerDownFunction?: (event: React.PointerEvent) => void;
  pointerUpFunction?: (event: PointerEvent) => void;
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

  const handlePointerDown = (event: React.PointerEvent) => {
    if (!selectionPanelActive) {
      previousPanels.current = [];
      setSelectionPanelActive(true);

      if (pointerDownFunction) {
        pointerDownFunction(event);
      }

      if (fgSelectionButtonOptions.mode === "pick") {
        setTimeout(() => {
          document.addEventListener("pointerdown", handlePointerUp);
        }, 0);
      }
    }
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (fgSelectionButtonOptions.mode === "pick") {
      document.removeEventListener("pointerdown", handlePointerUp);
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

    if (pointerUpFunction) {
      pointerUpFunction(event);
    }
  };

  return (
    <FgButton
      externalRef={buttonRef}
      className='relative'
      pointerDownFunction={handlePointerDown}
      {...(fgSelectionButtonOptions.mode === "hold"
        ? { pointerUpFunction: handlePointerUp }
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
