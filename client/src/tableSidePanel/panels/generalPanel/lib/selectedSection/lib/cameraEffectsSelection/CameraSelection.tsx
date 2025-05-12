import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../../../context/mediaContext/MediaContext";
import { usePermissionsContext } from "../../../../../../../context/permissionsContext/PermissionsContext";
import GeneralMediaSelection from "../GeneralMediaSelection";
import CameraEffectsSection from "./lib/CameraEffectsSection";
import CameraMedia from "../../../../../../../media/fgVisualMedia/CameraMedia";

export default function CameraSelection({
  username,
  instance,
  isUser,
  contentId,
  tablePanelRef,
}: {
  username: string;
  instance: string;
  isUser: boolean;
  contentId: string;
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia, remoteMedia } = useMediaContext();
  const { permissions } = usePermissionsContext();

  const mirrorCanvasRef = useRef<HTMLCanvasElement>(null);
  const mirrorVideoRef = useRef<HTMLVideoElement>(null);

  const [_, setRerender] = useState(false);

  const cameraMedia = isUser
    ? userMedia.current.camera[contentId]
    : remoteMedia.current[username][instance].camera?.[contentId];
  const positioning = {
    position: { top: 50, left: 50 },
    scale: { x: 25, y: 25 },
    rotation: 0,
  }; //cameraMedia?.getPositioning();
  const largestDim = useRef<"width" | "height" | undefined>(undefined);

  const updateMirrors = () => {
    const canvas = mirrorCanvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!ctx || !(cameraMedia instanceof CameraMedia)) return;

    const src = cameraMedia.canvas;

    ctx.clearRect(
      0,
      0,
      largestDim.current === "width"
        ? 184
        : 192 * (cameraMedia.aspectRatio ?? 1),
      largestDim.current === "width"
        ? 184 / (cameraMedia.aspectRatio ?? 1)
        : 192,
    );
    ctx.drawImage(
      src,
      0,
      0,
      largestDim.current === "width"
        ? 184
        : 192 * (cameraMedia.aspectRatio ?? 1),
      largestDim.current === "width"
        ? 184 / (cameraMedia.aspectRatio ?? 1)
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
      !cameraMedia ||
      !(cameraMedia instanceof MediaStreamTrack)
    )
      return;

    const stream = new MediaStream([cameraMedia]);
    mirrorVideoRef.current.srcObject = stream;
    mirrorVideoRef.current.srcObject = stream;
    mirrorVideoRef.current.playsInline = true;
    mirrorVideoRef.current.muted = true;
    mirrorVideoRef.current.autoplay = true;

    mirrorVideoRef.current.addEventListener("loadedmetadata", onMeta);
  };

  useEffect(() => {
    if (cameraMedia instanceof CameraMedia) {
      largestDim.current =
        (cameraMedia?.aspectRatio ?? 0) > 1 ? "width" : "height";
      setRerender((prev) => !prev);
      updateMirrors();
    } else {
      handleStream();
    }
  }, []);

  return (
    cameraMedia && (
      <GeneralMediaSelection
        contentId={contentId}
        contentType="image"
        selectionContent={
          isUser ? (
            cameraMedia instanceof CameraMedia ? (
              <div
                className={`${largestDim.current === "width" ? "h-auto w-full max-w-[12rem]" : "h-full max-h-[12rem] w-auto"} overflow-hidden rounded-md`}
                style={{ aspectRatio: cameraMedia.aspectRatio }}
              >
                <canvas
                  ref={mirrorCanvasRef}
                  className="h-full w-full"
                  width={
                    largestDim.current === "width"
                      ? 184
                      : 192 * (cameraMedia.aspectRatio ?? 1)
                  }
                  height={
                    largestDim.current === "width"
                      ? 184 / (cameraMedia.aspectRatio ?? 1)
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
          <CameraEffectsSection
            username={username}
            instance={instance}
            type="camera"
            visualMediaId={contentId}
            isUser={isUser}
            acceptsVisualEffects={permissions.current.acceptsCameraEffects}
            cameraMedia={cameraMedia}
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
