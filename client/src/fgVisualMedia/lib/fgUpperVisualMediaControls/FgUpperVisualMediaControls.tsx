import React, { Suspense } from "react";
import FgLowerVisualMediaController from "../fgLowerVisualMediaControls/lib/FgLowerVisualMediaController";

const CloseButton = React.lazy(() => import("./lib/closeButton/CloseButton"));

export default function FgUpperVisualMediaControls({
  name,
  username,
  isClose,
  fgLowerVisualMediaController,
}: {
  name: string | undefined;
  username: string;
  isClose: boolean;
  fgLowerVisualMediaController: FgLowerVisualMediaController;
}) {
  return (
    <div className='video-navigation-container absolute top-0 w-full h-10 flex items-center justify-center z-20 space-x-2'>
      <div className='grow text-lg cursor-default select-none'>
        {name ? name : username}
      </div>
      {isClose && (
        <Suspense fallback={<div>Loading...</div>}>
          <CloseButton
            fgLowerVisualMediaController={fgLowerVisualMediaController}
          />
        </Suspense>
      )}
    </div>
  );
}
