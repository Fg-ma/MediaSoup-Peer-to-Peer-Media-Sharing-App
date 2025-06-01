import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ScrollbarController from "./ScrollbarController";

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
  const delayScrollBarTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const dragging = useRef(false);
  const scrollStart = useRef({ x: 0, y: 0 });
  const startScrollPosition = useRef({ top: 0, left: 0 });
  const directionRef = useRef(direction);
  const scrollbarVisible = useRef(
    direction === "vertical"
      ? contentContainerRef.current
        ? contentContainerRef.current.scrollHeight >
          contentContainerRef.current.clientHeight
        : false
      : contentContainerRef.current
        ? contentContainerRef.current.scrollWidth >
          contentContainerRef.current.clientWidth
        : false,
  );
  const [_, setRerender] = useState(false);

  const scrollbarController = useRef(
    new ScrollbarController(
      scrollingContentRef,
      scrollbarElementRef,
      scrollbarRef,
      scrollbarTrackRef,
      scrollbarThumbRef,
      scrollTimeout,
      delayScrollBarTimeout,
      directionRef,
      dragging,
      scrollStart,
      startScrollPosition,
      setRerender,
    ),
  );

  useEffect(() => {
    directionRef.current = direction;

    scrollbarController.current.updateScrollbar();

    if (directionRef.current === "vertical") {
      scrollingContentRef.current?.addEventListener(
        "scroll",
        scrollbarController.current.scrollFunction,
      );
      scrollingContentRef.current?.addEventListener(
        "wheel",
        scrollbarController.current.verticalScrollWheel,
      );
    }
    if (directionRef.current === "horizontal") {
      scrollingContentRef.current?.addEventListener(
        "wheel",
        scrollbarController.current.horizontalScrollWheel,
      );
    }

    return () => {
      if (directionRef.current === "vertical") {
        scrollingContentRef.current?.removeEventListener(
          "scroll",
          scrollbarController.current.scrollFunction,
        );
        scrollingContentRef.current?.removeEventListener(
          "wheel",
          scrollbarController.current.verticalScrollWheel,
        );
      }
      if (directionRef.current === "horizontal") {
        scrollingContentRef.current?.removeEventListener(
          "wheel",
          scrollbarController.current.horizontalScrollWheel,
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
      scrollbarController.current.updateScrollbar();
    }, 0);
  }, [scrollbarVisible.current]);

  useEffect(() => {
    setTimeout(() => {
      if (directionRef.current === "vertical") {
        scrollbarController.current.updateVerticalScrollbar();
      } else {
        scrollbarController.current.updateHorizontalScrollbar;
      }

      scrollbarElementRef.current?.classList.remove("hide-fg-scrollbar");

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = undefined;
      }

      if (delayScrollBarTimeout.current) {
        clearTimeout(delayScrollBarTimeout.current);
        delayScrollBarTimeout.current = undefined;
      }

      if (!dragging.current) {
        scrollTimeout.current = setTimeout(() => {
          scrollbarElementRef.current?.classList.add("hide-fg-scrollbar");

          clearTimeout(scrollTimeout.current);
          scrollTimeout.current = undefined;
        }, 500);
      }
    }, 100);

    scrollbarElementRef.current?.addEventListener(
      "pointermove",
      scrollbarController.current.hideTableScrollBar,
    );
    scrollbarElementRef.current?.addEventListener(
      "pointerleave",
      scrollbarController.current.pointerLeaveFunction,
    );

    return () => {
      scrollbarElementRef.current?.removeEventListener(
        "pointermove",
        scrollbarController.current.hideTableScrollBar,
      );
      scrollbarElementRef.current?.removeEventListener(
        "pointerleave",
        scrollbarController.current.pointerLeaveFunction,
      );
    };
  }, []);

  useLayoutEffect(() => {
    if (!contentContainerRef.current) return;

    setTimeout(() => {
      scrollbarVisible.current =
        direction === "vertical"
          ? contentContainerRef.current
            ? contentContainerRef.current.scrollHeight >
              contentContainerRef.current.clientHeight
            : false
          : contentContainerRef.current
            ? contentContainerRef.current.scrollWidth >
              contentContainerRef.current.clientWidth
            : false;
      setRerender((prev) => !prev);
    }, 100);

    const resizeObserver = new ResizeObserver(() => {
      scrollbarVisible.current =
        direction === "vertical"
          ? contentContainerRef.current
            ? contentContainerRef.current.scrollHeight >
              contentContainerRef.current.clientHeight
            : false
          : contentContainerRef.current
            ? contentContainerRef.current.scrollWidth >
              contentContainerRef.current.clientWidth
            : false;
      setRerender((prev) => !prev);
    });
    resizeObserver.observe(contentContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [direction, contentContainerRef.current]);

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
          onPointerDown={scrollbarController.current.trackPointerDown}
        >
          <div
            ref={scrollbarThumbRef}
            className={`fg-scrollbar-thumb ${
              directionRef.current === "vertical"
                ? "fg-vertical-scrollbar-thumb"
                : "fg-horizontal-scrollbar-thumb"
            }`}
            onPointerDown={scrollbarController.current.thumbDragStart}
          ></div>
        </div>
      </div>
    )
  );
}
