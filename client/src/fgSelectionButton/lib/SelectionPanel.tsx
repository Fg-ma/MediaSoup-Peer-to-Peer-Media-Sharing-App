import React from "react";
import { RecursiveSelections } from "../FgSelectionButton";
import SelectionPanelButton from "./SelectionPanelButton";
import ExpandingSelectionPanelButton from "./ExpandingSelectionPanelButton";

export default function SelectionPanel({
  selections,
}: {
  selections: RecursiveSelections;
}) {
  let panelElements: React.ReactElement[] = [];

  for (const selection in selections) {
    const selectionValue = selections[selection];

    if (typeof selectionValue !== "object") {
      panelElements.push(
        <SelectionPanelButton
          key={selection}
          content={selection}
          selectionValue={selectionValue}
        />
      );
    } else {
      panelElements.push(
        <ExpandingSelectionPanelButton
          key={selection}
          content={selection}
          selections={selectionValue}
        />
      );
    }
  }

  return <div>{panelElements}</div>;
}
