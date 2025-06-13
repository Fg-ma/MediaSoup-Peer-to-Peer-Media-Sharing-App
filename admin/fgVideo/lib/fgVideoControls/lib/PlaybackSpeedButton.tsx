import React from "react";
import FgButton from "../../fgButton/FgButton";
import Controls from "./Controls";

export default function PlaybackSpeedButton({
  controls,
  effectsActive,
  settingsActive,
  playbackSpeedButtonRef,
}: {
  controls: Controls;
  effectsActive: boolean;
  settingsActive: boolean;
  playbackSpeedButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  return (
    <FgButton
      externalRef={playbackSpeedButtonRef}
      clickFunction={() => {
        controls.handlePlaybackSpeed();
      }}
      contentFunction={() => {
        return <>1x</>;
      }}
      hoverContent={
        !effectsActive && !settingsActive ? (
          <div className='mb-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
            Playback speed
          </div>
        ) : undefined
      }
      className='playback-speed-button wide-button text-lg scale-x-[-1]'
    />
  );
}
