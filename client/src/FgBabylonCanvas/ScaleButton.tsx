import React from "react";
import FgButton from "../fgButton/FgButton";

export default function ScaleButton({
  dragFunction,
  bundleRef,
}: {
  dragFunction: (displacement: { x: number; y: number }) => void;
  bundleRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      className='absolute left-full top-full bg-fg-primary w-4 aspect-square z-[10000]'
      dragFunction={dragFunction}
      referenceDragElement={bundleRef}
    />
  );
}
