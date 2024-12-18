import React, { useState } from "react";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import FgLowerVisualMediaController from "../FgLowerVisualMediaController";

export default function PictureInPictureButton({
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
  const [active, setActive] = useState(false);

  return (
    <FgButton
      clickFunction={() => {
        fgLowerVisualMediaController.handleMiniPlayer();
        setActive((prev) => !prev);
      }}
      contentFunction={() => {
        return active ? (
          <div className='h-9 w-9 flex items-center justify-center'>
            <div className='border-3 border-white w-8 h-6.5 rounded-md flex justify-start items-start'>
              <div className='bg-white w-3 h-2 rounded-sm ml-0.5 mt-0.5'></div>
            </div>
          </div>
        ) : (
          <div className='h-9 w-9 flex items-center justify-center'>
            <div className='border-3 border-white w-8 h-6.5 rounded-md flex justify-end items-end'>
              <div className='bg-white w-3 h-2 rounded-sm mr-0.5 mb-0.5'></div>
            </div>
          </div>
        );
      }}
      hoverContent={
        !visualEffectsActive && !settingsActive ? (
          <FgHoverContentStandard
            content='Picture in picture (i)'
            style='dark'
          />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center w-10 aspect-square scale-x-[-1] pointer-events-auto'
    />
  );
}
