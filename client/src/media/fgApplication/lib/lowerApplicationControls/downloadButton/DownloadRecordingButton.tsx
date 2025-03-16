import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerApplicationController from "../LowerApplicationController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";

export default function DownloadRecordingButton({
  lowerApplicationController,
  applicationEffectsActive,
  scrollingContainerRef,
}: {
  lowerApplicationController: LowerApplicationController;
  applicationEffectsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        lowerApplicationController.handleDownloadRecording();
      }}
      contentFunction={() => (
        <FgSVGElement
          src={downloadIcon}
          attributes={[
            { key: "width", value: "85%" },
            { key: "height", value: "85%" },
            { key: "fill", value: "#f2f2f2" },
            { key: "stroke", value: "#f2f2f2" },
          ]}
        />
      )}
      hoverContent={
        !applicationEffectsActive ? (
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
