import React, { useState } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import Controls from "./Controls";
import effectIcon from "../../../public/svgs/effectIcon.svg";
import effectOffIcon from "../../../public/svgs/effectOffIcon.svg";

export default function EffectsButton({
  controls,
  effectsActive,
  setEffectsActive,
}: {
  controls: Controls;
  effectsActive: boolean;
  setEffectsActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        controls.handleEffects();
        setEffectsActive((prev) => !prev);
      }}
      contentFunction={() => {
        const iconSrc = effectsActive ? effectOffIcon : effectIcon;

        return (
          <FgSVG
            src={iconSrc}
            attributes={[
              { key: "width", value: "95%" },
              { key: "height", value: "95%" },
              { key: "fill", value: "white" },
            ]}
          />
        );
      }}
      hoverContent={
        !effectsActive ? (
          <div className='mb-4 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
            Effects
          </div>
        ) : (
          <></>
        )
      }
      className='flex items-center justify-center w-10 aspect-square relative'
    />
  );
}
