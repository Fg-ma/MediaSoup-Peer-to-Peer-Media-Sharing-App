import React from "react";

export default function KeyVisualizer({
  keyVisualizerRef,
}: {
  keyVisualizerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className='w-full h-full flex items-center justify-center bg-fg-white-90'>
      <div ref={keyVisualizerRef} className='key-visualizer'></div>
    </div>
  );
}
