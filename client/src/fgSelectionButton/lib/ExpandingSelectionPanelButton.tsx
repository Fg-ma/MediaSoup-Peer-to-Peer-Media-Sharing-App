import React, { useRef, useState } from "react";
import { RecursiveSelections } from "../FgSelectionButton";
import SelectionPanel from "./SelectionPanel";

export default function ExpandingSelectionPanelButton({
  previousPanels,
  content,
  selections,
}: {
  previousPanels: React.MutableRefObject<string[]>;
  content: string;
  selections: RecursiveSelections;
}) {
  const [expanded, setExpanded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: MouseEvent) => {
    if (
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node) &&
      !panelRef.current?.contains(event.target as Node)
    ) {
      previousPanels.current = previousPanels.current.filter(
        (panel) => panel !== selections.value
      );
      setExpanded(false);
    }
  };

  return (
    <div
      ref={buttonRef}
      className='cursor-default relative px-2 w-full h-8 hover:bg-fg-white-80'
      onMouseEnter={() => {
        previousPanels.current.push(selections.value);
        setExpanded(true);
        document.addEventListener("mousemove", handleMouseMove);
      }}
    >
      {content}
      {expanded && (
        <SelectionPanel
          previousPanels={previousPanels}
          portal={false}
          position='right'
          selections={selections}
          externalRef={buttonRef}
          externalPanelRef={panelRef}
        />
      )}
    </div>
  );
}
