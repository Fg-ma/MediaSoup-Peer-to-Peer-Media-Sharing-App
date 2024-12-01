import React from "react";
import FgButton from "../fgElements/fgButton/FgButton";
import FgSVG from "../fgElements/fgSVG/FgSVG";
import rotateIcon from "../../public/svgs/rotateIcon.svg";

export default function RotateButton({
  className,
  dragFunction,
  bundleRef,
  mouseDownFunction,
  mouseUpFunction,
}: {
  className?: string;
  dragFunction: (
    displacement: {
      x: number;
      y: number;
    },
    event: MouseEvent
  ) => void;
  bundleRef: React.RefObject<HTMLDivElement>;
  mouseDownFunction: () => void;
  mouseUpFunction: () => void;
}) {
  return (
    <FgButton
      className={className}
      mouseDownFunction={mouseDownFunction}
      mouseUpFunction={mouseUpFunction}
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
