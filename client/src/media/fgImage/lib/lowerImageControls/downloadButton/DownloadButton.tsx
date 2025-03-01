import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerImageController from "../LowerImageController";
import { Settings } from "../../typeConstant";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const snapShotIcon = nginxAssetSeverBaseUrl + "svgs/snapShotIcon.svg";
const downloadIcon = nginxAssetSeverBaseUrl + "svgs/downloadIcon.svg";
const recordIcon = nginxAssetSeverBaseUrl + "svgs/recordIcon.svg";
const recordOffIcon = nginxAssetSeverBaseUrl + "svgs/recordOffIcon.svg";

export default function DownloadButton({
  settings,
  recording,
  lowerImageController,
  imageEffectsActive,
  settingsActive,
  scrollingContainerRef,
}: {
  settings: Settings;
  recording: React.MutableRefObject<boolean>;
  lowerImageController: LowerImageController;
  imageEffectsActive: boolean;
  settingsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        lowerImageController.handleDownload();
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
              { key: "fill", value: "#f2f2f2" },
              { key: "stroke", value: "#f2f2f2" },
            ]}
          />
        );
      }}
      hoverContent={
        !imageEffectsActive && !settingsActive ? (
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
