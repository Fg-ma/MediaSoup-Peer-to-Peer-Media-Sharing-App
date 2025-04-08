import React, { useRef } from "react";
import LazyScrollingContainerItem from "./lib/LazyScrollingContainerItem";

export default function LazyScrollingContainer({
  externalRef,
  className,
  items,
  clickFunction,
}: {
  externalRef: React.RefObject<HTMLDivElement>;
  className: string;
  items: (React.ReactNode | null)[];
  clickFunction?: (event: React.MouseEvent) => void;
}) {
  const scrollingContainerRef = externalRef
    ? externalRef
    : useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollingContainerRef}
      className={className}
      onClick={clickFunction}
    >
      {items.map(
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
