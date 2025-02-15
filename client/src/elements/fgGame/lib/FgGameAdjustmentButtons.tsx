import React from "react";
import PanButton from "../../../elements/fgAdjustmentElements/PanButton";
import RotateButton from "../../../elements/fgAdjustmentElements/RotateButton";
import ScaleButton from "../../../elements/fgAdjustmentElements/ScaleButton";
import FgContentAdjustmentController from "../../../elements/fgAdjustmentElements/lib/FgContentAdjustmentControls";

export default function FgGameAdjustmentButtons({
  sharedBundleRef,
  panBtnRef,
  fgContentAdjustmentController,
  positioning,
}: {
  sharedBundleRef: React.RefObject<HTMLDivElement>;
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
          if (!sharedBundleRef.current) {
            return;
          }

          const box = sharedBundleRef.current.getBoundingClientRect();

          fgContentAdjustmentController.rotateDragFunction(event, {
            x:
              (positioning.current.position.left / 100) *
                sharedBundleRef.current.clientWidth +
              box.left,
            y:
              (positioning.current.position.top / 100) *
                sharedBundleRef.current.clientHeight +
              box.top,
          });
        }}
        bundleRef={sharedBundleRef}
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
          if (!sharedBundleRef.current) {
            return;
          }

          const angle =
            2 * Math.PI - positioning.current.rotation * (Math.PI / 180);

          const pixelScale = {
            x:
              (positioning.current.scale.x / 100) *
              sharedBundleRef.current.clientWidth,
            y:
              (positioning.current.scale.y / 100) *
              sharedBundleRef.current.clientHeight,
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
                sharedBundleRef.current.clientWidth,
              y:
                (positioning.current.position.top / 100) *
                sharedBundleRef.current.clientHeight,
            }
          );
        }}
        bundleRef={sharedBundleRef}
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
          if (!sharedBundleRef.current) {
            return;
          }

          const referencePoint = {
            x:
              (positioning.current.position.left / 100) *
              sharedBundleRef.current.clientWidth,
            y:
              (positioning.current.position.top / 100) *
              sharedBundleRef.current.clientHeight,
          };

          fgContentAdjustmentController.scaleDragFunction(
            "square",
            displacement,
            referencePoint,
            referencePoint
          );
        }}
        bundleRef={sharedBundleRef}
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
