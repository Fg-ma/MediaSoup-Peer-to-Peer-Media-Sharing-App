import React, { useState } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgLowerVisualMediaController from "../FgLowerVisualMediaController";

export default function PictureInPictureButton({
  fgLowerVisualMediaController,
  visualEffectsActive,
  settingsActive,
  scrollingContainerRef,
}: {
  fgLowerVisualMediaController: React.MutableRefObject<FgLowerVisualMediaController>;
  visualEffectsActive: boolean;
  settingsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const [active, setActive] = useState(false);

  return (
    <FgButton
      clickFunction={() => {
        fgLowerVisualMediaController.current.handleMiniPlayer();
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
        !visualEffectsActive && !settingsActive ? (
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
