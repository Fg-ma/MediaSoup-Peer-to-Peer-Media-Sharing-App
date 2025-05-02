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
  fgLowerVisualMediaController: React.MutableRefObject<FgLowerVisualMediaController>;
  reactionsPanelActive: boolean;
  setReactionsPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="visual-media-upper-controls absolute left-0 top-[1%] z-20 flex h-[12%] max-h-12 min-h-6 w-full items-center justify-center space-x-2 pl-4 pr-0.5">
      <div className="grow cursor-default select-none text-lg">
        {name ? name : username}
      </div>
      <div className="flex h-full space-x-2">
        <ReactButton
          reactionsPanelActive={reactionsPanelActive}
          setReactionsPanelActive={setReactionsPanelActive}
          clickFunction={fgLowerVisualMediaController.current.handleReact}
          reactionFunction={
            fgLowerVisualMediaController.current.reactController.handleReaction
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
