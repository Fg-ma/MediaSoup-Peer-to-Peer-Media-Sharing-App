import React, { CSSProperties, useRef } from "react";
import LazyScrollingContainerItem from "./lib/LazyScrollingContainerItem";

export default function LazyScrollingContainer({
  externalRef,
  className,
  style,
  items,
  clickFunction,
}: {
  externalRef?: React.RefObject<HTMLDivElement>;
  className?: string;
  style?: CSSProperties;
  items?: (React.ReactNode | null)[];
  clickFunction?: (event: React.MouseEvent) => void;
}) {
  const scrollingContainerRef = externalRef
    ? externalRef
    : useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollingContainerRef}
      className={className}
      style={style}
      onClick={clickFunction}
    >
      {items &&
        items.map(
          (item, index) =>
            item !== null && (
              <LazyScrollingContainerItem
                key={index}
                scrollingContainerRef={scrollingContainerRef}
                item={item}
              />
            ),
        )}
    </div>
  );
}
