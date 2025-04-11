import React, { useEffect, useRef, useState } from "react";
import { useSignalContext } from "../context/signalContext/SignalContext";
import { useSocketContext } from "../context/socketContext/SocketContext";
import FgButton from "../elements/fgButton/FgButton";
import FgHoverContentStandard from "../elements/fgHoverContentStandard/FgHoverContentStandard";
import volumeSVGPaths from "../fgVolumeElement/lib/volumeSVGPaths";
import FgVolumeElementController from "../fgVolumeElement/lib/FgVolumeElementController";
import VolumeSVG from "../fgVolumeElement/lib/VolumeSVG";
import {
  defaultFgVolumeElementOptions,
  FgVolumeElementOptions,
} from "./lib/typeConstant";
import "./lib/fgVolumeElement.css";

export default function FgVolumeElement({
  table_id,
  username,
  instance,
  isUser,
  producerType,
  producerId,
  audioRef,
  clientMute,
  screenAudioClientMute,
  localMute,
  screenAudioLocalMute,
  visualEffectsActive,
  settingsActive,
  options,
  handleMuteCallback,
  handleVolumeSliderCallback,
  tracksColorSetterCallback,
}: {
  table_id: string;
  username: string;
  instance: string;
  isUser: boolean;
  producerType: "screenAudio" | "audio";
  producerId: string | undefined;
  audioRef: React.RefObject<HTMLAudioElement>;
  clientMute: React.MutableRefObject<boolean>;
  screenAudioClientMute: React.MutableRefObject<{
    [screenAudioId: string]: boolean;
  }>;
  localMute: React.MutableRefObject<boolean>;
  screenAudioLocalMute: React.MutableRefObject<{
    [screenAudioId: string]: boolean;
  }>;
  visualEffectsActive: boolean;
  settingsActive: boolean;
  options?: FgVolumeElementOptions;
  handleMuteCallback?: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
  ) => void;
  handleVolumeSliderCallback?: (
    event: React.ChangeEvent<HTMLInputElement>,
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
  ) => void;
  tracksColorSetterCallback?: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
  ) => void;
}) {
  const fgVolumeElementOptions = {
    ...defaultFgVolumeElementOptions,
    ...options,
  };

  const { addSignalListener, removeSignalListener } = useSignalContext();
  const { mediasoupSocket } = useSocketContext();

  const [volumeState, setVolumeState] = useState({
    from: "",
    to: fgVolumeElementOptions.initialVolume,
  });
  const volumeContainer = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  const fgVolumeElementController = new FgVolumeElementController(
    table_id,
    username,
    instance,
    producerType,
    producerId,
    isUser,
    fgVolumeElementOptions,
    audioRef,
    sliderRef,
    clientMute,
    screenAudioClientMute,
    localMute,
    screenAudioLocalMute,
    volumeState,
    setVolumeState,
    tracksColorSetterCallback,
  );

  // Initial functions
  useEffect(() => {
    // Set initial volume slider
    fgVolumeElementController.tracksColorSetter();

    volumeContainer.current?.style.setProperty(
      "--volume-slider-width",
      fgVolumeElementOptions.volumeSliderWidth,
    );
    volumeContainer.current?.style.setProperty(
      "--volume-slider-height",
      fgVolumeElementOptions.volumeSliderHeight,
    );
    volumeContainer.current?.style.setProperty(
      "--volume-slider-thumb-size",
      fgVolumeElementOptions.volumeSliderThumbSize,
    );

    mediasoupSocket.current?.addMessageListener(
      fgVolumeElementController.handleMessage,
    );

    addSignalListener(fgVolumeElementController.handleSignalMessages);

    // Cleanup event listener on unmount
    return () => {
      mediasoupSocket.current?.removeMessageListener(
        fgVolumeElementController.handleMessage,
      );
      removeSignalListener(fgVolumeElementController.handleSignalMessages);
    };
  }, []);

  const handleVolumeSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);

    if (producerType === "audio") {
      if (audioRef.current) {
        audioRef.current.volume = volume;
        if (!clientMute.current && !isUser) {
          audioRef.current.muted = volume > 0 ? false : true;
        }
      }
    } else {
      if (producerId) {
        const audioElement = document.getElementById(
          producerId,
        ) as HTMLAudioElement | null;
        if (audioElement) {
          audioElement.volume = volume;
          if (!screenAudioClientMute.current[producerId] && !isUser) {
            audioElement.muted = volume > 0 ? false : true;
          }
        }
      }
    }

    if (sliderRef.current) {
      sliderRef.current.value = `${volume}`;
    }

    fgVolumeElementController.tracksColorSetter();

    fgVolumeElementController.volumeSliderChangeHandler();

    if (handleVolumeSliderCallback) {
      handleVolumeSliderCallback(event, producerType, producerId);
    }
  };

  const handleMute = () => {
    if (handleMuteCallback !== undefined) {
      handleMuteCallback(producerType, producerId);
    }

    if (producerType === "audio") {
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

      if (volumeState.to !== newVolumeState) {
        setVolumeState((prev) => ({ from: prev.to, to: newVolumeState }));
      }
    } else {
      if (!producerId || screenAudioClientMute.current[producerId]) {
        return;
      }

      screenAudioLocalMute.current[producerId] =
        !screenAudioLocalMute.current[producerId];

      const audioElement = document.getElementById(
        producerId,
      ) as HTMLAudioElement | null;

      if (audioElement) {
        if (!isUser) {
          audioElement.muted = screenAudioLocalMute.current[producerId];
        }

        const newVolume = audioElement.volume;
        let newVolumeState;
        if (screenAudioLocalMute.current[producerId] || newVolume === 0) {
          newVolumeState = "off";
        } else if (newVolume >= 0.5) {
          newVolumeState = "high";
        } else {
          newVolumeState = "low";
        }

        if (volumeState.to !== newVolumeState) {
          setVolumeState((prev) => ({ from: prev.to, to: newVolumeState }));
        }
      } else {
        const newVolumeState = screenAudioLocalMute.current[producerId]
          ? "off"
          : "high";

        if (volumeState.to !== newVolumeState) {
          setVolumeState((prev) => ({
            from: prev.to,
            to: newVolumeState,
          }));
        }
      }
    }
  };

  useEffect(() => {
    if (producerType === "audio") {
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
    } else {
      if (!producerId) {
        return;
      }

      const audioElement = document.getElementById(
        producerId,
      ) as HTMLAudioElement | null;

      if (!audioElement) {
        return;
      }

      const newVolume = audioElement.volume;
      let newVolumeState;
      if (screenAudioLocalMute.current[producerId] || newVolume === 0) {
        newVolumeState = "off";
      } else if (newVolume >= 0.5) {
        newVolumeState = "high";
      } else {
        newVolumeState = "low";
      }

      if (volumeState.to !== newVolumeState) {
        setVolumeState((prev) => ({ from: prev.to, to: newVolumeState }));
      }
    }
  }, [localMute.current, screenAudioLocalMute.current[producerId ?? ""]]);

  return (
    <div
      ref={volumeContainer}
      className="flex volume-container pointer-events-auto items-center justify-center"
      style={{ height: `calc(${fgVolumeElementOptions.iconSize} * 2)` }}
    >
      <FgButton
        clickFunction={handleMute}
        contentFunction={() => {
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100.0001 100.00001"
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
              content={
                producerType === "audio"
                  ? audioRef.current?.volume === 0
                    ? "Unmute (m)"
                    : clientMute.current
                      ? "Unmute (m)"
                      : localMute.current
                        ? "Unmute (m)"
                        : "Mute (m)"
                  : producerId
                    ? (
                        document.getElementById(
                          producerId,
                        ) as HTMLAudioElement | null
                      )?.volume === 0
                      ? "Unmute (m)"
                      : screenAudioClientMute.current[producerId]
                        ? "Unmute (m)"
                        : producerId && screenAudioLocalMute.current[producerId]
                          ? "Unmute (m)"
                          : "Mute (m)"
                    : "Mute (m)"
              }
              style="dark"
            />
          ) : undefined
        }
        className="flex relative aspect-square items-center justify-center"
        style={{ width: fgVolumeElementOptions.iconSize }}
      />
      {fgVolumeElementOptions.isSlider && (
        <input
          ref={sliderRef}
          onInput={handleVolumeSlider}
          // prettier-ignore
          className={`volume-slider volume-slider-${producerType}${producerId ? producerId : ""}`}
          type="range"
          min="0"
          max="1"
          step="any"
        />
      )}
    </div>
  );
}
