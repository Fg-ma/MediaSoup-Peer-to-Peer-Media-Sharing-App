import React from "react";
import FgButton from "../fgButton/FgButton";

export default function RotateButton({
  dragFunction,
  mouseDownFunction,
  bundleRef,
}: {
  dragFunction: (
    displacement: { x: number; y: number },
    event: MouseEvent
  ) => void;
  mouseDownFunction: (event: React.MouseEvent) => void;
  bundleRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      className='absolute left-full bottom-full bg-fg-primary w-4 aspect-square z-[10000]'
      dragFunction={dragFunction}
      mouseDownFunction={mouseDownFunction}
      referenceDragElement={bundleRef}
    />
  );
}
