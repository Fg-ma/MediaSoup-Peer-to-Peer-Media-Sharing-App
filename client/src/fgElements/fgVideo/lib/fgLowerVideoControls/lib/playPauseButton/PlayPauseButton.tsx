import React from "react";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import FgLowerVisualMediaController from "../FgLowerVideoController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const playIcon = nginxAssetSeverBaseUrl + "svgs/playIcon.svg";
const pauseIcon = nginxAssetSeverBaseUrl + "svgs/pauseIcon.svg";

export default function PlayPauseButton({
  fgLowerVisualMediaController,
  visualEffectsActive,
  settingsActive,
  pausedState,
}: {
  fgLowerVisualMediaController: FgLowerVisualMediaController;
  visualEffectsActive: boolean;
  settingsActive: boolean;
  pausedState: boolean;
}) {
  return (
    <FgButton
      clickFunction={() => {
        fgLowerVisualMediaController.handlePausePlay();
      }}
      contentFunction={() => {
        const iconSrc = pausedState ? playIcon : pauseIcon;

        return (
          <FgSVG
            src={iconSrc}
            attributes={[
              { key: "width", value: "36px" },
              { key: "height", value: "36px" },
              { key: "fill", value: "white" },
            ]}
          />
        );
      }}
      hoverContent={
        !visualEffectsActive && !settingsActive ? (
          <FgHoverContentStandard
            content={pausedState ? "Play (k)" : "Pause (k)"}
            style='dark'
          />
        ) : undefined
      }
      className='flex items-center justify-center w-10 aspect-square pointer-events-auto'
    />
  );
}
