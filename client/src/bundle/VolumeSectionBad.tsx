import React, { useEffect, useRef } from "react";
import {
  volumeHigh1a,
  volumeHigh1b,
  volumeHigh2a,
  volumeHigh2b,
  volumeHigh3a,
  volumeHigh3b,
  volumeOff1a,
  volumeOff1b,
  volumeOff2a,
  volumeOff2b,
  volumeOff3a,
  volumeOff3b,
  volumeLow1a,
  volumeLow1b,
  volumeLow2a,
  volumeLow2b,
  volumeLow3a,
  volumeLow3b,
} from "./svgPaths";
import SVGMorpher from "../SVGMorpher/SVGMorpher";
import VolumeIndicator from "./VolumeIndicator";

export default function VolumeSection({
  audioRef,
  audioStream,
  handleVolumeSlider = () => {},
  iconSize = "2.5rem",
  sliderSize = "2.5rem",
  handleMute,
  primaryColor = "white",
  isSlider = true,
  paths,
  videoIconStateRef,
  isFinishedRef,
  changedWhileNotFinishedRef,
}: {
  audioRef: React.RefObject<HTMLAudioElement>;
  audioStream?: MediaStream;
  handleVolumeSlider?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleMute: () => void;
  iconSize?: string;
  sliderSize?: string;
  primaryColor?: string;
  isSlider?: boolean;
  paths: string[][];
  videoIconStateRef: React.MutableRefObject<{
    from: string;
    to: string;
  }>;
  isFinishedRef: React.MutableRefObject<boolean>;
  changedWhileNotFinishedRef: React.MutableRefObject<boolean>;
}) {
  const volumeIndicatorRef = useRef<SVGPathElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onMouseEnter = () => {
    timeout.current = setTimeout(() => {
      // Show popup after 1.5 seconds
      console.log("Show popup");
    }, 1500);
  };

  const onMouseLeave = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  };

  return (
    <div
      className='volume-container flex items-center justify-center'
      style={{ height: `calc(${iconSize} * 2)` }}
    >
      <VolumeIndicator
        audioStream={audioStream}
        volumeIndicatorRef={volumeIndicatorRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
      {isSlider && (
        <input
          onInput={handleVolumeSlider}
          className='volume-slider'
          type='range'
          min='0'
          max='1'
          step='any'
        />
      )}
    </div>
  );
}
