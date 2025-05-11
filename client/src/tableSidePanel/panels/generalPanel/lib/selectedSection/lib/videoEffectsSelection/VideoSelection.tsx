import React, { useRef } from "react";
import { useMediaContext } from "../../../../../../../context/mediaContext/MediaContext";
import VideoEffectsSection from "./lib/VideoEffectsSection";
import GeneralMediaSelection from "../GeneralMediaSelection";

export default function VideoSelection({
  contentId,
  tablePanelRef,
}: {
  contentId: string;
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();

  const videoInstanceMedia = userMedia.current.video.tableInstances[contentId];
  const positioning = videoInstanceMedia.getPositioning();

  return (
    <GeneralMediaSelection
      contentId={contentId}
      contentType="video"
      selectionContent={<div></div>}
      effectsSection={
        <VideoEffectsSection
          videoInstanceId={contentId}
          videoMediaInstance={videoInstanceMedia}
        />
      }
      downloadFunction={videoInstanceMedia.videoMedia.downloadVideo}
      filename={videoInstanceMedia.videoMedia.filename}
      mimeType={videoInstanceMedia.videoMedia.mimeType}
      fileSize={videoInstanceMedia.videoMedia.getFileSize()}
      tablePanelRef={tablePanelRef}
      positioning={positioning}
    />
  );
}
