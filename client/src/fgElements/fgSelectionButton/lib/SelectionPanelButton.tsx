import React from "react";

export default function SelectionPanelButton({
  previousPanels,
  content,
  selectionValue,
}: {
  previousPanels: React.MutableRefObject<string[]>;
  content: string;
  selectionValue: string;
}) {
  return (
    <div
      className='cursor-default px-2 w-full hover:bg-fg-white-80 rounded'
      data-selection-value={previousPanels.current
        .concat(selectionValue)
        .join("-fg-")}
    >
      {content}
    </div>
  );
}
