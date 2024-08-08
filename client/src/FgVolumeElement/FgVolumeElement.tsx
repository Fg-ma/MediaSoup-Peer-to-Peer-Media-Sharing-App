import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import "./lib/fgVolumeElement.css";
import volumeSVGPaths, { newVolumeSVGPaths } from "./lib/volumeSVGPaths";
import FgButton from "../fgButton/FgButton";
import SVGMorpher from "../SVGMorpher/SVGMorpher";
import FgVolumeElementController from "./lib/FgVolumeElementController";
import VolumeSVGMorpher from "./lib/VolumeSVGMorpher";

interface FgVolumeElementOptions {
  iconSize?: string;
  volumeSliderHeight?: string;
  volumeSliderWidth?: string;
  volumeSliderThumbSize?: string;
  primaryColor?: string;
  isSlider?: boolean;
  initialVolume?: "low" | "off" | "high";
  primaryVolumeSliderColor?: string;
  secondaryVolumeSliderColor?: string;
}

const defaultFgVolumeElementOptions = {
  iconSize: "2.5rem",
  volumeSliderHeight: "0.25rem",
  volumeSliderWidth: "5rem",
  volumeSliderThumbSize: "0.9375rem",
  primaryColor: "white",
  isSlider: true,
  initialVolume: "high",
  primaryVolumeSliderColor: "white",
  secondaryVolumeSliderColor: "rgba(150, 150, 150, 0.5)",
};

export default function FgVolumeElement({
  audioRef,
  handleVolumeSliderCallback,
  handleMuteCallback,
  tracksColorSetterCallback,
  volumeChangeHandlerCallback,
  effectsActive,
  options,
  clientMute,
  isUser,
  username,
  socket,
}: {
  audioRef: React.RefObject<HTMLAudioElement>;
  handleVolumeSliderCallback?: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleMuteCallback?: () => void;
  tracksColorSetterCallback?: () => void;
  volumeChangeHandlerCallback?: () => void;
  effectsActive: boolean;
  options?: FgVolumeElementOptions;
  clientMute: React.MutableRefObject<boolean>;
  isUser: boolean;
  username: string;
  socket: React.MutableRefObject<Socket>;
}) {
  const fgVolumeElementOptions = {
    ...defaultFgVolumeElementOptions,
    ...options,
  };

  const [active, setActive] = useState(
    fgVolumeElementOptions.initialVolume === "off" ? true : false
  );
  const [paths, setPaths] = useState<[string, string, string]>();
  const [strikePaths, setStrikePaths] = useState<[string, string]>();
  const volumeContainer = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const videoIconStateRef = useRef({
    from: "",
    to: fgVolumeElementOptions.initialVolume,
  });

  const localMute = useRef(
    fgVolumeElementOptions.initialVolume === "off" ? true : false
  ); // Not user audio mute

  const fgVolumeElementController = new FgVolumeElementController(
    isUser,
    username,
    clientMute,
    videoIconStateRef,
    setPaths,
    audioRef,
    localMute,
    setActive
  );

  // Initial functions
  useEffect(() => {
    // Set initial volume slider
    tracksColorSetter();

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

    socket.current.on("message", (event: any) =>
      fgVolumeElementController.handleMessage(event)
    );

    // Cleanup event listener on unmount
    return () => {
      socket.current.off("message", (event: any) =>
        fgVolumeElementController.handleMessage(event)
      );
    };
  }, []);

  const volumeChangeHandler = () => {
    tracksColorSetter();

    if (!audioRef.current || clientMute?.current) {
      return;
    }

    const newVolume = audioRef.current.volume;
    let newVolumeState;
    if ((audioRef.current.muted && !isUser) || newVolume === 0) {
      newVolumeState = "off";
    } else if (audioRef.current.volume >= 0.5) {
      newVolumeState = "high";
    } else {
      newVolumeState = "low";
    }

    if (videoIconStateRef.current.to !== newVolumeState) {
      const { from, to } = videoIconStateRef.current;
      videoIconStateRef.current = { from: to, to: newVolumeState };

      if (newVolumeState === "off") {
        audioRef.current.muted = true;

        videoIconStateRef.current = {
          from: videoIconStateRef.current.to,
          to: "off",
        };

        const newPaths = fgVolumeElementController.getNewPaths(
          videoIconStateRef.current.from,
          "off"
        );
        if (newPaths) {
          setPaths(newPaths);
        }

        const newStrikePaths = fgVolumeElementController.getStrikePaths(
          videoIconStateRef.current.from,
          "off"
        );
        setStrikePaths(newStrikePaths);
      } else {
        audioRef.current.muted = false;

        const newVolume = audioRef.current.volume;
        let newVolumeState;
        if (newVolume === 0) {
          newVolumeState = "off";
        } else if (newVolume >= 0.5) {
          newVolumeState = "high";
        } else {
          newVolumeState = "low";
        }

        videoIconStateRef.current = {
          from: videoIconStateRef.current.to,
          to: newVolumeState,
        };

        const newPaths = fgVolumeElementController.getNewPaths(
          videoIconStateRef.current.from,
          newVolumeState
        );
        if (newPaths) {
          setPaths(newPaths);
        }

        const newStrikePaths = fgVolumeElementController.getStrikePaths(
          videoIconStateRef.current.from,
          newVolumeState
        );
        setStrikePaths(newStrikePaths);
      }

      const newPaths = fgVolumeElementController.getNewPaths(
        to,
        newVolumeState
      );
      if (newPaths) {
        setPaths(newPaths);
      }

      const newStrikePaths = fgVolumeElementController.getStrikePaths(
        to,
        newVolumeState
      );
      setStrikePaths(newStrikePaths);
    }

    if (volumeChangeHandlerCallback) {
      volumeChangeHandlerCallback();
    }
  };

  const tracksColorSetter = () => {
    if (!sliderRef.current || !audioRef.current) {
      return;
    }

    let value = audioRef.current.volume;
    if (audioRef.current.muted) {
      value = 0;
    }
    const min = 0;
    const max = 1;
    const percentage = ((value - min) / (max - min)) * 100;
    const trackColor = `linear-gradient(to right, ${fgVolumeElementOptions.primaryVolumeSliderColor} 0%, ${fgVolumeElementOptions.primaryVolumeSliderColor} ${percentage}%, ${fgVolumeElementOptions.secondaryVolumeSliderColor} ${percentage}%, ${fgVolumeElementOptions.secondaryVolumeSliderColor} 100%)`;

    sliderRef.current.style.background = trackColor;

    if (tracksColorSetterCallback) {
      tracksColorSetterCallback();
    }
  };

  const handleVolumeSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);

    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (!clientMute?.current) {
        audioRef.current.muted = volume > 0 ? false : true;
      }
    }

    if (sliderRef.current) {
      sliderRef.current.value = `${volume}`;
    }

    tracksColorSetter();

    volumeChangeHandler();

    if (handleVolumeSliderCallback) {
      handleVolumeSliderCallback(event);
    }
  };

  const handleMute = () => {
    if (clientMute?.current) {
      return;
    }

    localMute.current = !localMute.current;

    if (audioRef.current) {
      audioRef.current.muted = localMute.current;
    }

    if (localMute.current) {
      videoIconStateRef.current = {
        from: videoIconStateRef.current.to,
        to: "off",
      };

      const newPaths = fgVolumeElementController.getNewPaths(
        videoIconStateRef.current.from,
        "off"
      );
      if (newPaths) {
        setPaths(newPaths);
      }

      const newStrikePaths = fgVolumeElementController.getStrikePaths(
        videoIconStateRef.current.from,
        "off"
      );
      setStrikePaths(newStrikePaths);
    } else {
      if (!audioRef.current) {
        return;
      }

      const newVolume = audioRef.current.volume;
      let newVolumeState;
      if (newVolume === 0) {
        newVolumeState = "off";
      } else if (newVolume >= 0.5) {
        newVolumeState = "high";
      } else {
        newVolumeState = "low";
      }

      videoIconStateRef.current = {
        from: videoIconStateRef.current.to,
        to: newVolumeState,
      };

      const newPaths = fgVolumeElementController.getNewPaths(
        videoIconStateRef.current.from,
        videoIconStateRef.current.to
      );
      if (newPaths) {
        setPaths(newPaths);
      }

      const newStrikePaths = fgVolumeElementController.getStrikePaths(
        videoIconStateRef.current.from,
        videoIconStateRef.current.to
      );
      setStrikePaths(newStrikePaths);
    }

    if (handleMuteCallback !== undefined) {
      handleMuteCallback();
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
          if (!clientMute.current) {
            setActive((prev) => !prev);
          }
        }}
        contentFunction={() => {
          return (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width={`calc(${fgVolumeElementOptions.iconSize} - 0.25rem)`}
              height={`calc(${fgVolumeElementOptions.iconSize} - 0.25rem)`}
              viewBox='0 0 100.0001 100.00001'
              fill={fgVolumeElementOptions.primaryColor}
            >
              {videoIconStateRef.current.from &&
              videoIconStateRef.current.to ? (
                <VolumeSVGMorpher
                  pathArrays={paths}
                  stationaryPaths={[
                    newVolumeSVGPaths.high.left,
                    newVolumeSVGPaths.high.middle,
                  ]}
                  strikePaths={strikePaths}
                  color={fgVolumeElementOptions.primaryColor}
                />
              ) : videoIconStateRef.current.from === "" &&
                videoIconStateRef.current.to === "high" ? (
                <>
                  <path d={volumeSVGPaths.volumeHigh1a} />
                  <path d={volumeSVGPaths.volumeHigh1b} />
                  <path d={volumeSVGPaths.volumeHigh2a} />
                  <path d={volumeSVGPaths.volumeHigh2b} />
                  <path d={volumeSVGPaths.volumeHigh3a} />
                  <path d={volumeSVGPaths.volumeHigh3b} />
                </>
              ) : videoIconStateRef.current.from === "" &&
                videoIconStateRef.current.to === "low" ? (
                <>
                  <path d={volumeSVGPaths.volumeLow1a} />
                  <path d={volumeSVGPaths.volumeLow1b} />
                  <path d={volumeSVGPaths.volumeLow2a} />
                  <path d={volumeSVGPaths.volumeLow2b} />
                  <path d={volumeSVGPaths.volumeLow3a} />
                  <path d={volumeSVGPaths.volumeLow3b} />
                </>
              ) : videoIconStateRef.current.from === "" &&
                videoIconStateRef.current.to === "off" ? (
                <>
                  <path d={volumeSVGPaths.volumeOff1a} />
                  <path d={volumeSVGPaths.volumeOff1b} />
                  <path d={volumeSVGPaths.volumeOff2a} />
                  <path d={volumeSVGPaths.volumeOff2b} />
                  <path d={volumeSVGPaths.volumeOff3a} />
                  <path d={volumeSVGPaths.volumeOff3b} />
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
