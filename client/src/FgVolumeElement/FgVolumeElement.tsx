import React, { useEffect, useRef, useState } from "react";
import "./lib/fgVolumeElement.css";
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
} from "../fgVideo/lib/svgPaths";
import FgButton from "../fgButton/FgButton";
import SVGMorpher from "../SVGMorpher/SVGMorpher";

const defaultFgVolumeElementOptions = {
  iconSize: "2.5rem",
  volumeSliderHeight: "0.25rem",
  volumeSliderWidth: "5rem",
  volumeSliderThumbSize: "0.9375rem",
  primaryColor: "white",
  isSlider: true,
};

export default function FgVolumeElement({
  audioRef,
  handleVolumeSliderCallback,
  handleMute,
  paths,
  videoIconStateRef,
  isFinishedRef,
  changedWhileNotFinishedRef,
  effectsActive,
  options,
}: {
  audioRef: React.RefObject<HTMLAudioElement>;
  handleVolumeSliderCallback: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleMute: () => void;
  paths: string[][];
  videoIconStateRef: React.MutableRefObject<{
    from: string;
    to: string;
  }>;
  isFinishedRef: React.MutableRefObject<boolean>;
  changedWhileNotFinishedRef: React.MutableRefObject<boolean>;
  effectsActive: boolean;
  options?: {
    iconSize?: string;
    volumeSliderHeight?: string;
    volumeSliderWidth?: string;
    volumeSliderThumbSize?: string;
    primaryColor?: string;
    isSlider?: boolean;
  };
}) {
  const fgVolumeElementOptions = {
    ...defaultFgVolumeElementOptions,
    ...options,
  };
  const [active, setActive] = useState(false);
  const volumeContainer = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    volumeContainer.current?.style.setProperty(
      "--volume-slider-width",
      fgVolumeElementOptions.volumeSliderWidth
    );
    volumeContainer.current?.style.setProperty(
      "--volume-slider-height",
      fgVolumeElementOptions.volumeSliderHeight
    );
    volumeContainer.current?.style.setProperty(
      "--volume-slider-thumb-size",
      fgVolumeElementOptions.volumeSliderThumbSize
    );
  }, [
    fgVolumeElementOptions.volumeSliderWidth,
    fgVolumeElementOptions.volumeSliderHeight,
    fgVolumeElementOptions.volumeSliderThumbSize,
  ]);

  const handleVolumeSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (handleVolumeSliderCallback) {
      handleVolumeSliderCallback(event);
    }
  };

  return (
    <div
      ref={volumeContainer}
      className='volume-container flex items-center justify-center'
      style={{ height: `calc(${fgVolumeElementOptions.iconSize} * 2)` }}
    >
      <FgButton
        clickFunction={() => {
          handleMute();
          setActive((prev) => !prev);
        }}
        contentFunction={() => {
          return (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width={`calc(${fgVolumeElementOptions.iconSize} - 0.25rem)`}
              height={`calc(${fgVolumeElementOptions.iconSize} - 0.25rem)`}
              viewBox='250 250 500 580'
              fill={fgVolumeElementOptions.primaryColor}
            >
              {videoIconStateRef.current.from &&
              videoIconStateRef.current.to ? (
                <SVGMorpher
                  pathsArray={paths}
                  audioRef={audioRef}
                  isFinishedRef={isFinishedRef}
                  changedWhileNotFinishedRef={changedWhileNotFinishedRef}
                  color={fgVolumeElementOptions.primaryColor}
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
          );
        }}
        hoverContent={
          !effectsActive ? (
            <div className='mb-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
              {active ? "Unmute (m)" : "Mute (m)"}
            </div>
          ) : undefined
        }
        className='aspect-square flex items-center justify-center relative'
        style={{ width: fgVolumeElementOptions.iconSize }}
      />
      {fgVolumeElementOptions.isSlider && (
        <input
          ref={sliderRef}
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
