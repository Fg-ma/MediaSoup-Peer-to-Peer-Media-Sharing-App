import React, { Suspense, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { AnimatePresence } from "framer-motion";
import Controls from "./lib/Controls";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/StreamsContext";
import { defaultFgVideoOptions, FgVideoOptions } from "../fgVideo/FgVideo";

const PlayPauseButton = React.lazy(() => import("./lib/PlayPauseButton"));
const FgVolumeElement = React.lazy(
  () => import("../FgVolumeElement/FgVolumeElement")
);
const FullScreenButton = React.lazy(() => import("./lib/FullScreenButton"));
const TheaterButton = React.lazy(() => import("./lib/TheaterButton"));
const PictureInPictureButton = React.lazy(
  () => import("./lib/PictureInPictureButton")
);
const CaptionButton = React.lazy(() => import("./lib/CaptionButton"));
const PlaybackSpeedButton = React.lazy(
  () => import("./lib/PlaybackSpeedButton")
);
const EffectsButton = React.lazy(() => import("./lib/EffectsButton"));
const VisualEffectsSection = React.lazy(
  () => import("../visualEffectsSection/VisualEffectsSection")
);
const AudioEffectsButton = React.lazy(
  () => import("../audioEffectsButton/AudioEffectsButton")
);

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
    event.preventDefault();
    event.stopPropagation();

    if (rightVideoControlsRef.current) {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        rightVideoControlsRef.current.scrollLeft -= event.deltaX / 2;
      } else {
        rightVideoControlsRef.current.scrollLeft -= event.deltaY / 2;
      }
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
            <Suspense fallback={<div>Loading...</div>}>
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
            </Suspense>
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
            <Suspense fallback={<div>Loading...</div>}>
              <PlayPauseButton
                controls={controls}
                effectsActive={effectsActive}
              />
            </Suspense>
          )}
          {(fgVideoOptions.isVolume ?? defaultFgVideoOptions.isPlayPause) && (
            <Suspense fallback={<div>Loading...</div>}>
              <FgVolumeElement
                socket={socket}
                table_id={table_id}
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
            </Suspense>
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
          className='w-max h-10 overflow-x-auto z-10 flex items-center space-x-2 scale-x-[-1] pr-2'
        >
          {(fgVideoOptions.isFullScreen ??
            defaultFgVideoOptions.isFullScreen) && (
            <Suspense fallback={<div>Loading...</div>}>
              <FullScreenButton
                controls={controls}
                effectsActive={effectsActive}
              />
            </Suspense>
          )}
          {(fgVideoOptions.isTheater ?? defaultFgVideoOptions.isTheater) && (
            <Suspense fallback={<div>Loading...</div>}>
              <TheaterButton
                controls={controls}
                effectsActive={effectsActive}
              />
            </Suspense>
          )}
          {(fgVideoOptions.isPictureInPicture ??
            defaultFgVideoOptions.isPictureInPicture) && (
            <Suspense fallback={<div>Loading...</div>}>
              <PictureInPictureButton
                controls={controls}
                effectsActive={effectsActive}
              />
            </Suspense>
          )}
          {(fgVideoOptions.isClosedCaptions ??
            defaultFgVideoOptions.isClosedCaptions) && (
            <Suspense fallback={<div>Loading...</div>}>
              <CaptionButton
                controls={controls}
                effectsActive={effectsActive}
              />
            </Suspense>
          )}
          {(fgVideoOptions.isPlaybackSpeed ??
            defaultFgVideoOptions.isPlaybackSpeed) && (
            <Suspense fallback={<div>Loading...</div>}>
              <PlaybackSpeedButton
                controls={controls}
                effectsActive={effectsActive}
                playbackSpeedButtonRef={playbackSpeedButtonRef}
              />
            </Suspense>
          )}
          {(fgVideoOptions.isUser || fgVideoOptions.acceptsVisualEffects) &&
            (fgVideoOptions.isEffects ?? defaultFgVideoOptions.isEffects) && (
              <Suspense fallback={<div>Loading...</div>}>
                <EffectsButton
                  controls={controls}
                  effectsActive={effectsActive}
                />
              </Suspense>
            )}
          {(fgVideoOptions.isUser || fgVideoOptions.acceptsVisualEffects) &&
            fgVideoOptions.isVolume && (
              <Suspense fallback={<div>Loading...</div>}>
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
                  style={{ transform: "scaleX(-1)" }}
                />
              </Suspense>
            )}
        </div>
      </div>
    </div>
  );
}
