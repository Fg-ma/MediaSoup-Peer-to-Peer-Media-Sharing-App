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
import SVGMorpher from "./SVGMorpher";

export default function VolumeSection({
  videoRef,
  volumeSliderRef,
  handleMute,
  primaryVolumeSliderColor = "white",
  secondaryVolumeSliderColor = "#D9D9D9",
  defaultVolume = "high",
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  volumeSliderRef: React.RefObject<HTMLInputElement>;
  handleMute: () => void;
  primaryVolumeSliderColor?: string;
  secondaryVolumeSliderColor?: string;
  defaultVolume?: string;
}) {
  const [paths, setPaths] = useState<string[][]>([
    [volumeHigh1a, volumeHighOffIB1a, volumeOff1a],
    [volumeHigh1b, volumeHighOffIB1b, volumeOff1b],
    [volumeHigh2a, volumeHighOffIB2a, volumeOff2a],
    [volumeHigh2b, volumeHighOffIB2b, volumeOff2b],
    [volumeHigh3a, volumeHighOffIB3a, volumeOff3a],
    [volumeHigh3b, volumeHighOffIB3b, volumeOff3b],
  ]);
  const muteButtonRef = useRef<HTMLButtonElement>(null);
  const videoIconStateRef = useRef({ from: "", to: defaultVolume });
  const changed = useRef(false);
  const timerRef = useRef<any>(null);

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

    if (videoIconStateRef.current.to !== newVolumeState) {
      changed.current = true;
      setTimeout(() => {
        changed.current = false;
      }, 750);
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
    trackColorSetter();

    videoRef.current?.addEventListener("volumechange", () => {
      if (!volumeSliderRef.current || !videoRef.current) return;
      if (!videoRef.current.muted) {
        volumeSliderRef.current.value = videoRef.current.volume.toString();
      }
      if (!changed.current) {
        volumeChangeHandler();

        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
          volumeChangeHandler();
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }, 900);
      }
    });

    return () => {};
  }, []);

  return (
    <div className='volume-container flex items-center justify-center'>
      <button
        ref={muteButtonRef}
        onClick={handleMute}
        className='w-10 aspect-square flex items-center justify-center'
      >
        {videoIconStateRef.current.from && videoIconStateRef.current.to ? (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='36px'
            height='36px'
            viewBox='200 200 600 680'
            fill='white'
          >
            <SVGMorpher pathsArray={paths} />
          </svg>
        ) : videoIconStateRef.current.to === "high" ? (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='36px'
            height='36px'
            viewBox='200 200 600 680'
            fill='white'
          >
            <path d={volumeHigh1a} />
            <path d={volumeHigh1b} />
            <path d={volumeHigh2a} />
            <path d={volumeHigh2b} />
            <path d={volumeHigh3a} />
            <path d={volumeHigh3b} />
          </svg>
        ) : videoIconStateRef.current.to === "low" ? (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='36px'
            height='36px'
            viewBox='200 200 600 680'
            fill='white'
          >
            <path d={volumeLow1a} />
            <path d={volumeLow1b} />
            <path d={volumeLow2a} />
            <path d={volumeLow2b} />
            <path d={volumeLow3a} />
            <path d={volumeLow3b} />
          </svg>
        ) : videoIconStateRef.current.to === "off" ? (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='36px'
            height='36px'
            viewBox='200 200 600 680'
            fill='white'
          >
            <path d={volumeOff1a} />
            <path d={volumeOff1b} />
            <path d={volumeOff2a} />
            <path d={volumeOff2b} />
            <path d={volumeOff3a} />
            <path d={volumeOff3b} />
          </svg>
        ) : null}
      </button>
      <input
        ref={volumeSliderRef}
        onInput={handleVolumeSlider}
        className='volume-slider'
        type='range'
        min='0'
        max='1'
        step='any'
      />
    </div>
  );
}
