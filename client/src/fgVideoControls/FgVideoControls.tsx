import React from "react";
import { Socket } from "socket.io-client";
import { AnimatePresence } from "framer-motion";
import Controls from "./lib/Controls";
import {
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

export default function FgVideoControls({
  socket,
  videoId,
  username,
  instance,
  type,
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
  handleEffectChange,
  handleMuteCallback,
  handleVolumeSliderCallback,
  tracksColorSetterCallback,
}: {
  socket: React.MutableRefObject<Socket>;
  videoId: string;
  username: string;
  instance: string;
  type: "camera" | "screen";
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
  handleEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  handleMuteCallback: (() => void) | undefined;
  handleVolumeSliderCallback: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  tracksColorSetterCallback: () => void;
}) {
  return (
    <div className='video-controls-container absolute bottom-0 w-full h-max flex-col items-end justify-center z-20'>
      <div className='relative pointer-events-auto'>
        <AnimatePresence>
          {effectsActive && (
            <VisualEffectsSection
              videoContainerRef={videoContainerRef}
              type={type}
              videoId={videoId}
              handleEffectChange={handleEffectChange}
              tintColor={tintColor}
            />
          )}
        </AnimatePresence>
      </div>
      <div className='video-controls w-full h-10 flex items-center space-x-2'>
        {(fgVideoOptions.isPlayPause ?? defaultFgVideoOptions.isPlayPause) && (
          <PlayPauseButton controls={controls} effectsActive={effectsActive} />
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
            handleMuteCallback={handleMuteCallback}
            handleVolumeSliderCallback={handleVolumeSliderCallback}
            tracksColorSetterCallback={tracksColorSetterCallback}
          />
        )}
        <div className='duration-container flex items-center gap-1 grow'>
          {(fgVideoOptions.isCurrentTime ??
            defaultFgVideoOptions.isCurrentTime) && (
            <div ref={currentTimeRef} className='current-time'></div>
          )}
          {(fgVideoOptions.isCurrentTime ??
            defaultFgVideoOptions.isCurrentTime) &&
            (fgVideoOptions.isTotalTime ?? defaultFgVideoOptions.isTotalTime) &&
            "/"}
          {(fgVideoOptions.isTotalTime ??
            defaultFgVideoOptions.isTotalTime) && (
            <div ref={totalTimeRef} className='total-time'></div>
          )}
        </div>
        {(fgVideoOptions.isUser || fgVideoOptions.acceptsVisualEffects) &&
          (fgVideoOptions.isEffects ?? defaultFgVideoOptions.isEffects) && (
            <EffectsButton controls={controls} effectsActive={effectsActive} />
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
          <FullScreenButton controls={controls} effectsActive={effectsActive} />
        )}
      </div>
    </div>
  );
}
