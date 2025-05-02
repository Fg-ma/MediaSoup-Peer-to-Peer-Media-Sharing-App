import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerImageController from "../LowerImageController";
import { Settings } from "../../typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const snapShotIcon = nginxAssetServerBaseUrl + "svgs/snapShotIcon.svg";
const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";
const recordIcon = nginxAssetServerBaseUrl + "svgs/recordIcon.svg";
const recordOffIcon = nginxAssetServerBaseUrl + "svgs/recordOffIcon.svg";

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
  lowerImageController: React.MutableRefObject<LowerImageController>;
  imageEffectsActive: boolean;
  settingsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        lowerImageController.current.handleDownload();
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
          <FgSVGElement
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
            style="light"
          />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className="pointer-events-auto flex aspect-square h-full scale-x-[-1] items-center justify-center"
    />
  );
}
