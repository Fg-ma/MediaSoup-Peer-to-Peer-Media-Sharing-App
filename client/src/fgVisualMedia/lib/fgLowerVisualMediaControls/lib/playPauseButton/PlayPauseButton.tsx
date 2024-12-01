import React from "react";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../../fgElements/fgSVG/FgSVG";
import FgLowerVisualMediaController from "../FgLowerVisualMediaController";

import playIcon from "../../../../../../public/svgs/playIcon.svg";
import pauseIcon from "../../../../../../public/svgs/pauseIcon.svg";

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
          <div className='mb-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
            {pausedState ? "Play (k)" : "Pause (k)"}
          </div>
        ) : undefined
      }
      className='flex items-center justify-center w-10 aspect-square pointer-events-auto'
    />
  );
}
