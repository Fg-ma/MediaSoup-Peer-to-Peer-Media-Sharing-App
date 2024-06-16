import React, { useEffect, useRef } from "react";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import "./FgVideoStyles.css";
import VolumeSection from "./VolumeSection";
import handleFullscreenChange from "./lib/handleFullscreenChange";
import handlePictureInPicture from "./lib/handlePictureInPicture";
import formatDuration from "./lib/formatDuration";
import loadedData from "./lib/loadedData";
import timeUpdate from "./lib/timeUpdate";
import handleMouseEnter from "./lib/handleMouseEnter";
import handleMouseLeave from "./lib/handleMouseLeave";
import handlePausePlay from "./lib/handlePausePlay";
import handleFullscreen from "./lib/handleFullscreen";
import handleTheater from "./lib/handleTheater";
import handleMiniPlayer from "./lib/handleMiniPlayer";
import handleClosedCaptions from "./lib/handleClosedCaptions";
import handlePlaybackSpeed from "./lib/handlePlaybackSpeed";
import handleScrubbing from "./lib/handleScrubbing";
import handleTimelineUpdate from "./lib/handleTimelineUpdate";
import handleKeyDown from "./lib/handleKeyDown";
import handleKeyUp from "./lib/handleKeyUp";
import { EffectTypes } from "src/context/StreamsContext";
import handleCloseVideo from "./lib/handleCloseVideo";
import EffectSection from "./EffectSection";
import handleEffect from "../effects/handleEffect";

export default function FgVideo({
  type,
  username,
  name,
  table_id,
  socket,
  videoId,
  handleMute,
  videoStream,
  isUser = false,
  isStream = false,
  videoStyles,
  autoPlay = true,
  flipVideo = false,
  isSlider = true,
  skipIncrement = 10,
  initialProgressPosition = 0,
  controlsVanishTime = 1250,
  timelineBackgroundColor = "rgba(150, 150, 150, 0.5)",
  closedCaptionsCecoratorColor = "rgba(30, 30, 30, 0.6)",
  timelinePrimaryBackgroundColor = "#f56114",
  timelineSecondaryBackgroundColor = "rgb(150, 150, 150)",
  primaryVideoColor = "#f56114",
  isPlayPause = true,
  isVolume = true,
  isCurrentTime = true,
  isTotalTime = true,
  isPlaybackSpeed = true,
  isClosedCaptions = true,
  isPictureInPicture = true,
  isTheater = true,
  isFullScreen = true,
  isTimeLine = true,
  isSkip = true,
  isThumbnail = true,
  isPreview = true,
  isClose = true,
  audioRef,
  handleVolumeSlider,
  paths,
  videoIconStateRef,
  isFinishedRef,
  changedWhileNotFinishedRef,
  tracksColorSetter,
  userStreams,
  userUneffectedStreams,
  userStreamEffects,
  userStopStreamEffects,
  producerTransport,
}: {
  type: "webcam" | "screen";
  username: string;
  name?: string;
  table_id: string;
  socket?: React.MutableRefObject<Socket>;
  videoId: string;
  handleMute: () => void;
  videoStream?: MediaStream;
  isUser?: boolean;
  isStream?: boolean;
  videoStyles?: {};
  autoPlay?: boolean;
  flipVideo?: boolean;
  isSlider?: boolean;
  skipIncrement?: number;
  initialProgressPosition?: number;
  controlsVanishTime?: number;
  timelineBackgroundColor?: string;
  closedCaptionsCecoratorColor?: string;
  timelinePrimaryBackgroundColor?: string;
  timelineSecondaryBackgroundColor?: string;
  primaryVideoColor?: string;
  isPlayPause?: boolean;
  isVolume?: boolean;
  isCurrentTime?: boolean;
  isTotalTime?: boolean;
  isPlaybackSpeed?: boolean;
  isClosedCaptions?: boolean;
  isPictureInPicture?: boolean;
  isTheater?: boolean;
  isFullScreen?: boolean;
  isTimeLine?: boolean;
  isSkip?: boolean;
  isThumbnail?: boolean;
  isPreview?: boolean;
  isClose?: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  handleVolumeSlider: (event: React.ChangeEvent<HTMLInputElement>) => void;
  paths: string[][];
  videoIconStateRef: React.MutableRefObject<{
    from: string;
    to: string;
  }>;
  isFinishedRef: React.MutableRefObject<boolean>;
  changedWhileNotFinishedRef: React.MutableRefObject<boolean>;
  tracksColorSetter: () => void;
  blurCameraStream?: (webcamId: string) => Promise<void>;
  userStreams: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>;
  userUneffectedStreams: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>;
  userStreamEffects: React.MutableRefObject<{
    [effectType in EffectTypes]: {
      webcam?:
        | {
            [webcamId: string]: boolean;
          }
        | undefined;
      screen?:
        | {
            [screenId: string]: boolean;
          }
        | undefined;
      audio?: boolean;
    };
  }>;
  userStopStreamEffects: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: () => void;
    };
    screen: {
      [screenId: string]: () => void;
    };
    audio: (() => void) | undefined;
  }>;
  producerTransport?: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >;
}) {
  const paused = useRef(!autoPlay);
  const theater = useRef(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentTimeRef = useRef<HTMLDivElement>(null);
  const totalTimeRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);
  const thumbnailImgRef = useRef<HTMLImageElement>(null);
  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);
  const isScrubbing = useRef(false);
  const wasPaused = useRef(false);
  const leaveVideoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackSpeedButtonRef = useRef<HTMLButtonElement>(null);
  const captions = useRef<TextTrack | undefined>();
  const thumbnails = useRef<string[]>([]);
  const tintColor = useRef("#F56114");

  const init = () => {
    // Set videoStream as srcObject
    if (videoRef.current && isStream && videoStream) {
      videoRef.current.srcObject = videoStream;
    }

    // Set initial track statte
    const volumeSliders =
      videoContainerRef.current?.querySelectorAll(".volume-slider");

    volumeSliders?.forEach((slider) => {
      const sliderElement = slider as HTMLInputElement;
      if (audioRef.current) {
        sliderElement.value = audioRef.current.muted
          ? "0"
          : audioRef.current.volume.toString();
      }
    });
    tracksColorSetter();

    // Get captions and set them to hidden initially
    if (videoRef.current && videoRef.current.textTracks[0]) {
      captions.current = videoRef.current.textTracks[0];
      captions.current.mode = "hidden";
    }

    // Set the initial progress position
    if (timelineContainerRef.current) {
      timelineContainerRef.current.style.setProperty(
        "--progress-position",
        `${initialProgressPosition}`
      );
    }

    // Set the initial current time
    if (currentTimeRef.current) {
      currentTimeRef.current.textContent = formatDuration(
        initialProgressPosition
      );
    }

    // Set the video current time
    if (videoRef.current) {
      videoRef.current.currentTime = initialProgressPosition;
    }

    videoContainerRef.current?.style.setProperty(
      "--timeline-background-color",
      `${timelineBackgroundColor}`
    );
    videoContainerRef.current?.style.setProperty(
      "--closed-captions-decorator-color",
      `${closedCaptionsCecoratorColor}`
    );
    videoContainerRef.current?.style.setProperty(
      "--timeline-primary-background-color",
      `${timelinePrimaryBackgroundColor}`
    );
    videoContainerRef.current?.style.setProperty(
      "--timeline-secondary-background-color",
      `${timelineSecondaryBackgroundColor}`
    );
    videoContainerRef.current?.style.setProperty(
      "--primary-video-color",
      `${primaryVideoColor}`
    );
    videoContainerRef.current?.style.setProperty(
      "--flip-video",
      `${flipVideo ? -1 : 1}`
    );
  };

  useEffect(() => {
    // Set up initial conditions
    init();

    document.addEventListener("fullscreenchange", () =>
      handleFullscreenChange(videoContainerRef)
    );

    document.addEventListener("keydown", (event) =>
      handleKeyDown(
        event,
        videoContainerRef,
        controlPressed,
        shiftPressed,
        isPlayPause,
        paused,
        videoRef,
        isFullScreen,
        isTheater,
        theater,
        isPictureInPicture,
        isVolume,
        handleMute,
        isSkip,
        skipIncrement,
        isClosedCaptions,
        captions
      )
    );

    document.addEventListener("keyup", (event) =>
      handleKeyUp(event, shiftPressed, controlPressed)
    );

    videoRef.current?.addEventListener("loadeddata", () =>
      loadedData(
        videoRef,
        totalTimeRef,
        thumbnails,
        isTimeLine,
        isPreview,
        isThumbnail
      )
    );

    videoRef.current?.addEventListener("timeupdate", () =>
      timeUpdate(videoRef, currentTimeRef, timelineContainerRef)
    );

    videoContainerRef.current?.addEventListener("mouseenter", () =>
      handleMouseEnter(videoContainerRef, leaveVideoTimer)
    );

    videoContainerRef.current?.addEventListener("mouseleave", () =>
      handleMouseLeave(videoContainerRef, leaveVideoTimer, controlsVanishTime)
    );

    timelineContainerRef.current?.addEventListener("mousemove", (event) =>
      handleTimelineUpdate(
        event,
        timelineContainerRef,
        videoRef,
        previewImgRef,
        thumbnails,
        isScrubbing,
        thumbnailImgRef,
        currentTimeRef
      )
    );

    timelineContainerRef.current?.addEventListener("mousedown", (event) =>
      handleScrubbing(
        event,
        timelineContainerRef,
        videoRef,
        currentTimeRef,
        isScrubbing,
        videoContainerRef,
        wasPaused,
        previewImgRef,
        thumbnails,
        thumbnailImgRef
      )
    );

    document.addEventListener("mouseup", (event) => {
      if (isScrubbing.current) {
        handleScrubbing(
          event,
          timelineContainerRef,
          videoRef,
          currentTimeRef,
          isScrubbing,
          videoContainerRef,
          wasPaused,
          previewImgRef,
          thumbnails,
          thumbnailImgRef
        );
      }
    });

    document.addEventListener("mousemove", (event) => {
      if (isScrubbing.current) {
        handleTimelineUpdate(
          event,
          timelineContainerRef,
          videoRef,
          previewImgRef,
          thumbnails,
          isScrubbing,
          thumbnailImgRef,
          currentTimeRef
        );
      }
    });

    videoRef.current?.addEventListener("enterpictureinpicture", () =>
      handlePictureInPicture("enter", videoContainerRef)
    );

    videoRef.current?.addEventListener("leavepictureinpicture", () =>
      handlePictureInPicture("leave", videoContainerRef)
    );

    return () => {
      document.removeEventListener("fullscreenchange", () =>
        handleFullscreenChange(videoContainerRef)
      );
      document.removeEventListener("keydown", (event) =>
        handleKeyDown(
          event,
          videoContainerRef,
          controlPressed,
          shiftPressed,
          isPlayPause,
          paused,
          videoRef,
          isFullScreen,
          isTheater,
          theater,
          isPictureInPicture,
          isVolume,
          handleMute,
          isSkip,
          skipIncrement,
          isClosedCaptions,
          captions
        )
      );
      document.removeEventListener("keyup", (event) =>
        handleKeyUp(event, shiftPressed, controlPressed)
      );
      videoRef.current?.removeEventListener("loadeddata", () =>
        loadedData(
          videoRef,
          totalTimeRef,
          thumbnails,
          isTimeLine,
          isPreview,
          isThumbnail
        )
      );
      videoRef.current?.removeEventListener("timeupdate", () =>
        timeUpdate(videoRef, currentTimeRef, timelineContainerRef)
      );
      videoContainerRef.current?.removeEventListener("mouseenter", () =>
        handleMouseEnter(videoContainerRef, leaveVideoTimer)
      );
      videoContainerRef.current?.removeEventListener("mouseleave", () =>
        handleMouseLeave(videoContainerRef, leaveVideoTimer, controlsVanishTime)
      );
      timelineContainerRef.current?.removeEventListener("mousemove", (event) =>
        handleTimelineUpdate(
          event,
          timelineContainerRef,
          videoRef,
          previewImgRef,
          thumbnails,
          isScrubbing,
          thumbnailImgRef,
          currentTimeRef
        )
      );
      timelineContainerRef.current?.removeEventListener("mousedown", (event) =>
        handleScrubbing(
          event,
          timelineContainerRef,
          videoRef,
          currentTimeRef,
          isScrubbing,
          videoContainerRef,
          wasPaused,
          previewImgRef,
          thumbnails,
          thumbnailImgRef
        )
      );
      document.removeEventListener("mouseup", (event) => {
        if (isScrubbing.current) {
          handleScrubbing(
            event,
            timelineContainerRef,
            videoRef,
            currentTimeRef,
            isScrubbing,
            videoContainerRef,
            wasPaused,
            previewImgRef,
            thumbnails,
            thumbnailImgRef
          );
        }
      });
      document.removeEventListener("mousemove", (event) => {
        if (isScrubbing.current) {
          handleTimelineUpdate(
            event,
            timelineContainerRef,
            videoRef,
            previewImgRef,
            thumbnails,
            isScrubbing,
            thumbnailImgRef,
            currentTimeRef
          );
        }
      });
      videoRef.current?.removeEventListener("enterpictureinpicture", () =>
        handlePictureInPicture("enter", videoContainerRef)
      );
      videoRef.current?.removeEventListener("leavepictureinpicture", () =>
        handlePictureInPicture("leave", videoContainerRef)
      );
    };
  }, [videoStream]);

  useEffect(() => {
    const handleMessage = (event: any) => {
      switch (event.type) {
        case "acceptEffect":
          onAcceptEffect(event);
          break;
        default:
          break;
      }
    };

    socket?.current.on("message", handleMessage);

    // Cleanup event listener on unmount
    return () => {
      socket?.current.off("message", handleMessage);
    };
  }, []);

  const handleEffectChange = async (
    effect: EffectTypes,
    blockStateChange?: boolean
  ) => {
    if (isUser) {
      await handleEffect(
        effect,
        type,
        videoId,
        userStreams,
        userUneffectedStreams,
        userStreamEffects,
        userStopStreamEffects,
        producerTransport,
        tintColor,
        blockStateChange
      );
    } else {
      const msg = {
        type: "requestEffect",
        effect: effect,
        table_id: table_id,
        username: username,
        producerId: videoId,
      };
      socket?.current.emit("message", msg);
    }
  };

  const onAcceptEffect = (event: {
    type: "acceptBlur";
    effect: EffectTypes;
    producerId: string;
  }) => {
    if (videoId === event.producerId) {
      handleEffectChange(event.effect);
    }
  };

  return (
    <div
      ref={videoContainerRef}
      id={`${videoId}_container`}
      className={`video-container ${
        autoPlay ? "" : "paused"
      } relative flex items-center justify-center text-white font-K2D overflow-hidden rounded-md`}
    >
      {videoStream && (
        <>
          <video
            ref={videoRef}
            id={videoId}
            onClick={
              isPlayPause
                ? () => handlePausePlay(paused, videoRef, videoContainerRef)
                : () => {}
            }
            className='main-video w-full z-0'
            controls={false}
            autoPlay={autoPlay}
            style={videoStyles}
          >
            {isClosedCaptions && (
              <track
                kind='captions'
                srcLang='eng'
                src='./subtitles.vtt'
                default
              ></track>
            )}
          </video>
          {isTimeLine && isThumbnail && (
            <img ref={thumbnailImgRef} className='thumbnail-img' />
          )}
          {isTimeLine && (
            <div ref={timelineContainerRef} className='timeline-container z-20'>
              <div className='timeline'>
                {isPreview && (
                  <img ref={previewImgRef} className='preview-img shadow-md' />
                )}
                <div className='thumb-indicator'></div>
              </div>
            </div>
          )}
          <div className='video-navigation-container absolute top-0 w-full h-10 flex items-center justify-center z-20 space-x-2 pl-4 pr-1.5 pt-0.5'>
            <div className='grow text-lg cursor-pointer'>
              {name ? name : username}
            </div>
            {isClose && (
              <button
                onClick={() =>
                  handleCloseVideo(socket, table_id, username, type, videoId)
                }
                className='flex items-center justify-center w-10 aspect-square'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  height='36px'
                  viewBox='0 -960 960 960'
                  width='36px'
                  fill='white'
                >
                  <path d='M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z' />
                </svg>
              </button>
            )}
          </div>
          <div className='video-controls-container absolute bottom-0 w-full h-max flex-col items-end justify-center z-20'>
            <div className='video-controls w-full h-10 flex items-center space-x-2'>
              {isPlayPause && (
                <button
                  onClick={() =>
                    handlePausePlay(paused, videoRef, videoContainerRef)
                  }
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
                {isTotalTime && (
                  <div ref={totalTimeRef} className='total-time'></div>
                )}
              </div>
              <EffectSection
                videoContainerRef={videoContainerRef}
                userStreamEffects={userStreamEffects}
                type={type}
                videoId={videoId}
                handleEffectChange={handleEffectChange}
                tintColor={tintColor}
              />
              {isPlaybackSpeed && (
                <button
                  ref={playbackSpeedButtonRef}
                  onClick={() =>
                    handlePlaybackSpeed(videoRef, playbackSpeedButtonRef)
                  }
                  className='playback-speed-button wide-button text-lg'
                >
                  1x
                </button>
              )}
              {isClosedCaptions && (
                <button
                  onClick={() =>
                    handleClosedCaptions(captions, videoContainerRef)
                  }
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
                  onClick={() => handleMiniPlayer(videoContainerRef, videoRef)}
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
                  onClick={() => handleTheater(theater, videoContainerRef)}
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
                  onClick={() => handleFullscreen(videoContainerRef)}
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
          <div
            className='controls-gradient absolute bottom-0 w-full h-20 z-10'
            style={{
              background: `linear-gradient(to top, rgba(0, 0, 0, .5) -10%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0) 100%)`,
            }}
          ></div>
          <div
            className='controls-gradient absolute top-0 w-full h-20 z-10'
            style={{
              background: `linear-gradient(to bottom, rgba(0, 0, 0, .5) -10%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0) 100%)`,
            }}
          ></div>
        </>
      )}
    </div>
  );
}
