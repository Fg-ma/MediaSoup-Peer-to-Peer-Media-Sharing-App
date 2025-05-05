import React from "react";
import LowerController from "../lowerControls/lib/LowerController";
import CloseButton from "./lib/closeButton/CloseButton";
import { MediaContainerOptions } from "../typeConstant";
import ReactButton from "../../../../elements/reactButton/ReactButton";
import TabledButton from "./lib/tabledButton/TabledButton";
import { TableContentStateTypes } from "../../../../../../universal/contentTypeConstant";

export default function UpperControls({
  reactionsPanelActive,
  setReactionsPanelActive,
  lowerController,
  leftUpperControls,
  rightUpperControls,
  mediaContainerOptions,
  fullscreen,
  backgroundMedia,
  state,
}: {
  reactionsPanelActive: boolean;
  setReactionsPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
  lowerController: React.MutableRefObject<LowerController>;
  leftUpperControls?: (React.ReactNode | null)[];
  rightUpperControls?: (React.ReactNode | null)[];
  mediaContainerOptions: MediaContainerOptions;
  fullscreen: boolean;
  backgroundMedia: boolean;
  state: React.MutableRefObject<TableContentStateTypes[]>;
}) {
  return (
    <div
      className={`media-upper-controls flex ${
        mediaContainerOptions.controlsPlacement === "inside" ||
        fullscreen ||
        backgroundMedia
          ? "top-0"
          : "bottom-full"
      } pointer-events-none absolute z-20 h-[10%] max-h-10 min-h-6 w-full items-center justify-between`}
    >
      <div className="flex h-full w-max items-center justify-center">
        <TabledButton state={state} lowerController={lowerController} />
        {leftUpperControls && leftUpperControls.length > 0 && leftUpperControls}
      </div>
      <div className="flex h-full grow items-center justify-end space-x-2">
        {rightUpperControls &&
          rightUpperControls.length > 0 &&
          rightUpperControls}
        <ReactButton
          reactionsPanelActive={reactionsPanelActive}
          setReactionsPanelActive={setReactionsPanelActive}
          clickFunction={lowerController.current.handleReact}
          reactionFunction={
            lowerController.current.reactController.handleReaction
          }
        />
        <CloseButton lowerController={lowerController} />
      </div>
    </div>
  );
}
