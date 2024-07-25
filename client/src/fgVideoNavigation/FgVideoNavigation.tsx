import React from "react";
import ControlsLogic from "../fgVideoControls/lib/Controls";
import CloseButton from "./lib/CloseButton";

export default function FgVideoNavigation({
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
      <div className='grow text-lg cursor-default select-none'>
        {name ? name : username}
      </div>
      {isClose && <CloseButton controls={controls} />}
    </div>
  );
}
