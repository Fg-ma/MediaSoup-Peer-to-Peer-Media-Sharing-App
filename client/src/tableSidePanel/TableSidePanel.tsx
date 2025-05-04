import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoadingPanel from "./panels/loadingPanel/LoadingPanel";
import TableController from "../table/lib/TableController";
import TableSidePanelHeader from "./lib/TableSidePanelHeader";
import FgScrollbarElement from "../elements/fgScrollbarElement/FgScrollbarElement";
import "./lib/tableSidePanel.css";
import GeneralPanel from "./panels/generalPanel/GeneralPanel";

export type TablePanels = "loading" | "general" | "settings";

export default function TableSidePanel({
  activePanel,
  setActivePanel,
  tableController,
}: {
  activePanel: TablePanels | undefined;
  setActivePanel: React.Dispatch<React.SetStateAction<TablePanels | undefined>>;
  tableController: React.MutableRefObject<TableController>;
}) {
  const [width, setWidth] = useState(256);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const [_, setRerender] = useState(false);
  const tablePanelRef = useRef<HTMLDivElement>(null);
  const tableSidePanelRef = useRef<HTMLDivElement>(null);

  const handleDividerPointerDown = (event: React.PointerEvent) => {
    event.preventDefault();

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
            className="table-side-panel flex h-full flex-col overflow-hidden rounded-md border-2 border-fg-off-white bg-fg-tone-black-6"
            style={
              {
                "--dynamic-width": `${Math.max(200, width)}px`,
              } as React.CSSProperties
            }
          >
            <TableSidePanelHeader
              tableSidePanelRef={tableSidePanelRef}
              activePanel={activePanel}
              setActivePanel={setActivePanel}
            />
            <FgScrollbarElement
              direction="vertical"
              style={{
                height: `calc(100% - ${tableSidePanelRef.current?.clientHeight ?? 0}px)`,
              }}
              content={
                <div
                  ref={tablePanelRef}
                  className="hide-scroll-bar h-full w-full overflow-y-auto"
                >
                  {activePanel === "general" && <GeneralPanel />}
                  {activePanel === "loading" && (
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
            className={`${dragging ? "cursor-pointer" : ""} flex h-full w-7 items-center justify-center`}
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
