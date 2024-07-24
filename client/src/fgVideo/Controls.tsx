import { AnimatePresence } from "framer-motion";
import React from "react";
import EffectSection from "../effectSection/EffectSection";
import VolumeSection from "./VolumeSection";
import effectIcon from "../../public/svgs/effectIcon.svg";
import effectOffIcon from "../../public/svgs/effectOffIcon.svg";
import ControlsLogic from "./lib/ControlsLogic";
import { EffectTypes } from "../context/StreamsContext";

export default function Controls({
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
  controls: ControlsLogic;
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
  return (
    <div className='video-controls-container absolute bottom-0 w-full h-max flex-col items-end justify-center z-20'>
      <div className='relative pointer-events-auto'>
        <AnimatePresence>
          {isEffects && (
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
        <button
          onClick={() => controls.handleEffects()}
          className='flex items-center justify-center w-10 aspect-square relative'
        >
          {isEffects ? (
            <img
              src={effectOffIcon}
              alt='icon'
              style={{ width: "90%", height: "90%" }}
            />
          ) : (
            <img
              src={effectIcon}
              alt='icon'
              style={{ width: "90%", height: "90%" }}
            />
          )}
        </button>
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
        {isPictureInPicture && (
          <button
            onClick={() => controls.handleMiniPlayer()}
            className='flex items-center justify-center'
          >
            <div className='mini-player-icon h-9 w-9 flex items-center justify-center'>
              <div className='border-3 border-white w-8 h-6.5 rounded-md flex justify-end items-end'>
                <div className='bg-white w-3 h-2 rounded-sm mr-0.5 mb-0.5'></div>
              </div>
            </div>
            <div className='exit-mini-player-icon h-9 w-9 flex items-center justify-center'>
              <div className='border-3 border-white w-8 h-6.5 rounded-md flex justify-start items-start'>
                <div className='bg-white w-3 h-2 rounded-sm ml-0.5 mt-0.5'></div>
              </div>
            </div>
          </button>
        )}
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
        {isFullScreen && (
          <button
            onClick={() => controls.handleFullscreen()}
            className='flex items-center justify-center'
          >
            <svg
              className='full-screen-icon'
              xmlns='http://www.w3.org/2000/svg'
              height='36px'
              viewBox='0 -960 960 960'
              width='36px'
              fill='white'
            >
              <path d='M200-200h80q17 0 28.5 11.5T320-160q0 17-11.5 28.5T280-120H160q-17 0-28.5-11.5T120-160v-120q0-17 11.5-28.5T160-320q17 0 28.5 11.5T200-280v80Zm560 0v-80q0-17 11.5-28.5T800-320q17 0 28.5 11.5T840-280v120q0 17-11.5 28.5T800-120H680q-17 0-28.5-11.5T640-160q0-17 11.5-28.5T680-200h80ZM200-760v80q0 17-11.5 28.5T160-640q-17 0-28.5-11.5T120-680v-120q0-17 11.5-28.5T160-840h120q17 0 28.5 11.5T320-800q0 17-11.5 28.5T280-760h-80Zm560 0h-80q-17 0-28.5-11.5T640-800q0-17 11.5-28.5T680-840h120q17 0 28.5 11.5T840-800v120q0 17-11.5 28.5T800-640q-17 0-28.5-11.5T760-680v-80Z' />
            </svg>
            <svg
              className='exit-full-screen-icon'
              xmlns='http://www.w3.org/2000/svg'
              height='36px'
              viewBox='0 -960 960 960'
              width='36px'
              fill='white'
            >
              <path d='M240-240h-80q-17 0-28.5-11.5T120-280q0-17 11.5-28.5T160-320h120q17 0 28.5 11.5T320-280v120q0 17-11.5 28.5T280-120q-17 0-28.5-11.5T240-160v-80Zm480 0v80q0 17-11.5 28.5T680-120q-17 0-28.5-11.5T640-160v-120q0-17 11.5-28.5T680-320h120q17 0 28.5 11.5T840-280q0 17-11.5 28.5T800-240h-80ZM240-720v-80q0-17 11.5-28.5T280-840q17 0 28.5 11.5T320-800v120q0 17-11.5 28.5T280-640H160q-17 0-28.5-11.5T120-680q0-17 11.5-28.5T160-720h80Zm480 0h80q17 0 28.5 11.5T840-680q0 17-11.5 28.5T800-640H680q-17 0-28.5-11.5T640-680v-120q0-17 11.5-28.5T680-840q17 0 28.5 11.5T720-800v80Z' />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
