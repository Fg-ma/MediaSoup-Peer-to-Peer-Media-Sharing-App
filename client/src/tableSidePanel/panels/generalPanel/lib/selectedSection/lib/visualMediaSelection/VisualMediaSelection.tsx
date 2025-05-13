import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../../../context/mediaContext/MediaContext";
import { usePermissionsContext } from "../../../../../../../context/permissionsContext/PermissionsContext";
import GeneralMediaSelection from "../GeneralMediaSelection";
import VisualMediaEffectsSection from "./lib/VisualMediaEffectsSection";
import CameraMedia from "../../../../../../../media/fgVisualMedia/CameraMedia";
import ScreenMedia from "../../../../../../../media/fgVisualMedia/ScreenMedia";
import { useSignalContext } from "../../../../../../../context/signalContext/SignalContext";
import { GroupSignals } from "../../../../../../../context/signalContext/lib/typeConstant";

export default function VisualMediaSelection({
  username,
  instance,
  isUser,
  contentId,
  type,
  tablePanelRef,
}: {
  username: string;
  instance: string;
  isUser: boolean;
  contentId: string;
  type: "camera" | "screen";
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia, remoteMedia } = useMediaContext();
  const { permissions } = usePermissionsContext();
  const { selected, addGroupSignalListener, removeGroupSignalListener } =
    useSignalContext();

  const mirrorCanvasRef = useRef<HTMLCanvasElement>(null);
  const mirrorVideoRef = useRef<HTMLVideoElement>(null);

  const [_, setRerender] = useState(false);

  const visualMedia = isUser
    ? userMedia.current[type][contentId]
    : remoteMedia.current[username]?.[instance]?.[type]?.[contentId];
  const posAttr = document
    .getElementById(`${contentId}_container`)
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

  const updateMirrors = () => {
    const canvas = mirrorCanvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (
      !ctx ||
      !(
        visualMedia instanceof CameraMedia || visualMedia instanceof ScreenMedia
      )
    )
      return;

    const src = visualMedia.canvas;

    ctx.clearRect(
      0,
      0,
      largestDim.current === "width"
        ? 184
        : 192 * (visualMedia.aspectRatio ?? 1),
      largestDim.current === "width"
        ? 184 / (visualMedia.aspectRatio ?? 1)
        : 192,
    );
    ctx.drawImage(
      src,
      0,
      0,
      largestDim.current === "width"
        ? 184
        : 192 * (visualMedia.aspectRatio ?? 1),
      largestDim.current === "width"
        ? 184 / (visualMedia.aspectRatio ?? 1)
        : 192,
    );

    requestAnimationFrame(updateMirrors);
  };

  const onMeta = () => {
    mirrorVideoRef.current?.removeEventListener("loadedmetadata", onMeta);

    if (!mirrorVideoRef.current) return;

    largestDim.current =
      mirrorVideoRef.current.videoWidth > mirrorVideoRef.current.videoHeight
        ? "width"
        : "height";

    setRerender((prev) => !prev);
  };

  const handleStream = async () => {
    if (
      !mirrorVideoRef.current ||
      !visualMedia ||
      !(visualMedia instanceof MediaStreamTrack)
    )
      return;

    const stream = new MediaStream([visualMedia]);
    mirrorVideoRef.current.srcObject = stream;
    mirrorVideoRef.current.srcObject = stream;
    mirrorVideoRef.current.playsInline = true;
    mirrorVideoRef.current.muted = true;
    mirrorVideoRef.current.autoplay = true;

    mirrorVideoRef.current.addEventListener("loadedmetadata", onMeta);
  };

  const handleGroupSignal = (signal: GroupSignals) => {
    if (signal.type === "groupElementMove") {
      const { contentType, contentId } = signal.data;
      if (
        selected.current?.some(
          (info) => info.type === contentType && info.id === contentId,
        )
      ) {
        setRerender((prev) => !prev);
      }
    }
  };

  useEffect(() => {
    if (
      visualMedia instanceof CameraMedia ||
      visualMedia instanceof ScreenMedia
    ) {
      largestDim.current =
        (visualMedia?.aspectRatio ?? 0) > 1 ? "width" : "height";
      setRerender((prev) => !prev);
      updateMirrors();
    } else {
      handleStream();
    }

    addGroupSignalListener(handleGroupSignal);

    return () => {
      removeGroupSignalListener(handleGroupSignal);
    };
  }, []);

  return (
    visualMedia && (
      <GeneralMediaSelection
        contentId={contentId}
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
            visualMediaId={contentId}
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
