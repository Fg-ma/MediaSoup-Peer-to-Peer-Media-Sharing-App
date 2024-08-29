import React, { useRef, useState } from "react";
import { RecursiveSelections } from "../FgSelectionButton";
import SelectionPanel from "./SelectionPanel";

export default function ExpandingSelectionPanelButton({
  content,
  selections,
}: {
  content: string;
  selections: RecursiveSelections;
}) {
  const [expanded, setExpanded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: MouseEvent) => {
    if (
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setExpanded(false);
    }
  };

  return (
    <div
      ref={buttonRef}
      onMouseEnter={() => {
        setExpanded(true);

        document.addEventListener("mousemove", handleMouseMove);
      }}
    >
      {content}
      {expanded && <SelectionPanel selections={selections} />}
    </div>
  );
}
