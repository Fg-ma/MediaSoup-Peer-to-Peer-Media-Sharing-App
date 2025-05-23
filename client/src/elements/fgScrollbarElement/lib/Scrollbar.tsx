import React, { useEffect, useRef, useState } from "react";
import FgScrollbarElementController from "./FgScrollbarElementController";

export default function Scrollbar({
  contentContainerRef,
  direction = "vertical",
  scrollingContentRef,
  scrollbarSize = 10,
  gutterSize = 11,
  scrollbarElementRef,
}: {
  contentContainerRef: React.RefObject<HTMLDivElement>;
  direction?: "vertical" | "horizontal";
  scrollingContentRef: React.RefObject<HTMLDivElement>;
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
  const directionRef = useRef(direction);
  const scrollbarVisible = useRef(true);
  const [_, setRerender] = useState(false);

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
      scrollingContentRef.current?.addEventListener(
        "wheel",
        fgScrollbarElementController.verticalScrollWheel,
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
        scrollingContentRef.current?.removeEventListener(
          "wheel",
          fgScrollbarElementController.verticalScrollWheel,
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
    if (!scrollbarVisible.current) {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = undefined;
      }
      dragging.current = false;
    }
    setTimeout(() => {
      fgScrollbarElementController.updateScrollbar();
    }, 0);
  }, [scrollbarVisible.current]);

  useEffect(() => {
    // create a resize observer to cause a rerender when the content changes size
    let resizeObserver: ResizeObserver | undefined;
    if (contentContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        scrollbarVisible.current = contentContainerRef.current
          ? contentContainerRef.current.scrollHeight >
            contentContainerRef.current.clientHeight
          : true;
        setRerender((prev) => !prev);
      });
      resizeObserver.observe(contentContainerRef.current);
    }

    scrollbarElementRef.current?.addEventListener(
      "pointermove",
      fgScrollbarElementController.hideTableScrollBar,
    );
    scrollbarElementRef.current?.addEventListener(
      "pointerleave",
      fgScrollbarElementController.pointerLeaveFunction,
    );

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
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
    scrollbarVisible.current && (
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
