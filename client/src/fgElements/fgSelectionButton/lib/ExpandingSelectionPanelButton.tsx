import React, { useEffect, useRef, useState } from "react";
import SelectionPanel from "./SelectionPanel";
import { RecursiveSelections } from "../FgSelectionButton";

export default function ExpandingSelectionPanelButton({
  panelRefs,
  previousPanels,
  isParentScrolling,
  content,
  selections,
  parentPanelRef,
}: {
  panelRefs: React.MutableRefObject<React.RefObject<HTMLDivElement>[]>;
  previousPanels: React.MutableRefObject<string[]>;
  isParentScrolling: boolean;
  content: string;
  selections: RecursiveSelections;
  parentPanelRef: React.RefObject<HTMLDivElement>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [_, setRerender] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef.current !== null) {
      panelRefs.current.push(panelRef);
    }

    return () => {
      if (panelRef.current !== null) {
        panelRefs.current = panelRefs.current.filter((ref) => ref !== panelRef);
      }
    };
  }, [panelRef.current]);

  const handleMouseMove = (event: MouseEvent) => {
    // Find the index of the current panelRef in panelRefs
    const panelIndex = panelRefs.current.findIndex(
      (ref) => ref.current === panelRef.current
    );

    // Check if the mouse is within any of the panels from this index onward
    const isInPanel = panelRefs.current.slice(panelIndex).some((ref) => {
      return ref.current?.contains(event.target as Node) ?? false;
    });

    if (!isInPanel && !buttonRef.current?.contains(event.target as Node)) {
      document.removeEventListener("mousemove", handleMouseMove);

      const targetValue = selections.value;
      const lastIndex = previousPanels.current.lastIndexOf(targetValue);

      if (lastIndex !== -1) {
        previousPanels.current = previousPanels.current.filter(
          (_, index) => index !== lastIndex
        );
      }
      setExpanded(false);
    }
  };

  const handleWheel = () => {
    document.removeEventListener("mousemove", handleMouseMove);

    const targetValue = selections.value;
    const lastIndex = previousPanels.current.lastIndexOf(targetValue);

    if (lastIndex !== -1) {
      previousPanels.current = previousPanels.current.filter(
        (_, index) => index !== lastIndex
      );
    }
    setExpanded(false);
  };

  useEffect(() => {
    if (isParentScrolling && parentPanelRef.current) {
      parentPanelRef.current.addEventListener("wheel", handleWheel);
    }

    return () => {
      if (isParentScrolling && parentPanelRef && parentPanelRef.current) {
        parentPanelRef.current.removeEventListener("wheel", handleWheel);
      }
    };
  }, [isParentScrolling, parentPanelRef.current]);

  return (
    <div
      ref={buttonRef}
      className='cursor-default relative px-2 w-full h-8 hover:bg-fg-white-80 rounded'
      onMouseEnter={() => {
        document.addEventListener("mousemove", handleMouseMove);

        previousPanels.current.push(selections.value);
        setExpanded(true);
      }}
    >
      {content}
      {expanded && (
        <SelectionPanel
          panelRefs={panelRefs}
          previousPanels={previousPanels}
          position='right'
          selections={selections}
          isParentScrolling={isParentScrolling}
          externalRef={buttonRef}
          externalPanelRef={panelRef}
          onRendered={() => {
            setRerender((prev) => !prev);
          }}
        />
      )}
    </div>
  );
}
