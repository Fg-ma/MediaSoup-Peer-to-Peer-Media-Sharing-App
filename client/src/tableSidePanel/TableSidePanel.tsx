import React, { useEffect, useRef, useState } from "react";
import UploadingPanel from "./panels/uploadingPanel/UploadingPanel";
import TableController from "../table/lib/TableController";
import TableSidePanelHeader from "./lib/TableSidePanelHeader";
import FgScrollbarElement from "../elements/fgScrollbarElement/FgScrollbarElement";
import GeneralPanel from "./panels/generalPanel/GeneralPanel";
import SidePanelDragger from "./lib/SidePanelDragger";
import "./lib/tableSidePanel.css";
import DownloadingPanel from "./panels/downloadingPanel/DownloadingPanel";

export type TablePanels = "upload" | "download" | "general" | "settings";

export default function TableSidePanel({
  activePanel,
  tableSidePanelActive,
  setTableSidePanelActive,
  tableController,
  setExternalRerender,
  tableSidePanelWidth,
  setTableSidePanelWidth,
}: {
  activePanel: React.MutableRefObject<TablePanels>;
  tableSidePanelActive: boolean;
  setTableSidePanelActive: React.Dispatch<React.SetStateAction<boolean>>;
  tableController: React.MutableRefObject<TableController>;
  setExternalRerender: React.Dispatch<React.SetStateAction<boolean>>;
  tableSidePanelWidth: number;
  setTableSidePanelWidth: React.Dispatch<React.SetStateAction<number>>;
}) {
  const tablePanelRef = useRef<HTMLDivElement>(null);
  const tableSidePanelHeaderRef = useRef<HTMLDivElement>(null);

  const [_, setRerender] = useState(false);

  useEffect(() => {
    tableController.current.getAspectDir();
  }, [tableSidePanelWidth]);

  useEffect(() => {
    setRerender((prev) => !prev);
  }, [activePanel.current]);

  return (
    tableSidePanelActive && (
      <>
        <div
          className="table-side-panel flex h-full flex-col overflow-hidden rounded-md border-2 border-fg-off-white bg-fg-tone-black-6"
          style={
            {
              "--dynamic-width": `${Math.max(200, tableSidePanelWidth)}px`,
              maxWidth: "calc(70% - 1.75rem)",
            } as React.CSSProperties
          }
        >
          <TableSidePanelHeader
            tableSidePanelHeaderRef={tableSidePanelHeaderRef}
            activePanel={activePanel}
            setTableSidePanelActive={setTableSidePanelActive}
            setExternalRerender={setExternalRerender}
          />
          <FgScrollbarElement
            direction="vertical"
            scrollbarSize={8}
            gutterSize={8}
            style={{
              height: `calc(100% - ${tableSidePanelHeaderRef.current?.clientHeight ?? 0}px)`,
            }}
            scrollbarVisible={
              tablePanelRef.current
                ? tablePanelRef.current.scrollHeight >
                  tablePanelRef.current.clientHeight
                : true
            }
            content={
              <div
                ref={tablePanelRef}
                className="hide-scroll-bar h-full w-full overflow-y-auto"
              >
                {activePanel.current === "general" && (
                  <GeneralPanel tablePanelRef={tablePanelRef} />
                )}
                {activePanel.current === "upload" && (
                  <UploadingPanel
                    tablePanelRef={tablePanelRef}
                    setExternalRerender={setRerender}
                  />
                )}
                {activePanel.current === "download" && (
                  <DownloadingPanel
                    tablePanelRef={tablePanelRef}
                    setExternalRerender={setRerender}
                  />
                )}
              </div>
            }
            scrollingContentRef={tablePanelRef}
          />
        </div>
        <SidePanelDragger
          setTableSidePanelWidth={setTableSidePanelWidth}
          tablePanelRef={tablePanelRef}
        />
      </>
    )
  );
}
