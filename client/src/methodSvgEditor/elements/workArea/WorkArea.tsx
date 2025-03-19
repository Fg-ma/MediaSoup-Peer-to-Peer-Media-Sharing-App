import React from "react";

export default function WorkArea({
  workAreaRef,
  svgCanvasRef,
}: {
  workAreaRef: React.RefObject<HTMLDivElement>;
  svgCanvasRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div ref={workAreaRef} id='workarea'>
      <div ref={svgCanvasRef} id='svgcanvas'></div>
    </div>
  );
}
