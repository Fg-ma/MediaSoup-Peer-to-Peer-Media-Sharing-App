import React from "react";
import FgLowerVideoController from "../fgLowerVideoControls/lib/FgLowerVideoController";
import CloseButton from "./lib/closeButton/CloseButton";
import SyncButton from "./lib/syncButton/SyncButton";

export default function FgUpperVideoControls({
  desync,
  fgLowerVideoController,
}: {
  desync: boolean;
  fgLowerVideoController: FgLowerVideoController;
}) {
  return (
    <div className='video-media-upper-controls absolute top-0 w-full h-10 flex items-center justify-between z-20'>
      <div></div>
      <div className='grow h-full flex items-center justify-end space-x-2'>
        <SyncButton
          desync={desync}
          fgLowerVideoController={fgLowerVideoController}
        />
        <CloseButton fgLowerVideoController={fgLowerVideoController} />
      </div>
    </div>
  );
}
