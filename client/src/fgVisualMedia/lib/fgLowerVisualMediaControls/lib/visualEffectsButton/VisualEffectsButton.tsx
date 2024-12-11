import React from "react";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../../fgElements/fgSVG/FgSVG";
import FgLowerVisualMediaController from "../FgLowerVisualMediaController";

import effectIcon from "../../../../../../public/svgs/effectIcon.svg";
import effectOffIcon from "../../../../../../public/svgs/effectOffIcon.svg";

export default function VisualEffectsButton({
  fgLowerVisualMediaController,
  visualEffectsActive,
  settingsActive,
  scrollingContainerRef,
}: {
  fgLowerVisualMediaController: FgLowerVisualMediaController;
  visualEffectsActive: boolean;
  settingsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        fgLowerVisualMediaController.handleVisualEffects();
      }}
      contentFunction={() => {
        const iconSrc = visualEffectsActive ? effectOffIcon : effectIcon;

        return (
          <FgSVG
            src={iconSrc}
            attributes={[
              { key: "width", value: "95%" },
              { key: "height", value: "95%" },
              { key: "fill", value: "white" },
              { key: "stroke", value: "white" },
            ]}
          />
        );
      }}
      hoverContent={
        !visualEffectsActive && !settingsActive ? (
          <div className='mb-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
            Effects (e)
          </div>
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center w-10 min-w-10 aspect-square relative scale-x-[-1] pointer-events-auto'
    />
  );
}
