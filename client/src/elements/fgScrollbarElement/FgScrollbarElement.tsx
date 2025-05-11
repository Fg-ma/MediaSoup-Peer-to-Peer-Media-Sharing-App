import React, { CSSProperties, useEffect, useRef, useState } from "react";
import FgScrollbarElementController from "./lib/FgScrollbarElementController";
import "./lib/fgScrollbar.css";

export default function FgScrollbarElement({
  externalRef,
  direction = "vertical",
  scrollingContentRef,
  scrollbarVisible = true,
  content,
  className,
  scrollbarSize = 10,
  gutterSize = 11,
  style,
}: {
  externalRef?: React.RefObject<HTMLDivElement>;
  direction?: "vertical" | "horizontal";
  scrollingContentRef: React.RefObject<HTMLDivElement>;
  scrollbarVisible?: boolean;
  content?: React.ReactNode;
  className?: string;
  scrollbarSize?: number;
  gutterSize?: number;
  style?: CSSProperties;
}) {
  const scrollbarElementRef = externalRef
    ? externalRef
    : useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const scrollbarTrackRef = useRef<HTMLDivElement>(null);
  const scrollbarThumbRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const dragging = useRef(false);
  const scrollStart = useRef({ x: 0, y: 0 });
  const startScrollPosition = useRef({ top: 0, left: 0 });
  const [_, setRerender] = useState(false);

  const fgScrollbarElementController = new FgScrollbarElementController(
    scrollingContentRef,
    scrollbarElementRef,
    scrollbarRef,
    scrollbarTrackRef,
    scrollbarThumbRef,
    scrollTimeout,
    direction,
    dragging,
    scrollStart,
    startScrollPosition,
    setRerender,
  );

  useEffect(() => {
    fgScrollbarElementController.updateScrollbar();

    if (direction === "vertical") {
      scrollingContentRef.current?.addEventListener(
        "scroll",
        fgScrollbarElementController.scrollFunction,
      );
    }
    if (direction === "horizontal") {
      scrollingContentRef.current?.addEventListener(
        "wheel",
        fgScrollbarElementController.horizontalScrollWheel,
      );
    }

    return () => {
      if (direction === "vertical") {
        scrollingContentRef.current?.removeEventListener(
          "scroll",
          fgScrollbarElementController.scrollFunction,
        );
      }
      if (direction === "horizontal") {
        scrollingContentRef.current?.removeEventListener(
          "wheel",
          fgScrollbarElementController.horizontalScrollWheel,
        );
      }
    };
  }, [direction]);

  useEffect(() => {
    if (!scrollbarVisible) {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = undefined;
      }
      dragging.current = false;
    }
    fgScrollbarElementController.updateScrollbar();
  }, [scrollbarVisible]);

  return (
    <div
      ref={scrollbarElementRef}
      className={`${className} relative`}
      style={style}
      onPointerMove={fgScrollbarElementController.hideTableScrollBar}
      onPointerLeave={fgScrollbarElementController.pointerLeaveFunction}
    >
      {scrollbarVisible && (
        <div
          ref={scrollbarRef}
          className={`fg-scrollbar z-scrollbar ${
            direction === "vertical"
              ? "fg-vertical-scrollbar"
              : "fg-horizontal-scrollbar"
          }`}
          style={{
            ["--scrollbar-size" as any]: `${scrollbarSize}px`,
            ["--gutter-size" as any]: `${gutterSize}px`,
          }}
        >
          <div
            ref={scrollbarTrackRef}
            className={`fg-scrollbar-track ${
              direction === "vertical"
                ? "fg-vertical-scrollbar-track"
                : "fg-horizontal-scrollbar-track"
            }`}
            onPointerDown={fgScrollbarElementController.trackPointerDown}
          >
            <div
              ref={scrollbarThumbRef}
              className={`fg-scrollbar-thumb ${
                direction === "vertical"
                  ? "fg-vertical-scrollbar-thumb"
                  : "fg-horizontal-scrollbar-thumb"
              }`}
              onPointerDown={fgScrollbarElementController.thumbDragStart}
            ></div>
          </div>
        </div>
      )}
      {content}
    </div>
  );
}
