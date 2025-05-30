import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerSvgController from "../LowerSvgController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";

export default function DownloadButton({
  settingsActive,
  svgEffectsActive,
  lowerSvgController,
  scrollingContainerRef,
}: {
  settingsActive: boolean;
  svgEffectsActive: boolean;
  lowerSvgController: React.MutableRefObject<LowerSvgController>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        lowerSvgController.current.handleDownload();
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
        !settingsActive && !svgEffectsActive ? (
          <FgHoverContentStandard content="Download (d)" style="light" />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className="pointer-events-auto flex aspect-square h-full scale-x-[-1] items-center justify-center"
    />
  );
}
