import React, { useState } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import Controls from "./Controls";
import playIcon from "../../../public/svgs/playIcon.svg";
import pauseIcon from "../../../public/svgs/pauseIcon.svg";

export default function PlayPauseButton({
  controls,
  effectsActive,
  settingsActive,
}: {
  controls: Controls;
  effectsActive: boolean;
  settingsActive: boolean;
}) {
  const [active, setActive] = useState(true);

  return (
    <FgButton
      clickFunction={() => {
        controls.handlePausePlay();
        setActive((prev) => !prev);
      }}
      contentFunction={() => {
        const iconSrc = active ? pauseIcon : playIcon;

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
            {active ? "Pause (k)" : "Play (k)"}
          </div>
        ) : undefined
      }
      className='flex items-center justify-center w-10 aspect-square'
    />
  );
}
