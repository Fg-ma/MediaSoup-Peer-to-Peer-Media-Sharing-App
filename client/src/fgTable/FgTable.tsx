import React, { useEffect, useRef, useState } from "react";
import FgTableController from "./lib/FgTableController";
import FgScrollbarElement from "../fgElements/fgScrollbarElement/FgScrollbarElement";
import TableGridOverlay from "./lib/TableGridOverlay";
import "./lib/fgTable.css";

export default function FgTable({
  tableRef,
  tableTopRef,
  bundles,
  gridActive,
  gridSize,
}: {
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
}) {
  const [_rerender, setRerender] = useState(false);
  const aspectDir = useRef<"width" | "height">("width");

  const fgTableController = new FgTableController(
    setRerender,
    tableRef,
    aspectDir
  );

  useEffect(() => {
    fgTableController.getAspectDir();

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

    window.addEventListener("resize", fgTableController.getAspectDir);

    return () => {
      window.removeEventListener("resize", fgTableController.getAspectDir);
    };
  }, []);

  return (
    <FgScrollbarElement
      direction={aspectDir.current === "width" ? "vertical" : "horizontal"}
      scrollingContentRef={tableRef}
      content={
        <div
          ref={tableRef}
          className={`fg-table relative rounded-md w-full h-full ${
            aspectDir.current === "width"
              ? "overflow-y-auto"
              : "overflow-x-auto"
          }`}
        >
          <div
            ref={tableTopRef}
            className='relative bg-fg-white-65 aspect-square overflow-hidden'
            style={{
              ...(aspectDir.current === "width"
                ? { width: "100%" }
                : { height: "100%" }),
            }}
          >
            {gridActive && (
              <TableGridOverlay
                gridSize={gridSize}
                tableTopRef={tableTopRef}
                gridColor='#fff'
              />
            )}
            <div className='w-full h-full relative'>
              {bundles &&
                Object.keys(bundles).length !== 0 &&
                Object.keys(bundles).map(
                  (username) =>
                    Object.keys(bundles[username]).length !== 0 &&
                    Object.entries(bundles[username]).map(([key, bundle]) => (
                      <div
                        className='w-full h-full absolute top-0 left-0'
                        key={key}
                        id={`${key}_bundle`}
                      >
                        {bundle}
                      </div>
                    ))
                )}
            </div>
          </div>
        </div>
      }
      style={{
        width: "100%",
        height: "calc(100% - 8rem)",
      }}
    />
  );
}
