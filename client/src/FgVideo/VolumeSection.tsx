import React, { useEffect, useRef, useState } from "react";
import {
  volumeHigh1a,
  volumeHigh1b,
  volumeHigh2a,
  volumeHigh2b,
  volumeHigh3a,
  volumeHigh3b,
  volumeHighOffIB1a,
  volumeHighOffIB1b,
  volumeHighOffIB2a,
  volumeHighOffIB2b,
  volumeHighOffIB3a,
  volumeHighOffIB3b,
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
  volumeHighLowIB1a,
  volumeHighLowIB1b,
  volumeHighLowIB2a,
  volumeHighLowIB2b,
  volumeHighLowIB3a,
  volumeHighLowIB3b,
  volumeLowOffA1a,
  volumeLowOffA1b,
  volumeLowOffA2a,
  volumeLowOffA2b,
  volumeLowOffA3a,
  volumeLowOffA3b,
  volumeLowOffB1a,
  volumeLowOffB1b,
  volumeLowOffB2a,
  volumeLowOffB2b,
  volumeLowOffB3a,
  volumeLowOffB3b,
} from "./paths";
import SVGMorpher from "../SVGMorpher/SVGMorpher";

export default function VolumeSection({
  videoRef,
  volumeSliderRef,
  iconSize = "2.5rem",
  handleMute,
  primaryColor = "white",
  primaryVolumeSliderColor = "white",
  secondaryVolumeSliderColor = "rgba(150, 150, 150, 0.5)",
  defaultVolume = "high",
  isSlider = true,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  volumeSliderRef: React.RefObject<HTMLInputElement>;
  iconSize?: string;
  handleMute: () => void;
  primaryColor?: string;
  primaryVolumeSliderColor?: string;
  secondaryVolumeSliderColor?: string;
  defaultVolume?: string;
  isSlider?: boolean;
}) {
  const [paths, setPaths] = useState<string[][]>([
    [volumeOff1a, volumeHighOffIB1a, volumeHigh1a],
    [volumeOff1b, volumeHighOffIB1b, volumeHigh1b],
    [volumeOff2a, volumeHighOffIB2a, volumeHigh2a],
    [volumeOff2b, volumeHighOffIB2b, volumeHigh2b],
    [volumeOff3a, volumeHighOffIB3a, volumeHigh3a],
    [volumeOff3b, volumeHighOffIB3b, volumeHigh3b],
  ]);
  const muteButtonRef = useRef<HTMLButtonElement>(null);
  const videoIconStateRef = useRef({ from: "", to: defaultVolume });
  const isFinishedRef = useRef(true);
  const changedWhileNotFinishedRef = useRef(false);

  const trackColorSetter = () => {
    if (!volumeSliderRef.current) {
      return;
    }

    const value = parseFloat(volumeSliderRef.current.value);
    const min = parseFloat(volumeSliderRef.current.min);
    const max = parseFloat(volumeSliderRef.current.max);
    const percentage = ((value - min) / (max - min)) * 100;
    const trackColor = `linear-gradient(to right, ${primaryVolumeSliderColor} 0%, ${primaryVolumeSliderColor} ${percentage}%, ${secondaryVolumeSliderColor} ${percentage}%, ${secondaryVolumeSliderColor} 100%)`;
    volumeSliderRef.current.style.background = trackColor;
    volumeSliderRef.current.style.borderRadius = "2px";
  };

  const handleVolumeSlider = () => {
    if (!volumeSliderRef.current) {
      return;
    }

    const volume = parseFloat(volumeSliderRef.current.value);
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = volume === 0;
    }

    trackColorSetter();
  };

  const volumeChangeHandler = () => {
    if (!videoRef.current) {
      return;
    }

    if (volumeSliderRef.current && !videoRef.current.muted) {
      volumeSliderRef.current.value = videoRef.current.volume.toString();
    }

    trackColorSetter();

    const newVolume = videoRef.current.volume;
    let newVolumeState;
    if (videoRef.current.muted || newVolume === 0) {
      newVolumeState = "off";
    } else if (videoRef.current.volume >= 0.5) {
      newVolumeState = "high";
    } else {
      newVolumeState = "low";
    }

    if (
      !isFinishedRef.current &&
      videoIconStateRef.current.to !== newVolumeState
    ) {
      if (!changedWhileNotFinishedRef.current) {
        changedWhileNotFinishedRef.current = true;
      }
      return;
    }

    if (videoIconStateRef.current.to !== newVolumeState) {
      const { from, to } = videoIconStateRef.current;
      videoIconStateRef.current = { from: to, to: newVolumeState };

      let newPaths: string[][] = [];
      if (to === "high" && newVolumeState === "off") {
        newPaths = [
          [volumeHigh1a, volumeHighOffIB1a, volumeOff1a],
          [volumeHigh1b, volumeHighOffIB1b, volumeOff1b],
          [volumeHigh2a, volumeHighOffIB2a, volumeOff2a],
          [volumeHigh2b, volumeHighOffIB2b, volumeOff2b],
          [volumeHigh3a, volumeHighOffIB3a, volumeOff3a],
          [volumeHigh3b, volumeHighOffIB3b, volumeOff3b],
        ];
      } else if (to === "off" && newVolumeState === "high") {
        newPaths = [
          [volumeOff1a, volumeHighOffIB1a, volumeHigh1a],
          [volumeOff1b, volumeHighOffIB1b, volumeHigh1b],
          [volumeOff2a, volumeHighOffIB2a, volumeHigh2a],
          [volumeOff2b, volumeHighOffIB2b, volumeHigh2b],
          [volumeOff3a, volumeHighOffIB3a, volumeHigh3a],
          [volumeOff3b, volumeHighOffIB3b, volumeHigh3b],
        ];
      } else if (to === "low" && newVolumeState === "off") {
        newPaths = [
          [volumeLow1a, volumeLowOffA1a, volumeLowOffB1a, volumeOff1a],
          [volumeLow1b, volumeLowOffA1b, volumeLowOffB1b, volumeOff1b],
          [volumeLow2a, volumeLowOffA2a, volumeLowOffB2a, volumeOff2a],
          [volumeLow2b, volumeLowOffA2b, volumeLowOffB2b, volumeOff2b],
          [volumeLow3a, volumeLowOffA3a, volumeLowOffB3a, volumeOff3a],
          [volumeLow3b, volumeLowOffA3b, volumeLowOffB3b, volumeOff3b],
        ];
      } else if (to === "off" && newVolumeState === "low") {
        newPaths = [
          [volumeOff1a, volumeLowOffB1a, volumeLowOffA1a, volumeLow1a],
          [volumeOff1b, volumeLowOffB1b, volumeLowOffA1b, volumeLow1b],
          [volumeOff2a, volumeLowOffB2a, volumeLowOffA2a, volumeLow2a],
          [volumeOff2b, volumeLowOffB2b, volumeLowOffA2b, volumeLow2b],
          [volumeOff3a, volumeLowOffB3a, volumeLowOffA3a, volumeLow3a],
          [volumeOff3b, volumeLowOffB3b, volumeLowOffA3b, volumeLow3b],
        ];
      } else if (to === "high" && newVolumeState === "low") {
        newPaths = [
          [volumeHigh1a, volumeHighLowIB1a, volumeLow1a],
          [volumeHigh1b, volumeHighLowIB1b, volumeLow1b],
          [volumeHigh2a, volumeHighLowIB2a, volumeLow2a],
          [volumeHigh2b, volumeHighLowIB2b, volumeLow2b],
          [volumeHigh3a, volumeHighLowIB3a, volumeLow3a],
          [volumeHigh3b, volumeHighLowIB3b, volumeLow3b],
        ];
      } else if (to === "low" && newVolumeState === "high") {
        newPaths = [
          [volumeLow1a, volumeHighLowIB1a, volumeHigh1a],
          [volumeLow1b, volumeHighLowIB1b, volumeHigh1b],
          [volumeLow2a, volumeHighLowIB2a, volumeHigh2a],
          [volumeLow2b, volumeHighLowIB2b, volumeHigh2b],
          [volumeLow3a, volumeHighLowIB3a, volumeHigh3a],
          [volumeLow3b, volumeHighLowIB3b, volumeHigh3b],
        ];
      }
      setPaths(newPaths);
    }
  };

  useEffect(() => {
    // Set initial volume slider
    if (isSlider) {
      trackColorSetter();
    }

    videoRef.current?.addEventListener("volumechange", volumeChangeHandler);

    return () => {
      videoRef.current?.removeEventListener(
        "volumechange",
        volumeChangeHandler
      );
    };
  }, [videoRef]);

  return (
    <div className='volume-container flex items-center justify-center'>
      <button
        ref={muteButtonRef}
        onClick={handleMute}
        className='aspect-square flex items-center justify-center'
        style={{ width: iconSize }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width={`calc(${iconSize} - 0.25rem)`}
          height={`calc(${iconSize} - 0.25rem)`}
          viewBox='250 250 500 580'
          fill={primaryColor}
        >
          {videoIconStateRef.current.from && videoIconStateRef.current.to ? (
            <SVGMorpher
              pathsArray={paths}
              videoRef={videoRef}
              isFinishedRef={isFinishedRef}
              changedWhileNotFinishedRef={changedWhileNotFinishedRef}
              color={primaryColor}
            />
          ) : videoIconStateRef.current.from === "" &&
            videoIconStateRef.current.to === "high" ? (
            <>
              <path d={volumeHigh1a} />
              <path d={volumeHigh1b} />
              <path d={volumeHigh2a} />
              <path d={volumeHigh2b} />
              <path d={volumeHigh3a} />
              <path d={volumeHigh3b} />
            </>
          ) : videoIconStateRef.current.from === "" &&
            videoIconStateRef.current.to === "low" ? (
            <>
              <path d={volumeLow1a} />
              <path d={volumeLow1b} />
              <path d={volumeLow2a} />
              <path d={volumeLow2b} />
              <path d={volumeLow3a} />
              <path d={volumeLow3b} />
            </>
          ) : videoIconStateRef.current.from === "" &&
            videoIconStateRef.current.to === "off" ? (
            <>
              <path d={volumeOff1a} />
              <path d={volumeOff1b} />
              <path d={volumeOff2a} />
              <path d={volumeOff2b} />
              <path d={volumeOff3a} />
              <path d={volumeOff3b} />
            </>
          ) : null}
        </svg>
      </button>
      {isSlider && (
        <input
          ref={volumeSliderRef}
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
