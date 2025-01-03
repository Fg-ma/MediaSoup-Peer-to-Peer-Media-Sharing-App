import React from "react";
import FgLowerVideoController from "../fgLowerVideoControls/lib/FgLowerVideoController";
import { FgVideoOptions } from "../typeConstant";
import CloseButton from "./lib/closeButton/CloseButton";

export default function FgUpperVideoMediaControls({
  name,
  username,
  fgVideoOptions,
  fgLowerVideoController,
}: {
  name: string | undefined;
  username: string;
  fgVideoOptions: FgVideoOptions;
  fgLowerVideoController: FgLowerVideoController;
}) {
  return (
    <div className='video-media-upper-controls absolute top-0 w-full h-10 flex items-center justify-center z-20 space-x-2'>
      <div className='grow text-lg cursor-default select-none'>
        {name ? name : username}
      </div>
      <CloseButton fgLowerVideoController={fgLowerVideoController} />
    </div>
  );
}
