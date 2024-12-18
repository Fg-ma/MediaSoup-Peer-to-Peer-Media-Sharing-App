import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { useSignalContext } from "../context/signalContext/SignalContext";
import FgButton from "../fgElements/fgButton/FgButton";
import FgHoverContentStandard from "../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import volumeSVGPaths from "../fgVolumeElement/lib/volumeSVGPaths";
import FgVolumeElementController from "../fgVolumeElement/lib/FgVolumeElementController";
import VolumeSVG from "../fgVolumeElement/lib/VolumeSVG";
import {
  defaultFgVolumeElementOptions,
  FgVolumeElementControllerMessagesType,
  FgVolumeElementOptions,
} from "./lib/typeConstant";
import "./lib/fgVolumeElement.css";

export default function FgVolumeElement({
  socket,
  table_id,
  username,
  instance,
  isUser,
  audioRef,
  clientMute,
  localMute,
  visualEffectsActive,
  settingsActive,
  options,
  handleMuteCallback,
  handleVolumeSliderCallback,
  tracksColorSetterCallback,
}: {
  socket: React.MutableRefObject<Socket>;
  table_id: string;
  username: string;
  instance: string;
  isUser: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  visualEffectsActive: boolean;
  settingsActive: boolean;
  options?: FgVolumeElementOptions;
  handleMuteCallback?: () => void;
  handleVolumeSliderCallback?: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  tracksColorSetterCallback?: () => void;
}) {
  const fgVolumeElementOptions = {
    ...defaultFgVolumeElementOptions,
    ...options,
  };

  const { signal } = useSignalContext();

  const [active, setActive] = useState(
    fgVolumeElementOptions.initialVolume === "off" ? true : false
  );
  const [volumeState, setVolumeState] = useState({
    from: "",
    to: fgVolumeElementOptions.initialVolume,
  });
  const volumeContainer = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  const fgVolumeElementController = new FgVolumeElementController(
    username,
    instance,
    isUser,
    fgVolumeElementOptions,
    audioRef,
    sliderRef,
    clientMute,
    localMute,
    setActive,
    volumeState,
    setVolumeState,
    tracksColorSetterCallback
  );

  // Initial functions
  useEffect(() => {
    // Set initial volume slider
    fgVolumeElementController.tracksColorSetter();

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

    socket.current.on(
      "message",
      (event: FgVolumeElementControllerMessagesType) =>
        fgVolumeElementController.handleMessage(event)
    );

    // Cleanup event listener on unmount
    return () => {
      socket.current.off(
        "message",
        (event: FgVolumeElementControllerMessagesType) =>
          fgVolumeElementController.handleMessage(event)
      );
    };
  }, []);

  const handleVolumeSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);

    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (!clientMute?.current && !isUser) {
        audioRef.current.muted = volume > 0 ? false : true;
      }
    }

    if (sliderRef.current) {
      sliderRef.current.value = `${volume}`;
    }

    fgVolumeElementController.tracksColorSetter();

    fgVolumeElementController.volumeSliderChangeHandler();

    if (handleVolumeSliderCallback) {
      handleVolumeSliderCallback(event);
    }
  };

  const handleMute = () => {
    if (clientMute.current) {
      return;
    }

    localMute.current = !localMute.current;

    if (!audioRef.current) {
      return;
    }

    if (!isUser) {
      audioRef.current.muted = localMute.current;
    }

    const newVolume = audioRef.current.volume;
    let newVolumeState;
    if (localMute.current || newVolume === 0) {
      newVolumeState = "off";
    } else if (newVolume >= 0.5) {
      newVolumeState = "high";
    } else {
      newVolumeState = "low";
    }

    setVolumeState((prev) => ({ from: prev.to, to: newVolumeState }));

    if (handleMuteCallback !== undefined) {
      handleMuteCallback();
    }
  };

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    const newVolume = audioRef.current.volume;
    let newVolumeState;
    if (localMute.current || newVolume === 0) {
      newVolumeState = "off";
    } else if (newVolume >= 0.5) {
      newVolumeState = "high";
    } else {
      newVolumeState = "low";
    }

    if (volumeState.to !== newVolumeState) {
      setVolumeState((prev) => ({ from: prev.to, to: newVolumeState }));
    }
  }, [localMute.current]);

  useEffect(() => {
    if (!signal) {
      return;
    }

    switch (signal.type) {
      case "localMuteChange":
        if (
          signal.table_id === table_id &&
          signal.username === username &&
          signal.instance === instance
        ) {
          setTimeout(() => {
            fgVolumeElementController.fgVolumeElementSocket.onLocalMuteChange();
          }, 0);
        }
        break;
      default:
        break;
    }
  }, [signal]);

  return (
    <div
      ref={volumeContainer}
      className='volume-container flex items-center justify-center pointer-events-auto'
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
              viewBox='0 0 100.0001 100.00001'
              width={`calc(${fgVolumeElementOptions.iconSize} - 0.75rem)`}
              height={`calc(${fgVolumeElementOptions.iconSize} - 0.75rem)`}
              fill={fgVolumeElementOptions.primaryColor}
            >
              <VolumeSVG
                volumeState={volumeState}
                movingPath={volumeSVGPaths.low.right}
                stationaryPaths={[
                  volumeSVGPaths.high.left,
                  volumeSVGPaths.high.middle,
                ]}
                color={fgVolumeElementOptions.primaryColor}
              />
              {volumeState.from === "" && volumeState.to === "off" && (
                <path d={volumeSVGPaths.strike} />
              )}
            </svg>
          );
        }}
        hoverContent={
          !visualEffectsActive && !settingsActive ? (
            <FgHoverContentStandard
              content={active ? "Unmute (m)" : "Mute (m)"}
              style='dark'
            />
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
