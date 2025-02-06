import React from "react";
import LowerController from "../lowerControls/lib/LowerController";
import CloseButton from "./lib/closeButton/CloseButton";
import SyncButton from "./lib/syncButton/SyncButton";

export default function UpperControls({
  desync,
  lowerController,
}: {
  desync: boolean;
  lowerController: LowerController;
}) {
  return (
    <div className='flex media-upper-controls absolute top-0 w-full h-10 items-center justify-between z-20'>
      <div></div>
      <div className='flex grow h-full items-center justify-end space-x-2'>
        <SyncButton desync={desync} lowerController={lowerController} />
        <CloseButton lowerController={lowerController} />
      </div>
    </div>
  );
}
