import React, { useEffect, useRef } from "react";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import "./FgVideoStyles.css";
import { useStreamsContext, EffectTypes } from "../context/StreamsContext";
import handleEffect from "../effects/handleEffect";
import Controls from "../fgVideoControls/lib/Controls";
import FgVideoNavigation from "../fgVideoNavigation/FgVideoNavigation";
import FgVideoControls from "../fgVideoControls/FgVideoControls";

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
  isEffects = true,
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
}: {
  type: "camera" | "screen";
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
  isEffects?: boolean;
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
  producerTransport?: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >;
}) {
  const { userMedia, userStreamEffects } = useStreamsContext();
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
  const stream = userMedia.current.camera[videoId]?.getStream();

  const controls = new Controls(
    socket,
    table_id,
    username,
    type,
    videoId,
    videoContainerRef,
    captions,
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
    leaveVideoTimer,
    controlsVanishTime,
    playbackSpeedButtonRef,
    timelineContainerRef,
    currentTimeRef,
    isScrubbing,
    wasPaused,
    previewImgRef,
    thumbnails,
    thumbnailImgRef,
    totalTimeRef,
    isTimeLine,
    isPreview,
    isThumbnail,
    10,
    5
  );

  const init = () => {
    // Set videoStream as srcObject
    if (
      videoRef.current &&
      isStream &&
      ((isUser && userMedia.current.camera[videoId]) ||
        (!isUser && videoStream))
    ) {
      videoRef.current.srcObject = isUser ? stream : videoStream!;
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
      currentTimeRef.current.textContent = controls.formatDuration(
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
      controls.handleFullScreenChange()
    );

    document.addEventListener("keydown", (event) =>
      controls.handleKeyDown(event)
    );

    document.addEventListener("keyup", (event) => controls.handleKeyUp(event));

    videoRef.current?.addEventListener("loadeddata", () =>
      controls.loadedData()
    );

    videoRef.current?.addEventListener("timeupdate", () =>
      controls.timeUpdate()
    );

    videoContainerRef.current?.addEventListener("mouseenter", () =>
      controls.handleMouseEnter()
    );

    videoContainerRef.current?.addEventListener("mouseleave", () =>
      controls.handleMouseLeave()
    );

    timelineContainerRef.current?.addEventListener("mousemove", (event) =>
      controls.handleTimelineUpdate(event)
    );

    timelineContainerRef.current?.addEventListener("mousedown", (event) =>
      controls.handleScrubbing(event)
    );

    document.addEventListener("mouseup", (event) => {
      if (isScrubbing.current) {
        controls.handleScrubbing(event);
      }
    });

    document.addEventListener("mousemove", (event) => {
      if (isScrubbing.current) {
        controls.handleTimelineUpdate(event);
      }
    });

    videoRef.current?.addEventListener("enterpictureinpicture", () =>
      controls.handlePictureInPicture("enter")
    );

    videoRef.current?.addEventListener("leavepictureinpicture", () =>
      controls.handlePictureInPicture("leave")
    );

    return () => {
      document.removeEventListener("fullscreenchange", () =>
        controls.handleFullScreenChange()
      );
      document.removeEventListener("keydown", (event) =>
        controls.handleKeyDown(event)
      );
      document.removeEventListener("keyup", (event) =>
        controls.handleKeyUp(event)
      );
      videoRef.current?.removeEventListener("loadeddata", () =>
        controls.loadedData()
      );
      videoRef.current?.removeEventListener("timeupdate", () =>
        controls.timeUpdate()
      );
      videoContainerRef.current?.removeEventListener("mouseenter", () =>
        controls.handleMouseEnter()
      );
      videoContainerRef.current?.removeEventListener("mouseleave", () =>
        controls.handleMouseLeave()
      );
      timelineContainerRef.current?.removeEventListener("mousemove", (event) =>
        controls.handleTimelineUpdate(event)
      );
      timelineContainerRef.current?.removeEventListener("mousedown", (event) =>
        controls.handleScrubbing(event)
      );
      document.removeEventListener("mouseup", (event) => {
        if (isScrubbing.current) {
          controls.handleScrubbing(event);
        }
      });
      document.removeEventListener("mousemove", (event) => {
        if (isScrubbing.current) {
          controls.handleTimelineUpdate(event);
        }
      });
      videoRef.current?.removeEventListener("enterpictureinpicture", () =>
        controls.handlePictureInPicture("enter")
      );
      videoRef.current?.removeEventListener("leavepictureinpicture", () =>
        controls.handlePictureInPicture("leave")
      );
    };
  }, []);

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
    blockStateChange: boolean = false
  ) => {
    if (isUser) {
      await handleEffect(
        effect,
        blockStateChange,
        type,
        videoId,
        userMedia,
        userStreamEffects,
        tintColor
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
      {((isUser && stream) || (!isUser && videoStream)) && (
        <>
          <video
            ref={videoRef}
            id={videoId}
            onClick={() => {
              if (isPlayPause) {
                controls.handlePausePlay();
              }
            }}
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
          <FgVideoNavigation
            name={name}
            username={username}
            isClose={isClose}
            controls={controls}
          />
          <FgVideoControls
            videoId={videoId}
            type={type}
            controls={controls}
            videoContainerRef={videoContainerRef}
            audioRef={audioRef}
            videoIconStateRef={videoIconStateRef}
            currentTimeRef={currentTimeRef}
            totalTimeRef={totalTimeRef}
            isFinishedRef={isFinishedRef}
            playbackSpeedButtonRef={playbackSpeedButtonRef}
            changedWhileNotFinishedRef={changedWhileNotFinishedRef}
            handleEffectChange={handleEffectChange}
            handleVolumeSlider={handleVolumeSlider}
            handleMute={handleMute}
            isEffects={isEffects}
            isPlayPause={isPlayPause}
            isCurrentTime={isCurrentTime}
            isVolume={isVolume}
            isSlider={isSlider}
            isTotalTime={isTotalTime}
            isPlaybackSpeed={isPlaybackSpeed}
            isClosedCaptions={isClosedCaptions}
            isPictureInPicture={isPictureInPicture}
            isTheater={isTheater}
            isFullScreen={isFullScreen}
            tintColor={tintColor}
            paths={paths}
          />
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
