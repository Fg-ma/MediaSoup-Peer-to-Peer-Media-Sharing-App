import React, { useState } from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerVideoController from "../LowerVideoController";

export default function PictureInPictureButton({
  lowerVideoController,
  videoEffectsActive,
  settingsActive,
  scrollingContainerRef,
}: {
  lowerVideoController: LowerVideoController;
  videoEffectsActive: boolean;
  settingsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const [active, setActive] = useState(false);

  return (
    <FgButton
      clickFunction={() => {
        lowerVideoController.handleMiniPlayer();
        setActive((prev) => !prev);
      }}
      contentFunction={() => {
        return (
          <div className='flex h-[90%] aspect-square items-center justify-center'>
            <div
              className={`border-3 border-white w-[80%] h-[65%] rounded-md flex ${
                active ? "justify-start items-start" : "justify-end items-end"
              }`}
            >
              <div
                className={`bg-white w-[60%] h-[50%] rounded-sm ${
                  active ? "ml-[10%] mt-[10%]" : "mr-[10%] mb-[10%]"
                }`}
              ></div>
            </div>
          </div>
        );
      }}
      hoverContent={
        !videoEffectsActive && !settingsActive ? (
          <FgHoverContentStandard
            content='Picture in picture (i)'
            style='dark'
          />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center h-full aspect-square scale-x-[-1] pointer-events-auto'
    />
  );
}
