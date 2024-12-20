import React from "react";
import PanButton from "../../fgAdjustmentComponents/PanButton";
import RotateButton from "../../fgAdjustmentComponents/RotateButton";
import ScaleButton from "../../fgAdjustmentComponents/ScaleButton";
import FgContentAdjustmentController from "../../fgAdjustmentComponents/lib/FgContentAdjustmentControls";

export default function VisualMediaAdjustmentButtons({
  bundleRef,
  positioning,
  fgContentAdjustmentController,
}: {
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
  fgContentAdjustmentController: FgContentAdjustmentController;
}) {
  return (
    <>
      <RotateButton
        className={
          "rotate-btn absolute left-full bottom-full w-6 aspect-square z-10"
        }
        dragFunction={(_displacement, event) => {
          if (!bundleRef.current) {
            return;
          }

          const box = bundleRef.current.getBoundingClientRect();

          fgContentAdjustmentController.rotateDragFunction(event, {
            x:
              (positioning.current.position.left / 100) *
                bundleRef.current.clientWidth +
              box.left,
            y:
              (positioning.current.position.top / 100) *
                bundleRef.current.clientHeight +
              box.top,
          });
        }}
        bundleRef={bundleRef}
        mouseDownFunction={
          fgContentAdjustmentController.adjustmentBtnMouseDownFunction
        }
        mouseUpFunction={
          fgContentAdjustmentController.adjustmentBtnMouseUpFunction
        }
      />
      <PanButton
        className={
          "pan-btn absolute left-full top-1/2 -translate-y-1/2 w-7 aspect-square z-10 pl-1"
        }
        dragFunction={(displacement) => {
          if (!bundleRef.current) {
            return;
          }

          const angle =
            2 * Math.PI - positioning.current.rotation * (Math.PI / 180);

          const pixelScale = {
            x:
              (positioning.current.scale.x / 100) *
              bundleRef.current.clientWidth,
            y:
              (positioning.current.scale.y / 100) *
              bundleRef.current.clientHeight,
          };

          fgContentAdjustmentController.movementDragFunction(
            displacement,
            {
              x:
                -15 * Math.cos(angle) -
                pixelScale.x * Math.cos(angle) -
                (pixelScale.y / 2) * Math.cos(Math.PI / 2 - angle),
              y:
                15 * Math.sin(angle) +
                pixelScale.x * Math.sin(angle) -
                (pixelScale.y / 2) * Math.sin(Math.PI / 2 - angle),
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
        bundleRef={bundleRef}
        mouseDownFunction={() =>
          fgContentAdjustmentController.adjustmentBtnMouseDownFunction(
            "position",
            { rotationPointPlacement: "topLeft" }
          )
        }
        mouseUpFunction={
          fgContentAdjustmentController.adjustmentBtnMouseUpFunction
        }
      />
      <ScaleButton
        className={
          "scale-btn absolute left-full top-full w-6 aspect-square z-10 pl-1 pt-1"
        }
        dragFunction={(displacement) => {
          if (!bundleRef.current) {
            return;
          }

          const referencePoint = {
            x:
              (positioning.current.position.left / 100) *
              bundleRef.current.clientWidth,
            y:
              (positioning.current.position.top / 100) *
              bundleRef.current.clientHeight,
          };

          fgContentAdjustmentController.scaleDragFunction(
            "any",
            displacement,
            referencePoint,
            referencePoint
          );
        }}
        bundleRef={bundleRef}
        mouseDownFunction={
          fgContentAdjustmentController.adjustmentBtnMouseDownFunction
        }
        mouseUpFunction={
          fgContentAdjustmentController.adjustmentBtnMouseUpFunction
        }
      />
    </>
  );
}
