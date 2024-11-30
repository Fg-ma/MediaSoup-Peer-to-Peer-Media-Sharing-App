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
      className='w-6 aspect-square absolute top-1/2 translate-y-1/2 -right-1.5'
      mouseDownFunction={mouseDownFunction}
      mouseUpFunction={mouseUpFunction}
      dragFunction={(displacement) => {
        if (!bundleRef.current) {
          return;
        }

        const angle =
          2 * Math.PI - positioning.current.rotation * (Math.PI / 180);

        const pixelScale = {
          x:
            (positioning.current.scale.x / 100) * bundleRef.current.clientWidth,
          y:
            (positioning.current.scale.y / 100) *
            bundleRef.current.clientHeight,
        };

        dragFunction(
          "square",
          {
            x: displacement.x + Math.sin(angle) * (pixelScale.x / 2),
            y: displacement.y + Math.cos(angle) * (pixelScale.y / 2),
          },
          {
            x:
              (positioning.current.position.left / 100) *
              bundleRef.current.clientWidth,
            y:
              (positioning.current.position.top / 100) *
              bundleRef.current.clientHeight,
          }
        );
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
