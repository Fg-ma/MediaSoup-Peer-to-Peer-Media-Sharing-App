import React, { useEffect, useRef } from "react";
import FgScrollbarController from "./lib/FgScrollbarController";
import "./lib/fgScrollbar.css";

export default function FgScrollbar({
  direction,
  containerRef,
  scrollTimeout,
  remoteVideosContainerRef,
  dragging,
}: {
  direction: "vertical" | "horizontal";
  containerRef: React.RefObject<HTMLDivElement>;
  scrollTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>;
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>;
  dragging: React.MutableRefObject<boolean>;
}) {
  const scrollbarTrackRef = useRef<HTMLDivElement>(null);
  const scrollbarThumbRef = useRef<HTMLDivElement>(null);
  const scrollStart = useRef({ x: 0, y: 0 });
  const startScrollPosition = useRef({ top: 0, left: 0 });

  const fgScrollbarController = new FgScrollbarController(
    containerRef,
    direction,
    scrollTimeout,
    remoteVideosContainerRef,
    scrollbarTrackRef,
    scrollbarThumbRef,
    dragging,
    scrollStart,
    startScrollPosition
  );

  useEffect(() => {
    if (direction === "vertical") {
      if (scrollbarThumbRef.current) {
        scrollbarThumbRef.current.style.width = "100%";
        scrollbarThumbRef.current.style.left = "0%";
      }
      fgScrollbarController.updateVerticalScrollbar();
    } else {
      if (scrollbarThumbRef.current) {
        scrollbarThumbRef.current.style.height = "100%";
        scrollbarThumbRef.current.style.top = "0%";
      }
      fgScrollbarController.updateHorizontalScrollbar();
    }
  }, [direction]);

  useEffect(() => {
    remoteVideosContainerRef.current?.addEventListener(
      "scroll",
      fgScrollbarController.scrollFunction
    );
    if (direction === "horizontal") {
      remoteVideosContainerRef.current?.addEventListener(
        "wheel",
        fgScrollbarController.horizontalScrollWheel
      );
    }

    return () => {
      remoteVideosContainerRef.current?.removeEventListener(
        "scroll",
        fgScrollbarController.scrollFunction
      );
      if (direction === "horizontal") {
        remoteVideosContainerRef.current?.removeEventListener(
          "wheel",
          fgScrollbarController.horizontalScrollWheel
        );
      }
    };
  }, []);

  return (
    <div
      className={`fg-scrollbar ${
        direction === "vertical"
          ? "fg-vertical-scrollbar"
          : "fg-horizontal-scrollbar"
      }`}
    >
      <div
        ref={scrollbarTrackRef}
        className={`fg-scrollbar-track ${
          direction === "vertical"
            ? "fg-vertical-scrollbar-track"
            : "fg-horizontal-scrollbar-track"
        }`}
        onMouseDown={fgScrollbarController.trackMouseDown}
      >
        <div
          ref={scrollbarThumbRef}
          className={`fg-scrollbar-thumb ${
            direction === "vertical"
              ? "fg-vertical-scrollbar-thumb"
              : "fg-horizontal-scrollbar-thumb"
          }`}
          onMouseDown={fgScrollbarController.thumbDragStart}
        ></div>
      </div>
    </div>
  );
}
