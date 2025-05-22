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
  const { userMedia } = useMediaContext();
  const { addGroupSignalListener, removeGroupSignalListener } =
    useSignalContext();

  const videoInstanceMedia = userMedia.current.video.tableInstances[instanceId];
  const positioning = videoInstanceMedia?.getPositioning();

  const [largestDim, setLargestDim] = useState<"width" | "height">("width");
  const [loadingState, setLoadingState] = useState<LoadingStateTypes>(
    videoInstanceMedia?.videoMedia.loadingState,
  );
  const [_, setRerender] = useState(false);
  const mirrorCanvasRef = useRef<HTMLCanvasElement>(null);

  const videoSelectionController = new VideoSelectionController(
    instanceId,
    videoInstanceMedia,
    setLoadingState,
    setLargestDim,
    mirrorCanvasRef,
    setRerender,
  );

  useEffect(() => {
    videoSelectionController.drawInstanceCanvas();

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
    if (loadingState === "downloaded") {
      videoSelectionController.drawInstanceCanvas();
    }
  }, [loadingState]);

  return (
    videoInstanceMedia && (
      <GeneralMediaSelection
        contentId={videoInstanceMedia.videoMedia.videoId}
        instanceId={instanceId}
        contentType="video"
        selectionContent={
          loadingState === "downloaded" ? (
            <canvas
              ref={mirrorCanvasRef}
              className={`${largestDim === "width" ? "w-full max-w-[12rem]" : "h-full max-h-[12rem]"} overflow-hidden rounded-md`}
            ></canvas>
          ) : loadingState === "downloading" ? (
            <LoadingElement
              className="h-[12rem] w-full rounded-md"
              pauseDownload={videoInstanceMedia.videoMedia.downloader?.pause}
            />
          ) : loadingState === "failed" ? (
            <DownloadFailed
              className="h-[12rem] w-full rounded-md"
              onClick={videoInstanceMedia.videoMedia.retryDownload}
            />
          ) : loadingState === "paused" ? (
            <DownloadPaused
              className="h-[12rem] w-full rounded-md"
              onClick={videoInstanceMedia.videoMedia.downloader?.resume}
            />
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
        fileSize={videoInstanceMedia.videoMedia.getFileSize()}
        tablePanelRef={tablePanelRef}
        positioning={positioning}
      />
    )
  );
}
