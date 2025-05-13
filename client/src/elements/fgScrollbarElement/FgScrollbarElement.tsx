import React, { useRef } from "react";
import Scrollbar from "./lib/Scrollbar";
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
  style?: React.CSSProperties;
}) {
  const scrollbarElementRef = externalRef
    ? externalRef
    : useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollbarElementRef}
      className={`${className} relative`}
      style={style}
    >
      <Scrollbar
        direction={direction}
        scrollingContentRef={scrollingContentRef}
        scrollbarVisible={scrollbarVisible}
        scrollbarSize={scrollbarSize}
        gutterSize={gutterSize}
        scrollbarElementRef={scrollbarElementRef}
      />
      {content}
    </div>
  );
}
