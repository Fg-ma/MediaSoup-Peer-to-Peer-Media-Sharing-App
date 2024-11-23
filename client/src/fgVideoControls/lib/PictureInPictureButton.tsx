import React, { useState } from "react";
import Controls from "./Controls";
import FgButton from "../../fgButton/FgButton";

export default function PictureInPictureButton({
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
        controls.handleMiniPlayer();
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
        !effectsActive && !settingsActive ? (
          <div className='mb-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
            Picture in picture (i)
          </div>
        ) : undefined
      }
      className='flex items-center justify-center w-10 aspect-square scale-x-[-1] pointer-events-auto'
    />
  );
}
