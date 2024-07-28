import { AnimatePresence } from "framer-motion";
import React from "react";
import Controls from "./lib/Controls";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  AudioEffectTypes,
} from "../context/StreamsContext";
import EffectSection from "../effectSection/EffectSection";
import VolumeSection from "./lib/VolumeSection";
import FullScreenButton from "./lib/FullScreenButton";
import PictureInPictureButton from "./lib/PictureInPictureButton";
import EffectsButton from "./lib/EffectsButton";
import CaptionButton from "./lib/CaptionButton";
import PlayPauseButton from "./lib/PlayPauseButton";
import PlaybackSpeedButton from "./lib/PlaybackSpeedButton";
import TheaterButton from "./lib/TheaterButton";

export default function FgVideoControls({
  videoId,
  type,
  controls,
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
  isEffects,
  isPlayPause,
  isCurrentTime,
  isVolume,
  isSlider,
  isTotalTime,
  isPlaybackSpeed,
  isClosedCaptions,
  isPictureInPicture,
  isTheater,
  isFullScreen,
  tintColor,
  paths,
  effectsActive,
}: {
  videoId: string;
  type: "camera" | "screen";
  controls: Controls;
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
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  handleVolumeSlider: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleMute: () => void;
  isEffects: boolean;
  isPlayPause: boolean;
  isCurrentTime: boolean;
  isVolume: boolean;
  isSlider: boolean;
  isTotalTime: boolean;
  isPlaybackSpeed: boolean;
  isClosedCaptions: boolean;
  isPictureInPicture: boolean;
  isTheater: boolean;
  isFullScreen: boolean;
  tintColor: React.MutableRefObject<string>;
  paths: string[][];
  effectsActive: boolean;
}) {
  return (
    <div className='video-controls-container absolute bottom-0 w-full h-max flex-col items-end justify-center z-20'>
      <div className='relative pointer-events-auto'>
        <AnimatePresence>
          {effectsActive && (
            <EffectSection
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
        {isPlayPause && (
          <PlayPauseButton controls={controls} effectsActive={effectsActive} />
        )}
        {isVolume && (
          <VolumeSection
            isSlider={isSlider}
            audioRef={audioRef}
            handleVolumeSlider={handleVolumeSlider}
            handleMute={handleMute}
            paths={paths}
            videoIconStateRef={videoIconStateRef}
            isFinishedRef={isFinishedRef}
            changedWhileNotFinishedRef={changedWhileNotFinishedRef}
            effectsActive={effectsActive}
          />
        )}
        <div className='duration-container flex items-center gap-1 grow'>
          {isCurrentTime && (
            <div ref={currentTimeRef} className='current-time'></div>
          )}
          {isCurrentTime && isTotalTime && "/"}
          {isTotalTime && <div ref={totalTimeRef} className='total-time'></div>}
        </div>
        {isEffects && (
          <EffectsButton controls={controls} effectsActive={effectsActive} />
        )}
        {isPlaybackSpeed && (
          <PlaybackSpeedButton
            controls={controls}
            effectsActive={effectsActive}
            playbackSpeedButtonRef={playbackSpeedButtonRef}
          />
        )}
        {isClosedCaptions && (
          <CaptionButton controls={controls} effectsActive={effectsActive} />
        )}
        {isPictureInPicture && (
          <PictureInPictureButton
            controls={controls}
            effectsActive={effectsActive}
          />
        )}
        {isTheater && (
          <TheaterButton controls={controls} effectsActive={effectsActive} />
        )}
        {isFullScreen && (
          <FullScreenButton controls={controls} effectsActive={effectsActive} />
        )}
      </div>
    </div>
  );
}
