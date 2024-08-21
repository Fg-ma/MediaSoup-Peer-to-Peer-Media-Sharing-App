import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { AnimatePresence } from "framer-motion";
import Controls from "./lib/Controls";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/StreamsContext";
import VisualEffectsSection from "../visualEffectsSection/VisualEffectsSection";
import FgVolumeElement from "../FgVolumeElement/FgVolumeElement";
import FullScreenButton from "./lib/FullScreenButton";
import PictureInPictureButton from "./lib/PictureInPictureButton";
import EffectsButton from "./lib/EffectsButton";
import CaptionButton from "./lib/CaptionButton";
import PlayPauseButton from "./lib/PlayPauseButton";
import PlaybackSpeedButton from "./lib/PlaybackSpeedButton";
import TheaterButton from "./lib/TheaterButton";
import { defaultFgVideoOptions, FgVideoOptions } from "../fgVideo/FgVideo";
import AudioEffectsButton from "../audioEffectsButton/AudioEffectsButton";

export default function FgVideoControls({
  socket,
  table_id,
  username,
  instance,
  type,
  videoId,
  controls,
  clientMute,
  localMute,
  videoContainerRef,
  audioRef,
  currentTimeRef,
  totalTimeRef,
  playbackSpeedButtonRef,
  tintColor,
  effectsActive,
  fgVideoOptions,
  handleVisualEffectChange,
  handleAudioEffectChange,
  handleMuteCallback,
  handleVolumeSliderCallback,
  tracksColorSetterCallback,
}: {
  socket: React.MutableRefObject<Socket>;
  table_id: string;
  username: string;
  instance: string;
  type: "camera" | "screen";
  videoId: string;
  controls: Controls;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  videoContainerRef: React.RefObject<HTMLDivElement>;
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTimeRef: React.RefObject<HTMLDivElement>;
  totalTimeRef: React.RefObject<HTMLDivElement>;
  playbackSpeedButtonRef: React.RefObject<HTMLButtonElement>;
  tintColor: React.MutableRefObject<string>;
  effectsActive: boolean;
  fgVideoOptions: FgVideoOptions;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  handleAudioEffectChange: (effect: AudioEffectTypes) => Promise<void>;
  handleMuteCallback: (() => void) | undefined;
  handleVolumeSliderCallback: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  tracksColorSetterCallback: () => void;
}) {
  const rightVideoControlsRef = useRef<HTMLDivElement>(null);
  const [rerender, setRerender] = useState(0);

  const handleMessage = (event: any) => {
    if (event.type === "localMuteChange") {
      setRerender((prev) => prev + 1);
    }
  };

  const handleWheel = (event: WheelEvent) => {
    if (rightVideoControlsRef.current) {
      rightVideoControlsRef.current.scrollLeft += event.deltaY;
    }
  };

  useEffect(() => {
    socket.current.on("message", (event) => handleMessage(event));

    rightVideoControlsRef.current?.addEventListener("wheel", handleWheel);

    // Cleanup event listener on unmount
    return () => {
      socket.current.off("message", (event) => handleMessage(event));

      rightVideoControlsRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className='video-controls-container absolute bottom-0 w-full h-max flex-col items-end justify-center z-20'>
      <div className='relative pointer-events-auto'>
        <AnimatePresence>
          {effectsActive && (
            <VisualEffectsSection
              username={username}
              instance={instance}
              type={type}
              videoId={videoId}
              socket={socket}
              isUser={fgVideoOptions.isUser ?? defaultFgVideoOptions.isUser}
              acceptsVisualEffects={
                fgVideoOptions.acceptsVisualEffects ??
                defaultFgVideoOptions.acceptsVisualEffects
              }
              videoContainerRef={videoContainerRef}
              handleVisualEffectChange={handleVisualEffectChange}
              tintColor={tintColor}
            />
          )}
        </AnimatePresence>
      </div>
      <div className='video-controls w-full h-10 flex justify-between'>
        <div
          className='w-max h-10 z-20 flex items-center space-x-2'
          style={{ boxShadow: "20px 0 15px -12px rgba(0, 0, 0, 0.9)" }}
        >
          {(fgVideoOptions.isPlayPause ??
            defaultFgVideoOptions.isPlayPause) && (
            <PlayPauseButton
              controls={controls}
              effectsActive={effectsActive}
            />
          )}
          {(fgVideoOptions.isVolume ?? defaultFgVideoOptions.isPlayPause) && (
            <FgVolumeElement
              socket={socket}
              username={username}
              instance={instance}
              isUser={fgVideoOptions.isUser ?? defaultFgVideoOptions.isUser}
              audioRef={audioRef}
              clientMute={clientMute}
              localMute={localMute}
              effectsActive={effectsActive}
              options={{
                isSlider:
                  fgVideoOptions.isSlider ?? defaultFgVideoOptions.isSlider,
                initialVolume: fgVideoOptions.initialVolume ?? "high",
              }}
              handleMuteCallback={() => {
                if (handleMuteCallback !== undefined) {
                  handleMuteCallback();
                }

                setRerender((prev) => prev + 1);
              }}
              handleVolumeSliderCallback={handleVolumeSliderCallback}
              tracksColorSetterCallback={tracksColorSetterCallback}
            />
          )}
          <div className='duration-container flex items-center gap-1 px-1'>
            {(fgVideoOptions.isCurrentTime ??
              defaultFgVideoOptions.isCurrentTime) && (
              <div ref={currentTimeRef} className='current-time'></div>
            )}
            {(fgVideoOptions.isCurrentTime ??
              defaultFgVideoOptions.isCurrentTime) &&
              (fgVideoOptions.isTotalTime ??
                defaultFgVideoOptions.isTotalTime) &&
              "/"}
            {(fgVideoOptions.isTotalTime ??
              defaultFgVideoOptions.isTotalTime) && (
              <div ref={totalTimeRef} className='total-time'></div>
            )}
          </div>
        </div>
        <div
          ref={rightVideoControlsRef}
          className='w-max h-10 overflow-x-auto z-10 flex items-center space-x-2'
        >
          {(fgVideoOptions.isUser || fgVideoOptions.acceptsVisualEffects) &&
            fgVideoOptions.isVolume && (
              <AudioEffectsButton
                socket={socket}
                username={username}
                instance={instance}
                isUser={fgVideoOptions.isUser ?? defaultFgVideoOptions.isUser}
                handleAudioEffectChange={handleAudioEffectChange}
                handleMute={() => {
                  if (clientMute.current) {
                    return;
                  }

                  localMute.current = !localMute.current;

                  if (!audioRef.current) {
                    return;
                  }

                  if (!fgVideoOptions.isUser) {
                    audioRef.current.muted = localMute.current;
                  }

                  if (handleMuteCallback !== undefined) {
                    handleMuteCallback();
                  }

                  setRerender((prev) => prev + 1);
                }}
                muteStateRef={localMute}
              />
            )}
          {(fgVideoOptions.isUser || fgVideoOptions.acceptsVisualEffects) &&
            (fgVideoOptions.isEffects ?? defaultFgVideoOptions.isEffects) && (
              <EffectsButton
                controls={controls}
                effectsActive={effectsActive}
              />
            )}
          {(fgVideoOptions.isPlaybackSpeed ??
            defaultFgVideoOptions.isPlaybackSpeed) && (
            <PlaybackSpeedButton
              controls={controls}
              effectsActive={effectsActive}
              playbackSpeedButtonRef={playbackSpeedButtonRef}
            />
          )}
          {(fgVideoOptions.isClosedCaptions ??
            defaultFgVideoOptions.isClosedCaptions) && (
            <CaptionButton controls={controls} effectsActive={effectsActive} />
          )}
          {(fgVideoOptions.isPictureInPicture ??
            defaultFgVideoOptions.isPictureInPicture) && (
            <PictureInPictureButton
              controls={controls}
              effectsActive={effectsActive}
            />
          )}
          {(fgVideoOptions.isTheater ?? defaultFgVideoOptions.isTheater) && (
            <TheaterButton controls={controls} effectsActive={effectsActive} />
          )}
          {(fgVideoOptions.isFullScreen ??
            defaultFgVideoOptions.isFullScreen) && (
            <FullScreenButton
              controls={controls}
              effectsActive={effectsActive}
            />
          )}
        </div>
      </div>
    </div>
  );
}
