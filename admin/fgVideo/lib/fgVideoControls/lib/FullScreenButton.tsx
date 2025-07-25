import React, { useState } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import Controls from "./Controls";
import fullScreenIcon from "../../../public/svgs/fullScreenIcon.svg";
import fullScreenOffIcon from "../../../public/svgs/fullScreenOffIcon.svg";

export default function FullScreenButton({
  controls,
  effectsActive,
  settingsActive,
}: {
  controls: Controls;
  effectsActive: boolean;
  settingsActive: boolean;
}) {
  const [active, setActive] = useState(false);

  return (
    <FgButton
      clickFunction={() => {
        controls.handleFullScreen();
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
        !effectsActive && !settingsActive ? (
          <div className='mb-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
            Full screen (f)
          </div>
        ) : undefined
      }
      className='flex items-center justify-center w-10 aspect-square scale-x-[-1]'
    />
  );
}
