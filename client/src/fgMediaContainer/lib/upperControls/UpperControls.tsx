import React from "react";
import LowerController from "../lowerControls/lib/LowerController";
import CloseButton from "./lib/closeButton/CloseButton";
import SyncButton from "./lib/syncButton/SyncButton";

export default function UpperControls({
  desync,
  lowerController,
  leftUpperControls,
  rightUpperControls,
}: {
  desync: boolean;
  lowerController: LowerController;
  leftUpperControls?: (React.ReactNode | null)[];
  rightUpperControls?: (React.ReactNode | null)[];
}) {
  return (
    <div className='flex media-upper-controls absolute top-0 w-full h-10 items-center justify-between z-20'>
      <div>
        {leftUpperControls && leftUpperControls.length > 0 && leftUpperControls}
      </div>
      <div className='flex grow h-full items-center justify-end space-x-2'>
        {rightUpperControls &&
          rightUpperControls.length > 0 &&
          rightUpperControls}
        <SyncButton desync={desync} lowerController={lowerController} />
        <CloseButton lowerController={lowerController} />
      </div>
    </div>
  );
}
