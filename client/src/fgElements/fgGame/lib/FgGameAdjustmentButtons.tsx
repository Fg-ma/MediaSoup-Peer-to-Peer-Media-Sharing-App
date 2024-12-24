import React from "react";
import PanButton from "../../../fgAdjustmentComponents/PanButton";
import RotateButton from "../../../fgAdjustmentComponents/RotateButton";
import ScaleButton from "../../../fgAdjustmentComponents/ScaleButton";
import FgContentAdjustmentController from "src/fgAdjustmentComponents/lib/FgContentAdjustmentControls";

export default function FgGameAdjustmentButtons({
  bundleRef,
  panBtnRef,
  fgContentAdjustmentController,
  positioning,
}: {
  bundleRef: React.RefObject<HTMLDivElement>;
  panBtnRef: React.RefObject<HTMLButtonElement>;
  fgContentAdjustmentController: FgContentAdjustmentController;
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
}) {
  return (
    <>
      <RotateButton
        className='rotate-btn absolute left-full bottom-full aspect-square z-10 w-[10%] min-w-8 max-w-14'
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
        pointerDownFunction={
          fgContentAdjustmentController.adjustmentBtnPointerDownFunction
        }
        pointerUpFunction={
          fgContentAdjustmentController.adjustmentBtnPointerUpFunction
        }
      />
      <PanButton
        externalRef={panBtnRef}
        className='pan-btn absolute left-full top-1/2 -translate-y-1/2 aspect-square z-10 pl-1 w-[10%] min-w-7 max-w-[3.25rem]'
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

          const buttonWidth = (panBtnRef.current?.clientWidth ?? 0) / 2;

          fgContentAdjustmentController.movementDragFunction(
            displacement,
            {
              x:
                -buttonWidth * Math.cos(angle) -
                pixelScale.x * Math.cos(angle) -
                (pixelScale.y / 2) * Math.cos(Math.PI / 2 - angle),
              y:
                buttonWidth * Math.sin(angle) +
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
        pointerDownFunction={() =>
          fgContentAdjustmentController.adjustmentBtnPointerDownFunction(
            "position",
            { rotationPointPlacement: "topLeft" }
          )
        }
        pointerUpFunction={
          fgContentAdjustmentController.adjustmentBtnPointerUpFunction
        }
      />
      <ScaleButton
        className='scale-btn absolute left-full top-full aspect-square z-10 pl-1 pt-1 w-[10%] min-w-6 max-w-12'
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
            "square",
            displacement,
            referencePoint,
            referencePoint
          );
        }}
        bundleRef={bundleRef}
        pointerDownFunction={
          fgContentAdjustmentController.adjustmentBtnPointerDownFunction
        }
        pointerUpFunction={
          fgContentAdjustmentController.adjustmentBtnPointerUpFunction
        }
      />
    </>
  );
}
