import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../../../context/mediaContext/MediaContext";
import VideoEffectsSection from "./lib/VideoEffectsSection";
import GeneralMediaSelection from "../GeneralMediaSelection";
import LoadingElement from "../../../../../../../elements/loadingElement/LoadingElement";
import DownloadFailed from "../../../../../../../elements/downloadFailed/DownloadFailed";
import DownloadPaused from "../../../../../../../elements/downloadPaused/DownloadPaused";
import { LoadingStateTypes } from "../../../../../../../../../universal/contentTypeConstant";
import VideoSelectionController from "./lib/VideoSelectionController";
import { set } from "lodash";

export default function VideoSelection({
  contentId,
  tablePanelRef,
}: {
  contentId: string;
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();

  const videoInstanceMedia = userMedia.current.video.tableInstances[contentId];
  const positioning = videoInstanceMedia?.getPositioning();

  const [largestDim, setLargestDim] = useState<"width" | "height">("width");
  const [loadingState, setLoadingState] = useState<LoadingStateTypes>(
    videoInstanceMedia?.videoMedia.loadingState,
  );
  const mirrorCanvasRef = useRef<HTMLCanvasElement>(null);

  const videoSelectionController = new VideoSelectionController(
    videoInstanceMedia,
    setLoadingState,
    setLargestDim,
    mirrorCanvasRef,
  );

  useEffect(() => {
    videoSelectionController.drawInstanceCanvas();

    videoInstanceMedia?.videoMedia.addVideoListener(
      videoSelectionController.handleVideoMessages,
    );

    return () => {
      videoInstanceMedia?.videoMedia.removeVideoListener(
        videoSelectionController.handleVideoMessages,
      );
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
        contentId={contentId}
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
            videoInstanceId={contentId}
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
