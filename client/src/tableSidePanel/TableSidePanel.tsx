import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSignalContext } from "../context/signalContext/SignalContext";
import LoadingPanel from "./panels/loadingPanel/LoadingPanel";
import TableController from "../table/lib/TableController";
import TableSidePanelHeader from "./lib/TableSidePanelHeader";
import FgScrollbarElement from "../elements/fgScrollbarElement/FgScrollbarElement";
import GeneralPanel from "./panels/generalPanel/GeneralPanel";
import "./lib/tableSidePanel.css";

export type TablePanels = "loading" | "general" | "settings";

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
  const { sendGroupSignal } = useSignalContext();

  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const [_, setRerender] = useState(false);
  const tablePanelRef = useRef<HTMLDivElement>(null);
  const tableSidePanelHeaderRef = useRef<HTMLDivElement>(null);

  const handleDividerPointerDown = (event: React.PointerEvent) => {
    event.preventDefault();

    document.addEventListener("pointerup", handleDividerPointerUp);
    document.addEventListener("pointermove", handleDividerPointerMove);

    sendGroupSignal({ type: "clearGroup" });

    setDragging(true);
  };

  const handleDividerPointerMove = (event: PointerEvent) => {
    const box = tablePanelRef.current?.getBoundingClientRect();
    setTableSidePanelWidth(event.clientX - (box?.left ?? 0) - 16);
  };

  const handleDividerPointerUp = () => {
    document.removeEventListener("pointerup", handleDividerPointerUp);
    document.removeEventListener("pointermove", handleDividerPointerMove);

    setDragging(false);
  };

  useEffect(() => {
    tableController.current.getAspectDir();
  }, [tableSidePanelWidth]);

  useEffect(() => {
    setRerender((prev) => !prev);
  }, [activePanel.current]);

  return (
    <>
      {tableSidePanelActive && (
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
                  {activePanel.current === "loading" && (
                    <LoadingPanel
                      tablePanelRef={tablePanelRef}
                      setExternalRerender={setRerender}
                    />
                  )}
                </div>
              }
              scrollingContentRef={tablePanelRef}
            />
          </div>
          <div
            className={`${dragging ? "cursor-pointer" : ""} flex h-full !w-7 items-center justify-center`}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
          >
            <AnimatePresence>
              {(hover || dragging) && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0.8 }}
                  animate={{
                    opacity: 1,
                    height: dragging ? "97.5%" : "95%",
                    width: dragging ? "0.5rem" : "0.25rem",
                  }}
                  whileHover={{
                    height: "97.5%",
                    width: "0.5rem",
                  }}
                  exit={{ opacity: 0, scaleX: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="cursor-pointer rounded-full bg-fg-off-white"
                  onPointerDown={handleDividerPointerDown}
                />
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </>
  );
}
