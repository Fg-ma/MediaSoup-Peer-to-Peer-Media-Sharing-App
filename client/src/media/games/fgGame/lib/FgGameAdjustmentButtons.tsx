import React from "react";
import PanButton from "../../../../elements/fgAdjustmentElements/PanButton";
import RotateButton from "../../../../elements/fgAdjustmentElements/RotateButton";
import ScaleButton from "../../../../elements/fgAdjustmentElements/ScaleButton";
import FgContentAdjustmentController from "../../../../elements/fgAdjustmentElements/lib/FgContentAdjustmentControls";
import { useSocketContext } from "../../../../context/socketContext/SocketContext";
import { GameTypes } from "../../../../../../universal/contentTypeConstant";
import FgGameController from "./FgGameController";

export default function FgGameAdjustmentButtons({
  fgGameController,
  gameId,
  gameType,
  sharedBundleRef,
  fgContentAdjustmentController,
  positioning,
  rotationBtnRef,
  panBtnRef,
  scaleBtnRef,
}: {
  fgGameController: FgGameController;
  gameId: string;
  gameType: GameTypes;
  sharedBundleRef: React.RefObject<HTMLDivElement>;
  fgContentAdjustmentController: React.MutableRefObject<FgContentAdjustmentController | null>;
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
  rotationBtnRef: React.RefObject<HTMLButtonElement>;
  panBtnRef: React.RefObject<HTMLButtonElement>;
  scaleBtnRef: React.RefObject<HTMLButtonElement>;
}) {
  const { gamesSocket } = useSocketContext();

  return (
    <>
      <RotateButton
        externalRef={rotationBtnRef}
        className="rotate-btn absolute bottom-full left-full z-10 aspect-square w-[10%] min-w-8 max-w-14"
        dragFunction={(_displacement, event) => {
          if (!sharedBundleRef.current) {
            return;
          }

          const box = sharedBundleRef.current.getBoundingClientRect();

          fgContentAdjustmentController.current?.rotateDragFunction(event, {
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
        pointerDownFunction={() =>
          fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction()
        }
        pointerUpFunction={() => {
          fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction();

          gamesSocket.current?.updateContentPositioning(gameType, gameId, {
            rotation: positioning.current.rotation,
          });
        }}
        onPointerEnter={() =>
          fgGameController.handlePointerEnter("rotate", rotationBtnRef)
        }
        onPointerLeave={() =>
          fgGameController.handlePointerLeave("rotate", rotationBtnRef)
        }
      />
      <PanButton
        externalRef={panBtnRef}
        className="pan-btn absolute left-full top-1/2 z-10 aspect-square w-[10%] min-w-7 max-w-[3.25rem] -translate-y-1/2 pl-1"
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
                sharedBundleRef.current.clientWidth,
              y:
                (positioning.current.position.top / 100) *
                sharedBundleRef.current.clientHeight,
            },
          );
        }}
        bundleRef={sharedBundleRef}
        pointerDownFunction={() =>
          fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction(
            "position",
            { rotationPointPlacement: "topLeft" },
          )
        }
        pointerUpFunction={() => {
          fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction();

          gamesSocket.current?.updateContentPositioning(gameType, gameId, {
            position: positioning.current.position,
          });
        }}
        onPointerEnter={() =>
          fgGameController.handlePointerEnter("pan", panBtnRef)
        }
        onPointerLeave={() =>
          fgGameController.handlePointerLeave("pan", panBtnRef)
        }
      />
      <ScaleButton
        externalRef={scaleBtnRef}
        className="scale-btn absolute left-full top-full z-10 aspect-square w-[10%] min-w-6 max-w-12 pl-1 pt-1"
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

          fgContentAdjustmentController.current?.scaleDragFunction(
            "square",
            displacement,
            referencePoint,
            referencePoint,
          );
        }}
        bundleRef={sharedBundleRef}
        pointerDownFunction={() =>
          fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction()
        }
        pointerUpFunction={() => {
          fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction();

          gamesSocket.current?.updateContentPositioning(gameType, gameId, {
            scale: positioning.current.scale,
          });
        }}
        onPointerEnter={() =>
          fgGameController.handlePointerEnter("scale", scaleBtnRef)
        }
        onPointerLeave={() =>
          fgGameController.handlePointerLeave("scale", scaleBtnRef)
        }
      />
    </>
  );
}
