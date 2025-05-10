import React, { useEffect, useRef, useState } from "react";
import { useSocketContext } from "../context/socketContext/SocketContext";
import { useSignalContext } from "../context/signalContext/SignalContext";
import TableController from "./lib/TableController";
import FgScrollbarElement from "../elements/fgScrollbarElement/FgScrollbarElement";
import TableGridOverlay from "./lib/TableGridOverlay";
import UploadTableLayer from "../tableLayers/uploadTableLayer/UploadTableLayer";
import NewInstancesLayer from "../tableLayers/newInstancesLayer/NewInstancesLayer";
import SelectTableLayer from "../tableLayers/selectTableLayer/SelectTableLayer";
import SharedBundle from "../sharedBundle/SharedBundle";
import Deadbanding from "../babylon/Deadbanding";
import LeftTableSection from "./lib/sideSections/LeftTableSection";
import RightTableSection from "./lib/sideSections/RightTableSection";
import TopTableSection from "./lib/sideSections/TopTableSection";
import BottomTableSection from "./lib/sideSections/BottomTableSection";
import { TableColors } from "../serverControllers/tableServer/lib/typeConstant";
import TableInfoPopup from "./lib/tableInfoPopup/TableInfoPopup";
import LoadingTab from "./lib/loadingTab/LoadingTab";
import TableSidePanel, { TablePanels } from "../tableSidePanel/TableSidePanel";
import "./lib/fgTable.css";

export default function Table({
  tableFunctionsRef,
  tableRef,
  tableTopRef,
  bundles,
  gridActive,
  gridSize,
  deadbanding,
}: {
  tableFunctionsRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
  tableTopRef: React.RefObject<HTMLDivElement>;
  bundles: {
    [username: string]: {
      [instance: string]: React.JSX.Element;
    };
  };
  gridActive: boolean;
  gridSize: {
    rows: number;
    cols: number;
  };
  deadbanding: React.MutableRefObject<Deadbanding>;
}) {
  const { tableSocket } = useSocketContext();
  const { sendGroupSignal } = useSignalContext();

  const [userData, setUserData] = useState<{
    [username: string]: { color: TableColors; seat: number; online: boolean };
  }>({});
  const [tableSidePanelActive, setTableSidePanelActive] = useState(false);
  const [tableSidePanelWidth, setTableSidePanelWidth] = useState(256);
  const [_, setRerender] = useState(false);
  const activePanel = useRef<TablePanels>("general");
  const aspectDir = useRef<"width" | "height">("width");
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const innerTableContainerRef = useRef<HTMLDivElement>(null);

  const tableController = useRef(
    new TableController(
      tableRef,
      setUserData,
      aspectDir,
      setRerender,
      setTableSidePanelActive,
      sendGroupSignal,
    ),
  );

  useEffect(() => {
    tableController.current.getAspectDir();

    setTimeout(() => {
      if (tableRef.current) {
        if (aspectDir.current === "width") {
          tableRef.current.scrollTo({
            top:
              (tableRef.current.scrollHeight - tableRef.current.clientHeight) /
              2,
            behavior: "instant",
          });
        } else {
          tableRef.current.scrollTo({
            left:
              (tableRef.current.scrollWidth - tableRef.current.clientWidth) / 2,
            behavior: "instant",
          });
        }
      }
    }, 100);

    window.addEventListener("resize", tableController.current.getAspectDir);

    window.addEventListener("keydown", tableController.current.handleKeyDown);

    return () => {
      window.removeEventListener(
        "resize",
        tableController.current.getAspectDir,
      );
      window.removeEventListener(
        "keydown",
        tableController.current.handleKeyDown,
      );
    };
  }, []);

  useEffect(() => {
    tableSocket.current?.addMessageListener(
      tableController.current.handleTableMessage,
    );

    return () => {
      tableSocket.current?.removeMessageListener(
        tableController.current.handleTableMessage,
      );
    };
  }, [tableSocket.current]);

  return (
    <div
      className="flex w-full items-center justify-center"
      style={{
        height: `calc(100% - ${tableFunctionsRef.current?.clientHeight ?? 0}px - 6.125rem)`,
      }}
    >
      <TableSidePanel
        activePanel={activePanel}
        tableSidePanelActive={tableSidePanelActive}
        setTableSidePanelActive={setTableSidePanelActive}
        tableController={tableController}
        setExternalRerender={setRerender}
        tableSidePanelWidth={tableSidePanelWidth}
        setTableSidePanelWidth={setTableSidePanelWidth}
      />
      <div
        ref={tableContainerRef}
        className="table-container flex h-full flex-col"
        style={
          {
            "--dynamic-width": `calc(100%${tableSidePanelActive ? ` - ${Math.max(200, tableSidePanelWidth)}px - 1.75rem` : ""})`,
            minWidth: "30%",
          } as React.CSSProperties
        }
      >
        <TopTableSection
          userData={userData}
          tableContainerRef={tableContainerRef}
        />
        <div
          ref={innerTableContainerRef}
          className="flex w-full"
          style={{ height: "1px", flexGrow: "1" }}
        >
          <LeftTableSection
            userData={userData}
            tableContainerRef={tableContainerRef}
          />
          <FgScrollbarElement
            direction={
              aspectDir.current === "width" ? "vertical" : "horizontal"
            }
            scrollingContentRef={tableRef}
            content={
              <>
                <TableInfoPopup />
                <LoadingTab
                  activePanel={activePanel}
                  setTableSidePanelActive={setTableSidePanelActive}
                  setExternalRerender={setRerender}
                />
                <div
                  ref={tableRef}
                  className={`fg-table relative h-full w-full rounded-md border-2 border-fg-off-white ${
                    aspectDir.current === "width"
                      ? "overflow-y-auto"
                      : "overflow-x-auto"
                  }`}
                >
                  <div
                    ref={tableTopRef}
                    className="relative aspect-square overflow-hidden bg-fg-tone-black-6"
                    style={{
                      ...(aspectDir.current === "width"
                        ? { width: "100%" }
                        : { height: "100%" }),
                    }}
                  >
                    <SelectTableLayer
                      innerTableContainerRef={innerTableContainerRef}
                      tableRef={tableRef}
                      tableTopRef={tableTopRef}
                    />
                    <UploadTableLayer tableTopRef={tableTopRef} />
                    <NewInstancesLayer tableRef={tableRef} />
                    {gridActive && (
                      <TableGridOverlay
                        gridSize={gridSize}
                        tableTopRef={tableTopRef}
                        gridColor="#f2f2f2"
                      />
                    )}
                    <SharedBundle
                      deadbanding={deadbanding}
                      tableRef={tableRef}
                    />
                    {bundles &&
                      Object.keys(bundles).length !== 0 &&
                      Object.keys(bundles).map(
                        (username) =>
                          Object.keys(bundles[username]).length !== 0 &&
                          Object.entries(bundles[username]).map(
                            ([key, bundle]) => (
                              <div
                                className="pointer-events-none absolute left-0 top-0 h-full w-full"
                                key={key}
                                id={`${key}_bundle`}
                              >
                                {bundle}
                              </div>
                            ),
                          ),
                      )}
                  </div>
                </div>
              </>
            }
            style={{
              width: "100%",
              flexGrow: "1",
            }}
          />
          <RightTableSection
            userData={userData}
            tableContainerRef={tableContainerRef}
          />
        </div>
        <BottomTableSection
          userData={userData}
          tableContainerRef={tableContainerRef}
        />
      </div>
    </div>
  );
}
