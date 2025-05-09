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
  style,
}: {
  externalRef?: React.RefObject<HTMLDivElement>;
  direction?: "vertical" | "horizontal";
  scrollingContentRef: React.RefObject<HTMLDivElement>;
  scrollbarVisible?: boolean;
  content?: React.ReactNode;
  className?: string;
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

  const fgScrollbarElementController = useRef(
    new FgScrollbarElementController(
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
    ),
  );

  useEffect(() => {
    if (direction === "vertical") {
      if (scrollbarThumbRef.current) {
        scrollbarThumbRef.current.style.width = "100%";
        scrollbarThumbRef.current.style.left = "0%";
      }
      if (scrollbarRef.current) {
        scrollbarRef.current.style.right = "0%";
      }
      fgScrollbarElementController.current.updateVerticalScrollbar();
    } else {
      if (scrollbarThumbRef.current) {
        scrollbarThumbRef.current.style.height = "100%";
        scrollbarThumbRef.current.style.top = "0%";
      }
      if (scrollbarRef.current) {
        scrollbarRef.current.style.bottom = "0%";
      }
      fgScrollbarElementController.current.updateHorizontalScrollbar();
    }

    scrollingContentRef.current?.addEventListener(
      "scroll",
      fgScrollbarElementController.current.scrollFunction,
    );
    if (direction === "horizontal") {
      scrollingContentRef.current?.addEventListener(
        "wheel",
        fgScrollbarElementController.current.horizontalScrollWheel,
      );
    }

    return () => {
      scrollingContentRef.current?.removeEventListener(
        "scroll",
        fgScrollbarElementController.current.scrollFunction,
      );
      if (direction === "horizontal") {
        scrollingContentRef.current?.removeEventListener(
          "wheel",
          fgScrollbarElementController.current.horizontalScrollWheel,
        );
      }
    };
  }, [direction]);

  useEffect(() => {
    if (scrollbarVisible) {
      setRerender((prev) => !prev);
    } else {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = undefined;
      }
      dragging.current = false;
      if (direction === "vertical") {
        if (scrollbarThumbRef.current) {
          scrollbarThumbRef.current.style.width = "100%";
          scrollbarThumbRef.current.style.left = "0%";
        }
        if (scrollbarRef.current) {
          scrollbarRef.current.style.right = "0%";
        }
        fgScrollbarElementController.current.updateVerticalScrollbar();
      } else {
        if (scrollbarThumbRef.current) {
          scrollbarThumbRef.current.style.height = "100%";
          scrollbarThumbRef.current.style.top = "0%";
        }
        if (scrollbarRef.current) {
          scrollbarRef.current.style.bottom = "0%";
        }
        fgScrollbarElementController.current.updateHorizontalScrollbar();
      }
      setRerender((prev) => !prev);
    }
  }, [scrollbarVisible]);

  return (
    <div
      ref={scrollbarElementRef}
      className={`${className} relative`}
      style={style}
      onPointerMove={fgScrollbarElementController.current.hideTableScrollBar}
      onPointerLeave={fgScrollbarElementController.current.pointerLeaveFunction}
    >
      {scrollbarVisible && (
        <div
          ref={scrollbarRef}
          className={`fg-scrollbar z-scrollbar ${
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
            onPointerDown={
              fgScrollbarElementController.current.trackPointerDown
            }
          >
            <div
              ref={scrollbarThumbRef}
              className={`fg-scrollbar-thumb ${
                direction === "vertical"
                  ? "fg-vertical-scrollbar-thumb"
                  : "fg-horizontal-scrollbar-thumb"
              }`}
              onPointerDown={
                fgScrollbarElementController.current.thumbDragStart
              }
            ></div>
          </div>
        </div>
      )}
      {content}
    </div>
  );
}
