import React, { Suspense } from "react";
import ControlsLogic from "../fgVideoControls/lib/Controls";

const CloseButton = React.lazy(() => import("./lib/CloseButton"));

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
    <div className='video-navigation-container absolute top-0 w-full h-10 flex items-center justify-center z-20 space-x-2'>
      <div className='grow text-lg cursor-default select-none'>
        {name ? name : username}
      </div>
      {isClose && (
        <Suspense fallback={<div>Loading...</div>}>
          <CloseButton controls={controls} />
        </Suspense>
      )}
    </div>
  );
}
