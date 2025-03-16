import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerVideoController from "../LowerVideoController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const playIcon = nginxAssetServerBaseUrl + "svgs/playIcon.svg";
const pauseIcon = nginxAssetServerBaseUrl + "svgs/pauseIcon.svg";

export default function PlayPauseButton({
  lowerVideoController,
  videoEffectsActive,
  settingsActive,
  pausedState,
}: {
  lowerVideoController: LowerVideoController;
  videoEffectsActive: boolean;
  settingsActive: boolean;
  pausedState: boolean;
}) {
  return (
    <FgButton
      clickFunction={() => {
        lowerVideoController.handlePausePlay();
      }}
      contentFunction={() => {
        const iconSrc = pausedState ? playIcon : pauseIcon;

        return (
          <FgSVGElement
            src={iconSrc}
            className='flex items-center justify-center'
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
            content={pausedState ? "Play (k)" : "Pause (k)"}
            style='dark'
          />
        ) : undefined
      }
      className='flex items-center justify-center h-full aspect-square pointer-events-auto'
    />
  );
}
