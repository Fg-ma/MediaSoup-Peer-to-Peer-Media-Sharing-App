import React, { useEffect, useRef, useState } from "react";
import FgScrollbarElementController from "./FgScrollbarElementController";

export default function Scrollbar({
  direction = "vertical",
  scrollingContentRef,
  scrollbarVisible = true,
  scrollbarSize = 10,
  gutterSize = 11,
  scrollbarElementRef,
}: {
  direction?: "vertical" | "horizontal";
  scrollingContentRef: React.RefObject<HTMLDivElement>;
  scrollbarVisible?: boolean;
  scrollbarSize?: number;
  gutterSize?: number;
  scrollbarElementRef: React.RefObject<HTMLDivElement>;
}) {
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const scrollbarTrackRef = useRef<HTMLDivElement>(null);
  const scrollbarThumbRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const dragging = useRef(false);
  const scrollStart = useRef({ x: 0, y: 0 });
  const startScrollPosition = useRef({ top: 0, left: 0 });
  const [_, setRerender] = useState(false);
  const directionRef = useRef(direction);

  const fgScrollbarElementController = new FgScrollbarElementController(
    scrollingContentRef,
    scrollbarElementRef,
    scrollbarRef,
    scrollbarTrackRef,
    scrollbarThumbRef,
    scrollTimeout,
    directionRef,
    dragging,
    scrollStart,
    startScrollPosition,
    setRerender,
  );

  useEffect(() => {
    directionRef.current = direction;

    fgScrollbarElementController.updateScrollbar();

    if (directionRef.current === "vertical") {
      scrollingContentRef.current?.addEventListener(
        "scroll",
        fgScrollbarElementController.scrollFunction,
      );
    }
    if (directionRef.current === "horizontal") {
      scrollingContentRef.current?.addEventListener(
        "wheel",
        fgScrollbarElementController.horizontalScrollWheel,
      );
    }

    return () => {
      if (directionRef.current === "vertical") {
        scrollingContentRef.current?.removeEventListener(
          "scroll",
          fgScrollbarElementController.scrollFunction,
        );
      }
      if (directionRef.current === "horizontal") {
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

  useEffect(() => {
    scrollbarElementRef.current?.addEventListener(
      "pointermove",
      fgScrollbarElementController.hideTableScrollBar,
    );
    scrollbarElementRef.current?.addEventListener(
      "pointerleave",
      fgScrollbarElementController.pointerLeaveFunction,
    );

    return () => {
      scrollbarElementRef.current?.removeEventListener(
        "pointermove",
        fgScrollbarElementController.hideTableScrollBar,
      );
      scrollbarElementRef.current?.removeEventListener(
        "pointerleave",
        fgScrollbarElementController.pointerLeaveFunction,
      );
    };
  }, []);

  return (
    scrollbarVisible && (
      <div
        ref={scrollbarRef}
        className={`fg-scrollbar z-scrollbar ${
          directionRef.current === "vertical"
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
            directionRef.current === "vertical"
              ? "fg-vertical-scrollbar-track"
              : "fg-horizontal-scrollbar-track"
          }`}
          onPointerDown={fgScrollbarElementController.trackPointerDown}
        >
          <div
            ref={scrollbarThumbRef}
            className={`fg-scrollbar-thumb ${
              directionRef.current === "vertical"
                ? "fg-vertical-scrollbar-thumb"
                : "fg-horizontal-scrollbar-thumb"
            }`}
            onPointerDown={fgScrollbarElementController.thumbDragStart}
          ></div>
        </div>
      </div>
    )
  );
}
