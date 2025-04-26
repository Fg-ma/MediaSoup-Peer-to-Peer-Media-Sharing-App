import React, { useState, useRef } from "react";

export default function SelectTableLayer({
  tableContainerRef,
  tableRef,
  tableTopRef,
}: {
  tableContainerRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
  tableTopRef: React.RefObject<HTMLDivElement>;
}) {
  const [dragging, setDragging] = useState(false);
  const [_, setRerender] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | undefined>(undefined);
  const dragEnd = useRef<{ x: number; y: number } | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.MouseEvent) => {
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointermove", handlePointerMove);

    const box = tableContainerRef.current?.getBoundingClientRect();
    dragStart.current = {
      x: e.clientX - (box?.x ?? 0) + (tableRef.current?.scrollLeft ?? 0),
      y: e.clientY - (box?.y ?? 0) + (tableRef.current?.scrollTop ?? 0),
    };
    dragEnd.current = undefined;

    setDragging(true);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!dragStart.current) return;

    const box = tableContainerRef.current?.getBoundingClientRect();
    const newDragEnd = {
      x: e.clientX - (box?.x ?? 0) + (tableRef.current?.scrollLeft ?? 0),
      y: e.clientY - (box?.y ?? 0) + (tableRef.current?.scrollTop ?? 0),
    };

    dragEnd.current = newDragEnd;

    const left = Math.min(dragStart.current.x, dragEnd.current.x);
    const top = Math.min(dragStart.current.y, dragEnd.current.y);
    const width = Math.abs(dragStart.current.x - dragEnd.current.x);
    const height = Math.abs(dragStart.current.y - dragEnd.current.y);
    console.log(getSelectablesInBox({ left, top, width, height }));

    setRerender((prev) => !prev);
  };

  const handlePointerUp = () => {
    document.removeEventListener("pointerup", handlePointerUp);
    document.removeEventListener("pointermove", handlePointerMove);

    dragStart.current = undefined;
    dragEnd.current = undefined;

    setDragging(false);
  };

  let boxStyle = {};
  if (dragStart.current && dragEnd.current) {
    const left = Math.min(dragStart.current.x, dragEnd.current.x);
    const top = Math.min(dragStart.current.y, dragEnd.current.y);
    const width = Math.abs(dragStart.current.x - dragEnd.current.x);
    const height = Math.abs(dragStart.current.y - dragEnd.current.y);
    console.log(left, top, width, height);
    boxStyle = {
      left,
      top,
      width,
      height,
    };
  }

  const getSelectablesInBox = (selectionBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  }): HTMLElement[] => {
    if (!tableTopRef.current) return [];

    const selectables =
      tableTopRef.current?.querySelectorAll<HTMLElement>(".selectable");

    const selectionRect = {
      left: selectionBox.left,
      right: selectionBox.left + selectionBox.width,
      top: selectionBox.top,
      bottom: selectionBox.top + selectionBox.height,
    };

    const overlappingElements: HTMLElement[] = [];

    selectables.forEach((el) => {
      if (!tableTopRef.current) return;

      const rect = el.getBoundingClientRect();
      const containerRect = tableTopRef.current.getBoundingClientRect();

      // Get coords relative to container
      const elRect = {
        left: rect.left - containerRect.left + tableTopRef.current.scrollLeft,
        right: rect.right - containerRect.left + tableTopRef.current.scrollLeft,
        top: rect.top - containerRect.top + tableTopRef.current.scrollTop,
        bottom: rect.bottom - containerRect.top + tableTopRef.current.scrollTop,
      };

      const isOverlapping =
        selectionRect.left < elRect.right &&
        selectionRect.right > elRect.left &&
        selectionRect.top < elRect.bottom &&
        selectionRect.bottom > elRect.top;

      if (isOverlapping) {
        overlappingElements.push(el);
      }
    });

    return overlappingElements;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handlePointerDown}
      className="absolute left-0 top-0 h-full w-full bg-transparent"
    >
      {dragging && (
        <div
          className="pointer-events-none absolute rounded border-3 border-dashed border-fg-red bg-fg-red-light bg-opacity-20"
          style={boxStyle}
        />
      )}
    </div>
  );
}
