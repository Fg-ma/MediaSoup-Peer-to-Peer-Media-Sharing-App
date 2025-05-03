import React, { useEffect, useRef, useState } from "react";
import LoadingPanel from "./panels/LoadingPanel";
import TableController from "../table/lib/TableController";
import "./lib/tableSidePanel.css";

export type TablePanels = "loading" | "settings";

export default function TableSidePanel({
  activePanel,
  tableController,
}: {
  activePanel: TablePanels | undefined;
  tableController: React.MutableRefObject<TableController>;
}) {
  const [width, setWidth] = useState(256);
  const [dragging, setDragging] = useState(false);
  const tablePanelRef = useRef<HTMLDivElement>(null);

  const handleDividerPointerDown = () => {
    document.addEventListener("pointerup", handleDividerPointerUp);
    document.addEventListener("pointermove", handleDividerPointerMove);

    setDragging(true);
  };

  const handleDividerPointerMove = (event: PointerEvent) => {
    const box = tablePanelRef.current?.getBoundingClientRect();
    setWidth(event.clientX - (box?.left ?? 0) - 16);
  };

  const handleDividerPointerUp = () => {
    document.removeEventListener("pointerup", handleDividerPointerUp);
    document.removeEventListener("pointermove", handleDividerPointerMove);

    setDragging(false);
  };

  useEffect(() => {
    tableController.current.getAspectDir();
  }, [width]);

  return (
    <>
      {activePanel && (
        <>
          <div
            ref={tablePanelRef}
            className="table-side-panel h-full min-w-12 rounded-md border-2 border-fg-off-white bg-fg-tone-black-6"
            style={{ "--dynamic-width": `${width}px` } as React.CSSProperties}
          >
            {activePanel === "loading" && <LoadingPanel />}
          </div>
          <div
            className={`${dragging ? "cursor-pointer" : ""} flex h-full w-7 items-center justify-center`}
          >
            <div
              className={`${dragging ? "h-[97.5%] w-2" : "h-[95%]"} w-1 cursor-pointer rounded-full bg-fg-off-white transition-all hover:h-[97.5%] hover:w-2`}
              onPointerDown={handleDividerPointerDown}
            ></div>
          </div>
        </>
      )}
    </>
  );
}
