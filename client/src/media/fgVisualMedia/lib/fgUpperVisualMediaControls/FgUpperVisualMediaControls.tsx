import React, { Suspense } from "react";
import FgLowerVisualMediaController from "../fgLowerVisualMediaControls/lib/FgLowerVisualMediaController";
import { FgVisualMediaOptions } from "../typeConstant";

const CloseButton = React.lazy(() => import("./lib/closeButton/CloseButton"));

export default function FgUpperVisualMediaControls({
  name,
  username,
  fgVisualMediaOptions,
  fgLowerVisualMediaController,
}: {
  name: string | undefined;
  username: string;
  fgVisualMediaOptions: FgVisualMediaOptions;
  fgLowerVisualMediaController: FgLowerVisualMediaController;
}) {
  return (
    <div className='visual-media-upper-controls absolute top-0 w-full h-10 flex items-center justify-center z-20 space-x-2'>
      <div className='grow text-lg cursor-default select-none'>
        {name ? name : username}
      </div>
      {(fgVisualMediaOptions.isUser ||
        fgVisualMediaOptions?.permissions?.acceptsCloseMedia) && (
        <Suspense fallback={<div>Loading...</div>}>
          <CloseButton
            fgLowerVisualMediaController={fgLowerVisualMediaController}
          />
        </Suspense>
      )}
    </div>
  );
}
