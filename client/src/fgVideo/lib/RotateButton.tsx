import React from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import rotateIcon from "../../../public/svgs/rotateIcon.svg";

export default function RotateButton({
  dragFunction,
  bundleRef,
}: {
  dragFunction: (
    displacement: { x: number; y: number },
    event: MouseEvent
  ) => void;
  bundleRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      className='rotate-btn absolute left-full bottom-full w-6 aspect-square z-[10000]'
      dragFunction={dragFunction}
      referenceDragElement={bundleRef}
      contentFunction={() => {
        return (
          <FgSVG
            src={rotateIcon}
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "white" },
              { key: "stroke", value: "white" },
            ]}
          />
        );
      }}
    />
  );
}
