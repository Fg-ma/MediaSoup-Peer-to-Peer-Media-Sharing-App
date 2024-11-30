import React from "react";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";
import panIcon from "../../../../public/svgs/panIcon.svg";
import { RotationPoints } from "../../../fgVisualMedia/lib/FgAdjustmentVideoControls";

export default function PanButton({
  dragFunction,
  bundleRef,
  positioning,
  mouseDownFunction,
  mouseUpFunction,
}: {
  dragFunction: (
    rotationPointPlacement: RotationPoints,
    displacement: { x: number; y: number },
    buttonPosition: {
      x: number;
      y: number;
    },
    rotationPoint: { x: number; y: number }
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
      className='w-7 aspect-square absolute top-1/2 -translate-y-1/2 -left-3'
      mouseDownFunction={mouseDownFunction}
      mouseUpFunction={mouseUpFunction}
      dragFunction={(displacement) => {
        if (!bundleRef.current) {
          return;
        }

        const pixelScale = {
          x:
            (positioning.current.scale.x / 100) * bundleRef.current.clientWidth,
          y:
            (positioning.current.scale.y / 100) *
            bundleRef.current.clientHeight,
        };

        dragFunction(
          "middleLeft",
          displacement,
          {
            x: 0,
            y: -(pixelScale.y / 2),
          },
          {
            x:
              (positioning.current.position.left / 100) *
              bundleRef.current.clientWidth,
            y:
              (positioning.current.position.top / 100) *
                bundleRef.current.clientHeight +
              pixelScale.y / 2,
          }
        );
      }}
      referenceDragElement={bundleRef}
      contentFunction={() => {
        return (
          <FgSVG
            src={panIcon}
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
