import React from "react";

export type TablePanels = "loading" | "settings";

export default function TableSidePanel({
  activePanel,
}: {
  activePanel: TablePanels | undefined;
}) {
  return (
    <>
      {activePanel && (
        <>
          <div className="h-full w-64 rounded-md border-2 border-fg-off-white bg-fg-tone-black-6"></div>
          <div className="flex h-full w-7 items-center justify-center">
            <div className="h-[95%] w-1 cursor-pointer rounded-full bg-fg-off-white transition-all hover:h-[97.5%] hover:w-2"></div>
          </div>
        </>
      )}
    </>
  );
}
