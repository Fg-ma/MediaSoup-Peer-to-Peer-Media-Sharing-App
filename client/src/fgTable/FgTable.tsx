import React, { useEffect, useRef, useState } from "react";
import FgTableController from "./lib/FgTableController";
import "./lib/fgTable.css";

export default function FgTable({
  remoteVideosContainerRef,
  bundles,
}: {
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>;
  bundles: {
    [username: string]: {
      [instance: string]: React.JSX.Element;
    };
  };
}) {
  const [_rerender, setRerender] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);
  const scrollbarTrackRef = useRef<HTMLDivElement>(null);
  const scrollbarThumbRef = useRef<HTMLDivElement>(null);
  const aspectDir = useRef<"width" | "height">("width");
  const scrollStart = useRef({ x: 0, y: 0 });
  const startScrollPosition = useRef({ top: 0, left: 0 });
  const scrollTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const dragging = useRef(false);

  const fgTableController = new FgTableController(
    setRerender,
    tableRef,
    aspectDir,
    scrollTimeout,
    remoteVideosContainerRef,
    scrollbarTrackRef,
    scrollbarThumbRef,
    dragging,
    scrollStart,
    startScrollPosition
  );

  useEffect(() => {
    fgTableController.getAspectDir();

    setTimeout(() => {
      if (remoteVideosContainerRef.current) {
        if (aspectDir.current === "width") {
          remoteVideosContainerRef.current.scrollTo({
            top:
              (remoteVideosContainerRef.current.scrollHeight -
                remoteVideosContainerRef.current.clientHeight) /
              2,
            behavior: "instant",
          });
        } else {
          remoteVideosContainerRef.current.scrollTo({
            left:
              (remoteVideosContainerRef.current.scrollWidth -
                remoteVideosContainerRef.current.clientWidth) /
              2,
            behavior: "instant",
          });
        }
      }
    }, 100);

    window.addEventListener("resize", fgTableController.getAspectDir);

    remoteVideosContainerRef.current?.addEventListener(
      "mousemove",
      fgTableController.hideTableScrollBar
    );

    return () => {
      window.removeEventListener("resize", fgTableController.getAspectDir);
      remoteVideosContainerRef.current?.removeEventListener(
        "mousemove",
        fgTableController.hideTableScrollBar
      );
    };
  }, []);

  return (
    <div
      ref={tableRef}
      className='hide-fg-scrollbar relative'
      style={{ width: "100%", height: "calc(100% - 8rem)" }}
      onMouseLeave={fgTableController.mouseLeaveFunction}
    >
      <div
        className={`fg-scrollbar ${
          aspectDir.current === "width"
            ? "fg-vertical-scrollbar"
            : "fg-horizontal-scrollbar"
        }`}
      >
        <div
          ref={scrollbarTrackRef}
          className={`fg-scrollbar-track ${
            aspectDir.current === "width"
              ? "fg-vertical-scrollbar-track"
              : "fg-horizontal-scrollbar-track"
          }`}
        >
          <div
            ref={scrollbarThumbRef}
            className={`fg-scrollbar-thumb ${
              aspectDir.current === "width"
                ? "fg-vertical-scrollbar-thumb"
                : "fg-horizontal-scrollbar-thumb"
            }`}
            onMouseDown={fgTableController.thumbDragStart}
          ></div>
        </div>
      </div>
      <div
        ref={remoteVideosContainerRef}
        className={`fg-table relative rounded-md w-full h-full ${
          aspectDir.current === "width" ? "overflow-y-auto" : "overflow-x-auto"
        }`}
        onScroll={fgTableController.scrollFunction}
        onWheel={fgTableController.horizontalScrollWheel}
      >
        <div
          className='bg-fg-white-65 aspect-square'
          style={{
            ...(aspectDir.current === "width"
              ? { width: "100%" }
              : { height: "100%" }),
          }}
        >
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
    </div>
  );
}
