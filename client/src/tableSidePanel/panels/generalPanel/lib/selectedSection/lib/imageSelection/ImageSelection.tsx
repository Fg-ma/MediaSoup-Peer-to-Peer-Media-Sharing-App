import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../../../context/mediaContext/MediaContext";
import { ImageInstanceListenerTypes } from "../../../../../../../media/fgTableImage/TableImageMediaInstance";
import ImageEffectsSection from "./lib/ImageEffectsSection";
import GeneralMediaSelection from "../GeneralMediaSelection";

export default function ImageSelection({
  contentId,
  tablePanelRef,
}: {
  contentId: string;
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();

  const [largestDim, setLargestDim] = useState<"width" | "height">("width");
  const mirrorCanvasRef = useRef<HTMLCanvasElement>(null);

  const imageInstanceMedia = userMedia.current.image.tableInstances[contentId];
  const positioning = imageInstanceMedia?.getPositioning();

  const drawInstanceCanvas = async () => {
    const mirrorCanvas = mirrorCanvasRef.current;
    const sourceCanvas = imageInstanceMedia.instanceCanvas;
    if (!mirrorCanvas || !sourceCanvas) return;

    const ctx = mirrorCanvas.getContext("2d");
    if (!ctx) return;

    // Mirror canvas gets scaled dimensions
    const aspectRatio = sourceCanvas.width / sourceCanvas.height;
    let height;
    let width;
    if (sourceCanvas.width > sourceCanvas.height) {
      width = 192;
      height = width / aspectRatio;
      setLargestDim("width");
    } else {
      height = 192;
      width = height * aspectRatio;
      setLargestDim("height");
    }
    mirrorCanvas.width = width;
    mirrorCanvas.height = height;

    const url = await imageInstanceMedia.babylonScene?.getSnapShotURL();
    if (!url) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = url;
  };

  const handleInstanceEvents = (event: ImageInstanceListenerTypes) => {
    if (event.type === "effectsChanged") {
      drawInstanceCanvas();
    }
  };

  useEffect(() => {
    drawInstanceCanvas();

    imageInstanceMedia?.addImageInstanceListener(handleInstanceEvents);

    return () => {
      imageInstanceMedia?.removeImageInstanceListener(handleInstanceEvents);
    };
  }, []);

  return (
    imageInstanceMedia && (
      <GeneralMediaSelection
        contentId={contentId}
        contentType="image"
        selectionContent={
          <canvas
            ref={mirrorCanvasRef}
            className={`${largestDim === "width" ? "w-full max-w-[12rem]" : "h-full max-h-[12rem]"} overflow-hidden rounded-md`}
          ></canvas>
        }
        effectsSection={
          <ImageEffectsSection
            imageInstanceId={contentId}
            imageMediaInstance={imageInstanceMedia}
          />
        }
        downloadFunction={() => {
          imageInstanceMedia.babylonScene?.takeSnapShot();
          imageInstanceMedia.babylonScene?.downloadSnapShot();
        }}
        filename={imageInstanceMedia.imageMedia.filename}
        mimeType={imageInstanceMedia.imageMedia.mimeType}
        fileSize={imageInstanceMedia.imageMedia.getFileSize()}
        tablePanelRef={tablePanelRef}
        positioning={positioning}
      />
    )
  );
}
