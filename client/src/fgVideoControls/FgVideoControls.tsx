import { AnimatePresence } from "framer-motion";
import React from "react";
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
  videoId,
  type,
  controls,
  fgVideoOptions,
  videoContainerRef,
  audioRef,
  videoIconStateRef,
  currentTimeRef,
  totalTimeRef,
  isFinishedRef,
  playbackSpeedButtonRef,
  changedWhileNotFinishedRef,
  handleEffectChange,
  handleVolumeSlider,
  handleMute,
  tintColor,
  paths,
  effectsActive,
}: {
  videoId: string;
  type: "camera" | "screen";
  controls: Controls;
  fgVideoOptions: FgVideoOptions;
  videoContainerRef: React.RefObject<HTMLDivElement>;
  audioRef: React.RefObject<HTMLAudioElement>;
  videoIconStateRef: React.MutableRefObject<{
    from: string;
    to: string;
  }>;
  currentTimeRef: React.RefObject<HTMLDivElement>;
  totalTimeRef: React.RefObject<HTMLDivElement>;
  isFinishedRef: React.MutableRefObject<boolean>;
  playbackSpeedButtonRef: React.RefObject<HTMLButtonElement>;
  changedWhileNotFinishedRef: React.MutableRefObject<boolean>;
  handleEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  handleVolumeSlider: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleMute: () => void;
  tintColor: React.MutableRefObject<string>;
  paths: string[][];
  effectsActive: boolean;
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
            audioRef={audioRef}
            handleVolumeSliderCallback={handleVolumeSlider}
            handleMute={handleMute}
            paths={paths}
            videoIconStateRef={videoIconStateRef}
            isFinishedRef={isFinishedRef}
            changedWhileNotFinishedRef={changedWhileNotFinishedRef}
            effectsActive={effectsActive}
            options={{
              isSlider:
                fgVideoOptions.isSlider ?? defaultFgVideoOptions.isSlider,
            }}
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
        {(fgVideoOptions.isEffects ?? defaultFgVideoOptions.isEffects) && (
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
