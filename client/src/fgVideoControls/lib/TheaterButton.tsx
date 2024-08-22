import React, { useState } from "react";
import Controls from "./Controls";
import FgButton from "../../fgButton/FgButton";

export default function TheaterButton({
  controls,
  effectsActive,
}: {
  controls: Controls;
  effectsActive: boolean;
}) {
  const [active, setActive] = useState(false);

  return (
    <FgButton
      clickFunction={() => {
        controls.handleTheater();
        setActive((prev) => !prev);
      }}
      contentFunction={() => {
        return active ? (
          <div className='h-9 w-9 flex items-center justify-center'>
            <div className='border-3 border-white w-8 h-4 rounded-md'></div>
          </div>
        ) : (
          <div className='h-9 w-9 flex items-center justify-center'>
            <div className='border-3 border-white w-8 h-6 rounded-md'></div>
          </div>
        );
      }}
      hoverContent={
        !effectsActive ? (
          <div className='mb-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
            Theater (t)
          </div>
        ) : undefined
      }
      className='flex items-center justify-center scale-x-[-1]'
    />
  );
}
