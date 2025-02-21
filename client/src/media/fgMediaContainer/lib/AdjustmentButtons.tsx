import React from "react";
import PanButton from "../../../elements/fgAdjustmentElements/PanButton";
import RotateButton from "../../../elements/fgAdjustmentElements/RotateButton";
import ScaleButton from "../../../elements/fgAdjustmentElements/ScaleButton";
import FgContentAdjustmentController from "../../../elements/fgAdjustmentElements/lib/FgContentAdjustmentControls";
import TableStaticContentSocketController, {
  TableContentTypes,
} from "../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import { MediaContainerOptions } from "./typeConstant";

export default function AdjustmentButtons({
  kind,
  mediaId,
  bundleRef,
  panBtnRef,
  positioning,
  fgContentAdjustmentController,
  tableStaticContentSocket,
  aspectRatio,
  mediaContainerOptions,
}: {
  kind: TableContentTypes;
  mediaId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  panBtnRef: React.RefObject<HTMLButtonElement>;
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
  tableStaticContentSocket: React.MutableRefObject<
    TableStaticContentSocketController | undefined
  >;
  aspectRatio: number | undefined;
  mediaContainerOptions: MediaContainerOptions;
}) {
  return (
    <>
      <RotateButton
        className='rotate-btn absolute left-full bottom-full aspect-square z-10 w-[10%] min-w-8 max-w-12'
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
        pointerUpFunction={() => {
          fgContentAdjustmentController.adjustmentBtnPointerUpFunction();

          tableStaticContentSocket.current?.updateContentPositioning(
            kind,
            mediaId,
            { rotation: positioning.current.rotation }
          );
        }}
      />
      <PanButton
        externalRef={panBtnRef}
        className='pan-btn absolute left-full top-1/2 -translate-y-1/2 aspect-square z-10 pl-1 w-[10%] min-w-7 max-w-[2.75rem]'
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
        pointerUpFunction={() => {
          fgContentAdjustmentController.adjustmentBtnPointerUpFunction();

          tableStaticContentSocket.current?.updateContentPositioning(
            kind,
            mediaId,
            { position: positioning.current.position }
          );
        }}
      />
      <ScaleButton
        className='scale-btn absolute left-full top-full aspect-square z-10 pl-1 pt-1 w-[10%] min-w-6 max-w-10'
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
            mediaContainerOptions.resizeType ?? "aspect",
            displacement,
            referencePoint,
            referencePoint,
            aspectRatio
          );
        }}
        bundleRef={bundleRef}
        pointerDownFunction={
          fgContentAdjustmentController.adjustmentBtnPointerDownFunction
        }
        pointerUpFunction={() => {
          fgContentAdjustmentController.adjustmentBtnPointerUpFunction();

          tableStaticContentSocket.current?.updateContentPositioning(
            kind,
            mediaId,
            { scale: positioning.current.scale }
          );
        }}
      />
    </>
  );
}
