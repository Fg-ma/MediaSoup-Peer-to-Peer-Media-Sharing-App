import React, { useEffect, useState } from "react";

export default function SplitBar({
  methodDrawRootRef,
}: {
  methodDrawRootRef: React.RefObject<HTMLDivElement>;
}) {
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = () => {
    setDragging(true);
    document.body.style.cursor = "ew-resize";
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!dragging || !methodDrawRootRef.current) return;

    const rootRect = methodDrawRootRef.current.getBoundingClientRect();
    const newPanelWidth = rootRect.right - event.clientX - 24;
    if (newPanelWidth > 162 && newPanelWidth < window.innerWidth * 0.75) {
      methodDrawRootRef.current.style.setProperty(
        "--panel-width",
        `${newPanelWidth}px`
      );
    }
  };

  const handlePointerUp = () => {
    setDragging(false);
    document.body.style.cursor = "";
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      if (dragging) {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      }
    };
  }, [dragging]);

  return (
    <div
      id='split-bar'
      className={`${dragging ? "active" : ""}`}
      onPointerDown={handlePointerDown}
    ></div>
  );
}
