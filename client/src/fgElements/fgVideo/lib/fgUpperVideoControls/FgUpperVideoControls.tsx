import React from "react";
import FgLowerVideoController from "../fgLowerVideoControls/lib/FgLowerVideoController";
import CloseButton from "./lib/closeButton/CloseButton";

export default function FgUpperVideoControls({
  fgLowerVideoController,
}: {
  fgLowerVideoController: FgLowerVideoController;
}) {
  return (
    <div className='video-media-upper-controls absolute top-0 w-full h-10 flex items-center justify-center z-20 space-x-2'>
      <div></div>
      <CloseButton fgLowerVideoController={fgLowerVideoController} />
    </div>
  );
}
