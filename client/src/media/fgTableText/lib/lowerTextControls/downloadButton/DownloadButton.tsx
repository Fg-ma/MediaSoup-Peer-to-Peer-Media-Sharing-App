import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerTextController from "../LowerTextController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";

export default function DownloadButton({
  settingsActive,
  lowerTextController,
  scrollingContainerRef,
}: {
  settingsActive: boolean;
  lowerTextController: React.MutableRefObject<LowerTextController>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        lowerTextController.current.handleDownload();
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
        !settingsActive ? (
          <FgHoverContentStandard content="Download (d)" style="light" />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className="pointer-events-auto flex aspect-square h-full scale-x-[-1] items-center justify-center"
    />
  );
}
