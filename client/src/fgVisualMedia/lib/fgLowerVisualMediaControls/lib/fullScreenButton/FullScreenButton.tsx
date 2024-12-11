import React, { useState } from "react";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../../fgElements/fgSVG/FgSVG";
import FgLowerVisualMediaController from "../FgLowerVisualMediaController";

import fullScreenIcon from "../../../../../../public/svgs/fullScreenIcon.svg";
import fullScreenOffIcon from "../../../../../../public/svgs/fullScreenOffIcon.svg";

export default function FullScreenButton({
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
        fgLowerVisualMediaController.handleFullScreen();
        setActive((prev) => !prev);
      }}
      contentFunction={() => {
        const iconSrc = active ? fullScreenOffIcon : fullScreenIcon;

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
            Full screen (f)
          </div>
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center w-10 aspect-square scale-x-[-1] pointer-events-auto'
    />
  );
}
