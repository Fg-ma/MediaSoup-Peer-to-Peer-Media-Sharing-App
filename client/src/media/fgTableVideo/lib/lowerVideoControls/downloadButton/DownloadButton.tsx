import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerVideoController from "../LowerVideoController";
import TableVideoMediaInstance from "../../../../../media/fgTableVideo/TableVideoMediaInstance";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const snapShotIcon = nginxAssetServerBaseUrl + "svgs/snapShotIcon.svg";
const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";
const recordIcon = nginxAssetServerBaseUrl + "svgs/recordIcon.svg";
const recordOffIcon = nginxAssetServerBaseUrl + "svgs/recordOffIcon.svg";

export default function DownloadButton({
  videoMediaInstance,
  recording,
  lowerVideoController,
  videoEffectsActive,
  scrollingContainerRef,
}: {
  videoMediaInstance: React.MutableRefObject<TableVideoMediaInstance>;
  recording: React.MutableRefObject<boolean>;
  lowerVideoController: React.MutableRefObject<LowerVideoController>;
  videoEffectsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={lowerVideoController.current.handleDownload}
      contentFunction={() => {
        const src =
          videoMediaInstance.current.settings.downloadType.value === "snapShot"
            ? snapShotIcon
            : videoMediaInstance.current.settings.downloadType.value ===
                "original"
              ? downloadIcon
              : recording.current
                ? recordOffIcon
                : recordIcon;

        return (
          <FgSVGElement
            src={src}
            className="flex items-center justify-center"
            attributes={[
              { key: "width", value: "85%" },
              { key: "height", value: "85%" },
              { key: "fill", value: "#f2f2f2" },
              { key: "stroke", value: "#f2f2f2" },
            ]}
          />
        );
      }}
      hoverContent={
        !videoEffectsActive ? (
          <FgHoverContentStandard
            content={
              videoMediaInstance.current.settings.downloadType.value ===
              "snapShot"
                ? "Take snap shot (d)"
                : videoMediaInstance.current.settings.downloadType.value ===
                    "original"
                  ? "Download (d)"
                  : recording.current
                    ? "Stop recording (d)"
                    : "Start recording (d)"
            }
            style="light"
          />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className="pointer-events-auto flex aspect-square h-full scale-x-[-1] items-center justify-center"
    />
  );
}
