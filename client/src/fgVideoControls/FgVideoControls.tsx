import { AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import Controls from "./lib/Controls";
import { EffectTypes } from "../context/StreamsContext";
import EffectSection from "../effectSection/EffectSection";
import VolumeSection from "../fgVideo/VolumeSection";
import FullScreenButton from "./lib/FullScreenButton";
import PictureInPictureButton from "./lib/PictureInPictureButton";
import EffectsButton from "./lib/EffectsButton";

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
    effect: EffectTypes,
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
}) {
  const [effectsActive, setEffectsActive] = useState(false);

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
          <button
            onClick={() => controls.handlePausePlay()}
            className='flex items-center justify-center w-10 aspect-square'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='36px'
              viewBox='0 -960 960 960'
              width='36px'
              fill='white'
              className='play-icon'
            >
              <path d='M320-273v-414q0-17 12-28.5t28-11.5q5 0 10.5 1.5T381-721l326 207q9 6 13.5 15t4.5 19q0 10-4.5 19T707-446L381-239q-5 3-10.5 4.5T360-233q-16 0-28-11.5T320-273Z' />
            </svg>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='36px'
              viewBox='0 -960 960 960'
              width='36px'
              fill='white'
              className='pause-icon'
            >
              <path d='M640-200q-33 0-56.5-23.5T560-280v-400q0-33 23.5-56.5T640-760q33 0 56.5 23.5T720-680v400q0 33-23.5 56.5T640-200Zm-320 0q-33 0-56.5-23.5T240-280v-400q0-33 23.5-56.5T320-760q33 0 56.5 23.5T400-680v400q0 33-23.5 56.5T320-200Z' />
            </svg>
          </button>
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
          <EffectsButton
            controls={controls}
            effectsActive={effectsActive}
            setEffectsActive={setEffectsActive}
          />
        )}
        {isPlaybackSpeed && (
          <button
            ref={playbackSpeedButtonRef}
            onClick={() => controls.handlePlaybackSpeed()}
            className='playback-speed-button wide-button text-lg'
          >
            1x
          </button>
        )}
        {isClosedCaptions && (
          <button
            onClick={() => controls.handleClosedCaptions()}
            className='caption-button flex-col items-center justify-center'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='36px'
              viewBox='0 -960 960 960'
              width='36px'
              fill='white'
            >
              <path d='M200-160q-33 0-56.5-23.5T120-240v-480q0-33 23.5-56.5T200-800h560q33 0 56.5 23.5T840-720v480q0 33-23.5 56.5T760-160H200Zm80-200h120q17 0 28.5-11.5T440-400v-20q0-9-6-15t-15-6h-18q-9 0-15 6t-6 15h-80v-120h80q0 9 6 15t15 6h18q9 0 15-6t6-15v-20q0-17-11.5-28.5T400-600H280q-17 0-28.5 11.5T240-560v160q0 17 11.5 28.5T280-360Zm400-240H560q-17 0-28.5 11.5T520-560v160q0 17 11.5 28.5T560-360h120q17 0 28.5-11.5T720-400v-20q0-9-6-15t-15-6h-18q-9 0-15 6t-6 15h-80v-120h80q0 9 6 15t15 6h18q9 0 15-6t6-15v-20q0-17-11.5-28.5T680-600Z' />
            </svg>
            <div className='caption-button-underline'></div>
          </button>
        )}
        {isPictureInPicture && <PictureInPictureButton controls={controls} />}
        {isTheater && (
          <button
            onClick={() => controls.handleTheater()}
            className='flex items-center justify-center'
          >
            <div className='theater-icon h-9 w-9 flex items-center justify-center'>
              <div className='border-3 border-white w-8 h-6 rounded-md'></div>
            </div>
            <div className='exit-theater-icon h-9 w-9 flex items-center justify-center'>
              <div className='border-3 border-white w-8 h-4 rounded-md'></div>
            </div>
          </button>
        )}
        {isFullScreen && <FullScreenButton controls={controls} />}
      </div>
    </div>
  );
}
