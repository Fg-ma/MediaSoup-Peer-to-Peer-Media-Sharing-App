import React from "react";
import LowerController from "../lowerControls/lib/LowerController";
import CloseButton from "./lib/closeButton/CloseButton";
import { MediaContainerOptions } from "../typeConstant";
import ReactButton from "../../../../elements/reactButton/ReactButton";
import TabledButton from "./lib/tabledButton/TabledButton";

export default function UpperControls({
  tabled,
  reactionsPanelActive,
  setReactionsPanelActive,
  lowerController,
  leftUpperControls,
  rightUpperControls,
  mediaContainerOptions,
  fullscreen,
  backgroundMedia,
}: {
  tabled: boolean;
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
      } absolute w-full h-[12%] max-h-12 min-h-6 items-center justify-between z-20`}
    >
      <div className='flex h-full w-max items-center justify-center'>
        <TabledButton tabled={tabled} lowerController={lowerController} />
        {leftUpperControls && leftUpperControls.length > 0 && leftUpperControls}
      </div>
      <div className='flex grow h-full items-center justify-end space-x-2'>
        {rightUpperControls &&
          rightUpperControls.length > 0 &&
          rightUpperControls}
        <ReactButton
          reactionsPanelActive={reactionsPanelActive}
          setReactionsPanelActive={setReactionsPanelActive}
          clickFunction={lowerController.handleReact}
          reactionFunction={lowerController.reactController.handleReaction}
        />
        <CloseButton lowerController={lowerController} />
      </div>
    </div>
  );
}
