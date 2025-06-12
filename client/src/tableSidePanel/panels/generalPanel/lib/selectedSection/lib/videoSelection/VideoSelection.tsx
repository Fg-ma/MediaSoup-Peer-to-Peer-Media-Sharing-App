import React, { useEffect, useRef, useState } from "react";
import { useSignalContext } from "../../../../../../../context/signalContext/SignalContext";
import { useMediaContext } from "../../../../../../../context/mediaContext/MediaContext";
import VideoEffectsSection from "./lib/VideoEffectsSection";
import GeneralMediaSelection from "../GeneralMediaSelection";
import LoadingElement from "../../../../../../../elements/loadingElement/LoadingElement";
import DownloadFailed from "../../../../../../../elements/downloadFailed/DownloadFailed";
import DownloadPaused from "../../../../../../../elements/downloadPaused/DownloadPaused";
import { LoadingStateTypes } from "../../../../../../../../../universal/contentTypeConstant";
import VideoSelectionController from "./lib/VideoSelectionController";

export default function VideoSelection({
  instanceId,
  tablePanelRef,
}: {
  instanceId: string;
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { staticContentMedia } = useMediaContext();
  const { addGroupSignalListener, removeGroupSignalListener } =
    useSignalContext();

  const videoInstanceMedia =
    staticContentMedia.current.video.tableInstances[instanceId];
  const positioning = videoInstanceMedia?.getPositioning();

  const [largestDim, setLargestDim] = useState<"width" | "height">("width");
  const [loadingState, setLoadingState] = useState<LoadingStateTypes>(
    videoInstanceMedia?.videoMedia.loadingState,
  );
  const [_, setRerender] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const videoSelectionController = new VideoSelectionController(
    instanceId,
    setLoadingState,
    setRerender,
  );

  useEffect(() => {
    videoInstanceMedia?.videoMedia.addVideoListener(
      videoSelectionController.handleVideoMessages,
    );

    addGroupSignalListener(videoSelectionController.handleGroupSignal);

    return () => {
      videoInstanceMedia?.videoMedia.removeVideoListener(
        videoSelectionController.handleVideoMessages,
      );
      removeGroupSignalListener(videoSelectionController.handleGroupSignal);
    };
  }, []);

  useEffect(() => {
    if (loadingState !== "downloaded" || !imageContainerRef.current) return;

    if ((videoInstanceMedia.videoMedia.aspect ?? 0) > 1) {
      setLargestDim("width");
    } else {
      setLargestDim("height");
    }

    const thumbnailClone = videoInstanceMedia.videoMedia.thumbnail.cloneNode(
      true,
    ) as HTMLImageElement;

    const container = imageContainerRef.current;
    container.appendChild(thumbnailClone);

    return () => {
      if (thumbnailClone && container.contains(thumbnailClone)) {
        container.removeChild(thumbnailClone);
      }
    };
  }, [loadingState]);

  return (
    videoInstanceMedia && (
      <GeneralMediaSelection
        contentId={videoInstanceMedia.videoMedia.videoId}
        instanceId={instanceId}
        contentType="video"
        selectionContent={
          loadingState === "downloaded" ? (
            <div
              ref={imageContainerRef}
              className={`${largestDim === "width" ? "w-full max-w-[12rem]" : "h-full max-h-[12rem]"} !w-auto overflow-hidden rounded-md object-contain`}
            ></div>
          ) : loadingState === "downloading" ? (
            <LoadingElement className="h-[12rem] w-full rounded-md" />
          ) : (
            <></>
          )
        }
        effectsSection={
          <VideoEffectsSection
            videoInstanceId={instanceId}
            videoMediaInstance={videoInstanceMedia}
          />
        }
        downloadFunction={
          loadingState === "downloaded"
            ? videoInstanceMedia.videoMedia.downloadVideo
            : undefined
        }
        filename={videoInstanceMedia.videoMedia.filename}
        mimeType={videoInstanceMedia.videoMedia.mimeType}
        tablePanelRef={tablePanelRef}
        positioning={positioning}
      />
    )
  );
}
