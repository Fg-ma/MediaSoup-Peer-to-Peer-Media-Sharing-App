import React from "react";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";
import scaleIcon from "../../../../public/svgs/scaleIcon.svg";

export default function ScaleButton({
  dragFunction,
  bundleRef,
  positioning,
  mouseDownFunction,
  mouseUpFunction,
}: {
  dragFunction: (
    kind: "any" | "square",
    displacement: { x: number; y: number },
    referencePoint: { x: number; y: number }
  ) => void;
  bundleRef: React.RefObject<HTMLDivElement>;
  positioning: React.MutableRefObject<{
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  }>;
  mouseDownFunction: () => void;
  mouseUpFunction: () => void;
}) {
  return (
    <FgButton
      className='scale-btn absolute left-full top-full w-6 aspect-square z-10 pl-1 pt-1'
      mouseDownFunction={mouseDownFunction}
      mouseUpFunction={mouseUpFunction}
      dragFunction={(displacement) => {
        if (!bundleRef.current) {
          return;
        }

        dragFunction("any", displacement, {
          x:
            (positioning.current.position.left / 100) *
            bundleRef.current.clientWidth,
          y:
            (positioning.current.position.top / 100) *
            bundleRef.current.clientHeight,
        });
      }}
      referenceDragElement={bundleRef}
      contentFunction={() => {
        return (
          <FgSVG
            src={scaleIcon}
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
