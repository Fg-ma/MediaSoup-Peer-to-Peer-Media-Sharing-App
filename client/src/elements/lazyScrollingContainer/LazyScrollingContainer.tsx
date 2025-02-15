import React, { useRef } from "react";
import LazyScrollingContainerItem from "./lib/LazyScrollingContainerItem";

export default function LazyScrollingContainer({
  externalRef,
  className,
  items,
}: {
  externalRef: React.RefObject<HTMLDivElement>;
  className: string;
  items: (React.ReactNode | null)[];
}) {
  const scrollingContainerRef = externalRef
    ? externalRef
    : useRef<HTMLDivElement>(null);

  return (
    <div ref={scrollingContainerRef} className={className}>
      {items.map(
        (item, index) =>
          item !== null && (
            <LazyScrollingContainerItem
              key={index}
              scrollingContainerRef={scrollingContainerRef}
              item={item}
            />
          )
      )}
    </div>
  );
}
