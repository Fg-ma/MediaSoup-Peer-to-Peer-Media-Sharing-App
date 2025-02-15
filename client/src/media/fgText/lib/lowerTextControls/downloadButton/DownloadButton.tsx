import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerTextController from "../LowerTextController";
import { Settings } from "../../typeConstant";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const snapShotIcon = nginxAssetSeverBaseUrl + "svgs/snapShotIcon.svg";
const downloadIcon = nginxAssetSeverBaseUrl + "svgs/downloadIcon.svg";
const recordIcon = nginxAssetSeverBaseUrl + "svgs/recordIcon.svg";
const recordOffIcon = nginxAssetSeverBaseUrl + "svgs/recordOffIcon.svg";

export default function DownloadButton({
  settings,
  recording,
  lowerTextController,
  textEffectsActive,
  scrollingContainerRef,
}: {
  settings: Settings;
  recording: React.MutableRefObject<boolean>;
  lowerTextController: LowerTextController;
  textEffectsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        lowerTextController.handleDownload();
      }}
      contentFunction={() => {
        const src =
          settings.downloadType.value === "snapShot"
            ? snapShotIcon
            : settings.downloadType.value === "original"
            ? downloadIcon
            : recording.current
            ? recordOffIcon
            : recordIcon;

        return (
          <FgSVG
            src={src}
            attributes={[
              { key: "width", value: "85%" },
              { key: "height", value: "85%" },
              { key: "fill", value: "white" },
              { key: "stroke", value: "white" },
            ]}
          />
        );
      }}
      hoverContent={
        !textEffectsActive ? (
          <FgHoverContentStandard
            content={
              settings.downloadType.value === "snapShot"
                ? "Take snap shot (d)"
                : settings.downloadType.value === "original"
                ? "Download (d)"
                : recording.current
                ? "Stop recording (d)"
                : "Start recording (d)"
            }
            style='dark'
          />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center h-full aspect-square scale-x-[-1] pointer-events-auto'
    />
  );
}
