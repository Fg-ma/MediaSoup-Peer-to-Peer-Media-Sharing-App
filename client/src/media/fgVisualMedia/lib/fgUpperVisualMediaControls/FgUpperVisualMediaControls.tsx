import React, { Suspense } from "react";
import FgLowerVisualMediaController from "../fgLowerVisualMediaControls/lib/FgLowerVisualMediaController";
import { FgVisualMediaOptions } from "../typeConstant";
import ReactButton from "../../../../elements/reactButton/ReactButton";

const CloseButton = React.lazy(() => import("./lib/closeButton/CloseButton"));

export default function FgUpperVisualMediaControls({
  name,
  username,
  fgVisualMediaOptions,
  fgLowerVisualMediaController,
  reactionsPanelActive,
  setReactionsPanelActive,
}: {
  name: string | undefined;
  username: string;
  fgVisualMediaOptions: FgVisualMediaOptions;
  fgLowerVisualMediaController: FgLowerVisualMediaController;
  reactionsPanelActive: boolean;
  setReactionsPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className='visual-media-upper-controls absolute top-[1%] left-0 w-full h-[12%] max-h-12 min-h-6 flex items-center justify-center z-20 space-x-2 pr-0.5 pl-4'>
      <div className='grow text-lg cursor-default select-none'>
        {name ? name : username}
      </div>
      <div className='flex h-full space-x-2'>
        <ReactButton
          reactionsPanelActive={reactionsPanelActive}
          setReactionsPanelActive={setReactionsPanelActive}
          clickFunction={fgLowerVisualMediaController.handleReact}
          reactionFunction={
            fgLowerVisualMediaController.reactController.handleReaction
          }
        />
        {(fgVisualMediaOptions.isUser ||
          fgVisualMediaOptions?.permissions?.acceptsCloseMedia) && (
          <Suspense fallback={<div>Loading...</div>}>
            <CloseButton
              fgLowerVisualMediaController={fgLowerVisualMediaController}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
