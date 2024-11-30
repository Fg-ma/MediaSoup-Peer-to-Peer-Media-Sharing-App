import React from "react";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";
import rotateIcon from "../../../../public/svgs/rotateIcon.svg";

export default function RotateButton({
  dragFunction,
  bundleRef,
  positioning,
  mouseDownFunction,
  mouseUpFunction,
}: {
  dragFunction: (
    event: MouseEvent,
    referencePoint: {
      x: number;
      y: number;
    }
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
      className='w-7 aspect-square absolute top-1/2 -translate-y-[150%] -right-1.5'
      mouseDownFunction={mouseDownFunction}
      mouseUpFunction={mouseUpFunction}
      dragFunction={(_displacement, event) => {
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

        dragFunction(event, {
          x:
            (positioning.current.position.left / 100) *
            bundleRef.current.clientWidth,
          y:
            (positioning.current.position.top / 100) *
              bundleRef.current.clientHeight +
            pixelScale.y / 2,
        });
      }}
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
