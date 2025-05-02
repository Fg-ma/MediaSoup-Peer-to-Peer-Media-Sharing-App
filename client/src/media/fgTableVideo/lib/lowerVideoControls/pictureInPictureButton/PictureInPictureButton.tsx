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
  lowerVideoController: React.MutableRefObject<LowerVideoController>;
  videoEffectsActive: boolean;
  settingsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const [active, setActive] = useState(false);

  return (
    <FgButton
      clickFunction={() => {
        lowerVideoController.current.handleMiniPlayer();
        setActive((prev) => !prev);
      }}
      contentFunction={() => {
        return (
          <div className="flex aspect-square h-[90%] items-center justify-center">
            <div
              className={`flex h-[65%] w-[80%] rounded-md border-3 border-white ${
                active ? "items-start justify-start" : "items-end justify-end"
              }`}
            >
              <div
                className={`h-[50%] w-[60%] rounded-sm bg-white ${
                  active ? "ml-[10%] mt-[10%]" : "mb-[10%] mr-[10%]"
                }`}
              ></div>
            </div>
          </div>
        );
      }}
      hoverContent={
        !videoEffectsActive && !settingsActive ? (
          <FgHoverContentStandard
            content="Picture in picture (i)"
            style="light"
          />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className="pointer-events-auto flex aspect-square h-full scale-x-[-1] items-center justify-center"
    />
  );
}
