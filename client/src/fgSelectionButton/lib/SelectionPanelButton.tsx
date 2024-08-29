import React from "react";

export default function SelectionPanelButton({
  content,
  selectionValue,
}: {
  content: string;
  selectionValue: any;
}) {
  return <div data-selection-value={selectionValue}>{content}</div>;
}
