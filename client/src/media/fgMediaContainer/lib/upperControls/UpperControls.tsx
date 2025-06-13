import React, { useEffect, useRef } from "react";
import LowerController from "../lowerControls/lib/LowerController";
import CloseButton from "./lib/closeButton/CloseButton";
import { MediaContainerOptions } from "../typeConstant";
import ReactButton from "../../../../elements/reactButton/ReactButton";
import TabledButton from "./lib/tabledButton/TabledButton";
import { TableContentStateTypes } from "../../../../../../universal/contentTypeConstant";

export default function UpperControls({
  upperControlsRef,
  filename,
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
  upperControlsRef: React.RefObject<HTMLDivElement>;
  filename?: string;
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
  const leftControlsRef = useRef<HTMLDivElement>(null);

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (leftControlsRef.current) {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        leftControlsRef.current.scrollLeft -= event.deltaX / 2;
      } else {
        leftControlsRef.current.scrollLeft -= event.deltaY / 2;
      }
    }
  };

  useEffect(() => {
    leftControlsRef.current?.addEventListener("wheel", handleWheel);

    return () => {
      leftControlsRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div
      ref={upperControlsRef}
      className={`media-upper-controls flex ${
        mediaContainerOptions.controlsPlacement === "inside" ||
        fullscreen ||
        backgroundMedia
          ? "top-0"
          : "bottom-full mb-1.5"
      } !pointer-events-none absolute z-20 h-[10%] max-h-10 min-h-6 w-full items-center justify-between`}
    >
      <div
        ref={leftControlsRef}
        className="hide-scroll-bar !pointer-events-none flex h-full w-max items-center justify-start space-x-2 overflow-x-auto"
      >
        <TabledButton state={state} lowerController={lowerController} />
        {leftUpperControls && leftUpperControls.length > 0 && leftUpperControls}
        {filename && (
          <div className="whitespace-nowrap text-lg text-fg-white">
            {filename}
          </div>
        )}
      </div>
      <div className="!pointer-events-none flex h-full w-max items-center justify-end space-x-2">
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
