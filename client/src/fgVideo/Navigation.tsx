import React from "react";
import ControlsLogic from "../fgVideoControls/lib/Controls";
import closeIcon from "../../public/svgs/close.svg";

export default function Navigation({
  name,
  username,
  isClose,
  controls,
}: {
  name: string | undefined;
  username: string;
  isClose: boolean;
  controls: ControlsLogic;
}) {
  return (
    <div className='video-navigation-container absolute top-0 w-full h-10 flex items-center justify-center z-20 space-x-2 pl-4 pr-1.5 pt-0.5'>
      <div className='grow text-lg cursor-pointer'>
        {name ? name : username}
      </div>
      {isClose && (
        <button
          onClick={() => controls.handleCloseVideo()}
          className='flex items-center justify-center w-10 aspect-square'
        >
          <img
            src={closeIcon}
            alt='icon'
            style={{ width: "95%", height: "95%" }}
          />
        </button>
      )}
    </div>
  );
}
