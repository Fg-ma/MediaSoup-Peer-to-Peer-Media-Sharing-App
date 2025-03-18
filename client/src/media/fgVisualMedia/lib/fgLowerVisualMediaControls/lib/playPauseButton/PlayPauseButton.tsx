import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgLowerVisualMediaController from "../FgLowerVisualMediaController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const playIcon = nginxAssetServerBaseUrl + "svgs/playIcon.svg";
const pauseIcon = nginxAssetServerBaseUrl + "svgs/pauseIcon.svg";

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
        !visualEffectsActive && !settingsActive ? (
          <FgHoverContentStandard
            content={pausedState ? "Play (k)" : "Pause (k)"}
            style='light'
          />
        ) : undefined
      }
      className='flex items-center justify-center h-full aspect-square pointer-events-auto'
    />
  );
}
