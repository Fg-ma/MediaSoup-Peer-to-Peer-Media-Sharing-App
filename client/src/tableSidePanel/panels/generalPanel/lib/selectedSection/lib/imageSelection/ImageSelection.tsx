import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../../../context/mediaContext/MediaContext";
import { useSignalContext } from "../../../../../../../context/signalContext/SignalContext";
import ImageEffectsSection from "./lib/ImageEffectsSection";
import GeneralMediaSelection from "../GeneralMediaSelection";
import LoadingElement from "../../../../../../../elements/loadingElement/LoadingElement";
import DownloadFailed from "../../../../../../../elements/downloadFailed/DownloadFailed";
import DownloadPaused from "../../../../../../../elements/downloadPaused/DownloadPaused";
import ImageSelectionController from "./lib/ImageSelectionController";
import { LoadingStateTypes } from "../../../../../../../../../universal/contentTypeConstant";

export default function ImageSelection({
  instanceId,
  tablePanelRef,
}: {
  instanceId: string;
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { staticContentMedia } = useMediaContext();
  const { addGroupSignalListener, removeGroupSignalListener } =
    useSignalContext();

  const imageInstanceMedia =
    staticContentMedia.current.image.tableInstances[instanceId];
  const positioning = imageInstanceMedia?.getPositioning();

  const [largestDim, setLargestDim] = useState<"width" | "height">("width");
  const [loadingState, setLoadingState] = useState<LoadingStateTypes>(
    imageInstanceMedia?.imageMedia.loadingState,
  );
  const [_, setRerender] = useState(false);
  const mirrorCanvasRef = useRef<HTMLCanvasElement>(null);

  const imageSelectionController = new ImageSelectionController(
    instanceId,
    imageInstanceMedia,
    mirrorCanvasRef,
    setLargestDim,
    setLoadingState,
    setRerender,
  );

  useEffect(() => {
    imageSelectionController.drawInstanceCanvas();

    imageInstanceMedia?.addImageInstanceListener(
      imageSelectionController.handleInstanceEvents,
    );
    imageInstanceMedia?.imageMedia.addImageListener(
      imageSelectionController.handleImageMessages,
    );

    addGroupSignalListener(imageSelectionController.handleGroupSignal);

    return () => {
      imageInstanceMedia?.removeImageInstanceListener(
        imageSelectionController.handleInstanceEvents,
      );
      imageInstanceMedia?.imageMedia.removeImageListener(
        imageSelectionController.handleImageMessages,
      );
      removeGroupSignalListener(imageSelectionController.handleGroupSignal);
    };
  }, []);

  useEffect(() => {
    if (loadingState === "downloaded") {
      imageSelectionController.drawInstanceCanvas();
    }
  }, [loadingState]);

  return (
    imageInstanceMedia && (
      <GeneralMediaSelection
        contentId={imageInstanceMedia.imageMedia.imageId}
        instanceId={instanceId}
        contentType="image"
        selectionContent={
          loadingState === "downloaded" ? (
            <canvas
              ref={mirrorCanvasRef}
              className={`${largestDim === "width" ? "w-full max-w-[12rem]" : "h-full max-h-[12rem]"} overflow-hidden rounded-md`}
            ></canvas>
          ) : loadingState === "downloading" ? (
            <LoadingElement
              className="h-[12rem] w-full rounded-md"
              pauseDownload={imageInstanceMedia.imageMedia.downloader?.pause}
            />
          ) : loadingState === "failed" ? (
            <DownloadFailed
              className="h-[12rem] w-full rounded-md"
              onClick={imageInstanceMedia.imageMedia.retryDownload}
            />
          ) : loadingState === "paused" ? (
            <DownloadPaused
              className="h-[12rem] w-full rounded-md"
              onClick={imageInstanceMedia.imageMedia.downloader?.resume}
            />
          ) : (
            <></>
          )
        }
        effectsSection={
          <ImageEffectsSection
            imageInstanceId={instanceId}
            imageMediaInstance={imageInstanceMedia}
          />
        }
        downloadFunction={
          loadingState === "downloaded"
            ? imageInstanceMedia.babylonScene?.downloadSnapShot
            : undefined
        }
        filename={imageInstanceMedia.imageMedia.filename}
        mimeType={imageInstanceMedia.imageMedia.mimeType}
        fileSize={imageInstanceMedia.imageMedia.getFileSize()}
        tablePanelRef={tablePanelRef}
        positioning={positioning}
      />
    )
  );
}
