import React from "react";
import LowerController from "../lowerControls/lib/LowerController";
import CloseButton from "./lib/closeButton/CloseButton";
import SyncButton from "./lib/syncButton/SyncButton";
import ReactButton from "./lib/reactButton/ReactButton";
import { MediaContainerOptions } from "../typeConstant";

export default function UpperControls({
  desync,
  reactionsPanelActive,
  setReactionsPanelActive,
  lowerController,
  leftUpperControls,
  rightUpperControls,
  mediaContainerOptions,
  fullscreen,
  backgroundMedia,
}: {
  desync: boolean;
  reactionsPanelActive: boolean;
  setReactionsPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
  lowerController: LowerController;
  leftUpperControls?: (React.ReactNode | null)[];
  rightUpperControls?: (React.ReactNode | null)[];
  mediaContainerOptions: MediaContainerOptions;
  fullscreen: boolean;
  backgroundMedia: boolean;
}) {
  return (
    <div
      className={`flex media-upper-controls ${
        mediaContainerOptions.controlsPlacement === "inside" ||
        fullscreen ||
        backgroundMedia
          ? "top-0"
          : "bottom-full"
      } absolute w-full h-10 items-center justify-between z-20`}
    >
      <div>
        {leftUpperControls && leftUpperControls.length > 0 && leftUpperControls}
      </div>
      <div className='flex grow h-full items-center justify-end space-x-2'>
        {rightUpperControls &&
          rightUpperControls.length > 0 &&
          rightUpperControls}
        <ReactButton
          reactionsPanelActive={reactionsPanelActive}
          setReactionsPanelActive={setReactionsPanelActive}
          lowerController={lowerController}
        />
        <SyncButton desync={desync} lowerController={lowerController} />
        <CloseButton lowerController={lowerController} />
      </div>
    </div>
  );
}
