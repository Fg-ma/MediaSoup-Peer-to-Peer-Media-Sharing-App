import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../../../context/mediaContext/MediaContext";
import { usePermissionsContext } from "../../../../../../../context/permissionsContext/PermissionsContext";
import GeneralMediaSelection from "../GeneralMediaSelection";
import VisualMediaEffectsSection from "./lib/VisualMediaEffectsSection";
import CameraMedia from "../../../../../../../media/fgVisualMedia/CameraMedia";
import ScreenMedia from "../../../../../../../media/fgVisualMedia/ScreenMedia";
import { useSignalContext } from "../../../../../../../context/signalContext/SignalContext";
import VisualMediaSelectionController from "./lib/VisualMediaSelectionController";

export default function VisualMediaSelection({
  username,
  instance,
  isUser,
  instanceId,
  type,
  tablePanelRef,
}: {
  username: string;
  instance: string;
  isUser: boolean;
  instanceId: string;
  type: "camera" | "screen";
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia, remoteMedia } = useMediaContext();
  const { permissions } = usePermissionsContext();
  const { addGroupSignalListener, removeGroupSignalListener } =
    useSignalContext();

  const mirrorCanvasRef = useRef<HTMLCanvasElement>(null);
  const mirrorVideoRef = useRef<HTMLVideoElement>(null);

  const [_, setRerender] = useState(false);

  const visualMedia = isUser
    ? userMedia.current[type][instanceId]
    : remoteMedia.current[username]?.[instance]?.[type]?.[instanceId];
  const posAttr = document
    .getElementById(`${instanceId}_container`)
    ?.getAttribute("data-positioning");
  const positioning = posAttr
    ? (JSON.parse(posAttr) ?? {
        position: { top: 50, left: 50 },
        scale: { x: 25, y: 25 },
        rotation: 0,
      })
    : {
        position: { top: 50, left: 50 },
        scale: { x: 25, y: 25 },
        rotation: 0,
      };
  const largestDim = useRef<"width" | "height" | undefined>(undefined);

  const visualMediaSelectionController = new VisualMediaSelectionController(
    instanceId,
    setRerender,
    visualMedia,
    mirrorVideoRef,
    mirrorCanvasRef,
    largestDim,
  );

  useEffect(() => {
    if (
      visualMedia instanceof CameraMedia ||
      visualMedia instanceof ScreenMedia
    ) {
      largestDim.current =
        (visualMedia?.aspectRatio ?? 0) > 1 ? "width" : "height";
      setRerender((prev) => !prev);
      visualMediaSelectionController.updateMirrors();
    } else {
      visualMediaSelectionController.handleStream();
    }

    addGroupSignalListener(visualMediaSelectionController.handleGroupSignal);

    return () => {
      removeGroupSignalListener(
        visualMediaSelectionController.handleGroupSignal,
      );
    };
  }, []);

  return (
    visualMedia && (
      <GeneralMediaSelection
        instanceId={instanceId}
        contentType={type}
        selectionContent={
          isUser ? (
            visualMedia instanceof CameraMedia ||
            visualMedia instanceof ScreenMedia ? (
              <div
                className={`${largestDim.current === "width" ? "h-auto w-full max-w-[12rem]" : "h-full max-h-[12rem] w-auto"} overflow-hidden rounded-md`}
                style={{ aspectRatio: visualMedia.aspectRatio }}
              >
                <canvas
                  ref={mirrorCanvasRef}
                  className="h-full w-full"
                  width={
                    largestDim.current === "width"
                      ? 184
                      : 192 * (visualMedia.aspectRatio ?? 1)
                  }
                  height={
                    largestDim.current === "width"
                      ? 184 / (visualMedia.aspectRatio ?? 1)
                      : 192
                  }
                />
              </div>
            ) : undefined
          ) : (
            <video
              ref={mirrorVideoRef}
              className={`${largestDim.current === "width" ? "h-auto w-full max-w-[12rem]" : "h-full max-h-[12rem] w-auto"} overflow-hidden rounded-md`}
            />
          )
        }
        effectsSection={
          <VisualMediaEffectsSection
            username={username}
            instance={instance}
            visualMediaId={instanceId}
            isUser={isUser}
            acceptsVisualEffects={
              type === "camera"
                ? permissions.current.acceptsCameraEffects
                : permissions.current.acceptsScreenEffects
            }
            type={type}
            visualMedia={visualMedia}
          />
        }
        filename={username}
        mimeType={undefined}
        fileSize={undefined}
        tablePanelRef={tablePanelRef}
        positioning={positioning}
      />
    )
  );
}
