import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import TableVideoMediaInstance from "../../../../../media/fgTableVideo/TableVideoMediaInstance";
import LowerVideoController from "../LowerVideoController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const playIcon = nginxAssetServerBaseUrl + "svgs/playIcon.svg";
const pauseIcon = nginxAssetServerBaseUrl + "svgs/pauseIcon.svg";

export default function PlayPauseButton({
  videoMediaInstance,
  lowerVideoController,
  videoEffectsActive,
  settingsActive,
}: {
  videoMediaInstance: React.MutableRefObject<TableVideoMediaInstance>;
  lowerVideoController: React.MutableRefObject<LowerVideoController>;
  videoEffectsActive: boolean;
  settingsActive: boolean;
}) {
  return (
    <FgButton
      clickFunction={lowerVideoController.current.handlePausePlay}
      contentFunction={() => {
        const iconSrc = videoMediaInstance.current.meta.isPlaying
          ? pauseIcon
          : playIcon;

        return (
          <FgSVGElement
            src={iconSrc}
            className="flex items-center justify-center"
            attributes={[
              { key: "width", value: "85%" },
              { key: "height", value: "85%" },
              { key: "fill", value: "#f2f2f2" },
            ]}
          />
        );
      }}
      hoverContent={
        !videoEffectsActive && !settingsActive ? (
          <FgHoverContentStandard
            content={
              videoMediaInstance.current.meta.isPlaying
                ? "Pause (k)"
                : "Play (k)"
            }
            style="light"
          />
        ) : undefined
      }
      className="pointer-events-auto flex aspect-square h-full items-center justify-center"
    />
  );
}
