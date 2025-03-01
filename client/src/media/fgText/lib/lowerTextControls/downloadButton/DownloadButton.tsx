import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerTextController from "../LowerTextController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetSeverBaseUrl + "svgs/downloadIcon.svg";

export default function DownloadButton({
  settingsActive,
  lowerTextController,
  scrollingContainerRef,
}: {
  settingsActive: boolean;
  lowerTextController: LowerTextController;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        lowerTextController.handleDownload();
      }}
      contentFunction={() => (
        <FgSVG
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
        !settingsActive ? (
          <FgHoverContentStandard content='Download (d)' style='dark' />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center h-full aspect-square scale-x-[-1] pointer-events-auto'
    />
  );
}
