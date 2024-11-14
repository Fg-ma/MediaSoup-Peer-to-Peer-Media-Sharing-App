import React from "react";
import FgButton from "../fgButton/FgButton";

export default function MovementButton({
  dragFunction,
  bundleRef,
}: {
  dragFunction: (displacement: { x: number; y: number }) => void;
  bundleRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      className='absolute left-full top-1/2 -translate-y-1/2 bg-fg-primary w-4 aspect-square z-[10000]'
      dragFunction={dragFunction}
      referenceDragElement={bundleRef}
    />
  );
}
