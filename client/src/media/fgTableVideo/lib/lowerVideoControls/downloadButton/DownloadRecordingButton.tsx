import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerVideoController from "../LowerVideoController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";

export default function DownloadRecordingButton({
  lowerVideoController,
  videoEffectsActive,
  scrollingContainerRef,
}: {
  lowerVideoController: React.MutableRefObject<LowerVideoController>;
  videoEffectsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={lowerVideoController.current.handleDownloadRecording}
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
        !videoEffectsActive ? (
          <FgHoverContentStandard
            content="Download recording (j)"
            style="light"
          />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className="pointer-events-auto flex aspect-square h-full scale-x-[-1] items-center justify-center"
    />
  );
}
