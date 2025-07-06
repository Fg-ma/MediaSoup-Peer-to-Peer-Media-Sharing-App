import React, { useRef } from "react";
import Scrollbar from "./lib/Scrollbar";
import "./lib/fgScrollbar.css";

export default function FgScrollbarElement({
  externalRef,
  externalContentContainerRef,
  direction = "vertical",
  scrollingContentRef,
  content,
  outsideContent,
  className,
  contentContainerClassName,
  scrollbarSize = 10,
  gutterSize = 11,
  style,
}: {
  externalRef?: React.RefObject<HTMLDivElement>;
  externalContentContainerRef?: React.RefObject<HTMLDivElement>;
  direction?: "vertical" | "horizontal";
  scrollingContentRef: React.RefObject<HTMLDivElement>;
  content?: React.ReactNode;
  outsideContent?: React.ReactNode;
  className?: string;
  contentContainerClassName?: string;
  scrollbarSize?: number;
  gutterSize?: number;
  style?: React.CSSProperties;
}) {
  const scrollbarElementRef = externalRef
    ? externalRef
    : useRef<HTMLDivElement>(null);
  const contentContainerRef = externalContentContainerRef
    ? externalContentContainerRef
    : useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollbarElementRef}
      className={`${className} hide-fg-scrollbar relative`}
      style={style}
    >
      <Scrollbar
        contentContainerRef={contentContainerRef}
        direction={direction}
        scrollingContentRef={scrollingContentRef}
        scrollbarSize={scrollbarSize}
        gutterSize={gutterSize}
        scrollbarElementRef={scrollbarElementRef}
      />
      {outsideContent}
      <div className={contentContainerClassName} ref={contentContainerRef}>
        {content}
      </div>
    </div>
  );
}
