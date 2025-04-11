import React from "react";

export default function KeyVisualizer({
  keyVisualizerRef,
}: {
  keyVisualizerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-fg-tone-black-7">
      <div ref={keyVisualizerRef} className="key-visualizer"></div>
    </div>
  );
}
