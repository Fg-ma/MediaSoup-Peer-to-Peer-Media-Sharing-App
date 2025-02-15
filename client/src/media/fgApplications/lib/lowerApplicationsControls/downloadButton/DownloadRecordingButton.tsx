import React from "react";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import LowerApplicationsController from "../LowerApplicationsController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetSeverBaseUrl + "svgs/downloadIcon.svg";

export default function DownloadRecordingButton({
  lowerApplicationsController,
  applicationsEffectsActive,
  scrollingContainerRef,
}: {
  lowerApplicationsController: LowerApplicationsController;
  applicationsEffectsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        lowerApplicationsController.handleDownloadRecording();
      }}
      contentFunction={() => (
        <FgSVG
          src={downloadIcon}
          attributes={[
            { key: "width", value: "85%" },
            { key: "height", value: "85%" },
            { key: "fill", value: "white" },
            { key: "stroke", value: "white" },
          ]}
        />
      )}
      hoverContent={
        !applicationsEffectsActive ? (
          <FgHoverContentStandard
            content='Download recording (h)'
            style='dark'
          />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center h-full aspect-square scale-x-[-1] pointer-events-auto'
    />
  );
}
