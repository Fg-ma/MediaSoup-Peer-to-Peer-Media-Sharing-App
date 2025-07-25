import React from "react";
import PanButton from "../../../elements/fgAdjustmentElements/PanButton";
import RotateButton from "../../../elements/fgAdjustmentElements/RotateButton";
import ScaleButton from "../../../elements/fgAdjustmentElements/ScaleButton";
import FgContentAdjustmentController from "../../../elements/fgAdjustmentElements/lib/FgContentAdjustmentControls";
import FgVisualMediaController from "./FgVisualMediaController";

export default function VisualMediaAdjustmentButtons({
  fgVisualMediaController,
  bundleRef,
  positioning,
  fgContentAdjustmentController,
  aspectRatio,
  rotationBtnRef,
  panBtnRef,
  scaleBtnRef,
}: {
  fgVisualMediaController: React.MutableRefObject<FgVisualMediaController>;
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
  fgContentAdjustmentController: React.MutableRefObject<FgContentAdjustmentController | null>;
  aspectRatio: React.MutableRefObject<number>;
  rotationBtnRef: React.RefObject<HTMLButtonElement>;
  panBtnRef: React.RefObject<HTMLButtonElement>;
  scaleBtnRef: React.RefObject<HTMLButtonElement>;
}) {
  return (
    <>
      <RotateButton
        externalRef={rotationBtnRef}
        className="rotate-btn pointer-events-auto absolute bottom-full left-full z-10 aspect-square w-[10%] min-w-8 max-w-12"
        dragFunction={(_displacement, event) => {
          if (!bundleRef.current) {
            return;
          }

          const box = bundleRef.current.getBoundingClientRect();

          fgContentAdjustmentController.current?.rotateDragFunction(event, {
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
        pointerDownFunction={() =>
          fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction()
        }
        pointerUpFunction={() =>
          fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction()
        }
        onPointerEnter={() =>
          fgVisualMediaController.current.handlePointerEnter(
            "rotate",
            rotationBtnRef,
          )
        }
        onPointerLeave={() =>
          fgVisualMediaController.current.handlePointerLeave(
            "rotate",
            rotationBtnRef,
          )
        }
      />
      <PanButton
        externalRef={panBtnRef}
        className="pan-btn pointer-events-auto absolute left-full top-1/2 z-10 aspect-square w-[10%] min-w-7 max-w-[2.75rem] -translate-y-1/2 pl-1"
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

          fgContentAdjustmentController.current?.movementDragFunction(
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
            },
          );
        }}
        bundleRef={bundleRef}
        pointerDownFunction={() =>
          fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction(
            "position",
            { rotationPointPlacement: "topLeft" },
          )
        }
        pointerUpFunction={() =>
          fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction()
        }
        onPointerEnter={() =>
          fgVisualMediaController.current.handlePointerEnter("pan", panBtnRef)
        }
        onPointerLeave={() =>
          fgVisualMediaController.current.handlePointerLeave("pan", panBtnRef)
        }
      />
      <ScaleButton
        externalRef={scaleBtnRef}
        className="scale-btn pointer-events-auto absolute left-full top-full z-10 aspect-square w-[10%] min-w-6 max-w-10 pl-1 pt-1"
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

          fgContentAdjustmentController.current?.scaleDragFunction(
            "aspect",
            displacement,
            referencePoint,
            referencePoint,
            aspectRatio.current,
          );
        }}
        bundleRef={bundleRef}
        pointerDownFunction={() =>
          fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction()
        }
        pointerUpFunction={() =>
          fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction()
        }
        onPointerEnter={() =>
          fgVisualMediaController.current.handlePointerEnter(
            "scale",
            scaleBtnRef,
          )
        }
        onPointerLeave={() =>
          fgVisualMediaController.current.handlePointerLeave(
            "scale",
            scaleBtnRef,
          )
        }
      />
    </>
  );
}
