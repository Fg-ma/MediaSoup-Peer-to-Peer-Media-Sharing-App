import React, { useEffect, useRef, useState } from "react";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import "./lib/fgVideoStyles.css";
import {
  useStreamsContext,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/StreamsContext";
import handleVisualEffect from "../effects/visualEffects/handleVisualEffect";
import Controls from "../fgVideoControls/lib/Controls";
import FgVideoNavigation from "../fgVideoNavigation/FgVideoNavigation";
import FgVideoControls from "../fgVideoControls/FgVideoControls";
import FgVideoController from "./lib/FgVideoController";

export interface FgVideoOptions {
  isUser?: boolean;
  isStream?: boolean;
  autoPlay?: boolean;
  flipVideo?: boolean;
  isSlider?: boolean;
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
  skipIncrement?: number;
  initialProgressPosition?: number;
  controlsVanishTime?: number;
  timelineBackgroundColor?: string;
  closedCaptionsDecoratorColor?: string;
  timelinePrimaryBackgroundColor?: string;
  timelineSecondaryBackgroundColor?: string;
  primaryVideoColor?: string;
  initialVolume?: "high" | "low" | "off";
}

export const defaultFgVideoOptions = {
  isUser: false,
  isStream: false,
  autoPlay: true,
  flipVideo: false,
  isSlider: true,
  isPlayPause: true,
  isVolume: true,
  isCurrentTime: true,
  isTotalTime: true,
  isPlaybackSpeed: true,
  isClosedCaptions: true,
  isPictureInPicture: true,
  isTheater: true,
  isEffects: true,
  isFullScreen: true,
  isTimeLine: true,
  isSkip: true,
  isThumbnail: true,
  isPreview: true,
  isClose: true,
  skipIncrement: 10,
  initialProgressPosition: 0,
  controlsVanishTime: 1250,
  timelineBackgroundColor: "rgba(150, 150, 150, 0.5)",
  closedCaptionsDecoratorColor: "rgba(30, 30, 30, 0.6)",
  timelinePrimaryBackgroundColor: "#f56114",
  timelineSecondaryBackgroundColor: "rgb(150, 150, 150)",
  primaryVideoColor: "#f56114",
};

export default function FgVideo({
  socket,
  videoId,
  table_id,
  username,
  instance,
  name,
  type,
  isUser,
  clientMute,
  localMute,
  videoStream,
  audioRef,
  videoStyles,
  options,
  handleMute,
  handleMuteCallback,
  handleVolumeSliderCallback,
  tracksColorSetterCallback,
}: {
  socket: React.MutableRefObject<Socket>;
  videoId: string;
  table_id: string;
  username: string;
  instance: string;
  name?: string;
  type: "camera" | "screen";
  isUser: boolean;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  videoStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  videoStyles?: React.CSSProperties;
  options?: FgVideoOptions;
  handleMute: () => void;
  handleMuteCallback: (() => void) | undefined;
  handleVolumeSliderCallback: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  tracksColorSetterCallback: () => void;
}) {
  const fgVideoOptions = {
    ...defaultFgVideoOptions,
    ...options,
  };

  const { userMedia, userStreamEffects } = useStreamsContext();

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const paused = useRef(fgVideoOptions.autoPlay);
  const wasPaused = useRef(false);

  const leaveVideoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [effectsActive, setEffectsActive] = useState(false);
  const tintColor = useRef("#F56114");

  const theater = useRef(false);

  const captions = useRef<TextTrack | undefined>();

  const playbackSpeedButtonRef = useRef<HTMLButtonElement>(null);

  const totalTimeRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<HTMLDivElement>(null);

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);
  const thumbnailImgRef = useRef<HTMLImageElement>(null);
  const isScrubbing = useRef(false);
  const thumbnails = useRef<string[]>([]);

  const handleEffectChange = async (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange: boolean = false
  ) => {
    if (fgVideoOptions.isUser) {
      await handleVisualEffect(
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

  const controls = new Controls(
    socket,
    videoId,
    table_id,
    username,
    instance,
    type,
    fgVideoOptions,
    videoRef,
    videoContainerRef,
    shiftPressed,
    controlPressed,
    paused,
    wasPaused,
    timelineContainerRef,
    isScrubbing,
    totalTimeRef,
    currentTimeRef,
    previewImgRef,
    thumbnails,
    thumbnailImgRef,
    10,
    5,
    captions,
    theater,
    playbackSpeedButtonRef,
    leaveVideoTimer,
    setEffectsActive,
    handleMute,
    handleEffectChange
  );

  const fgVideoController = new FgVideoController(
    videoId,
    type,
    controls,
    videoStream,
    videoRef,
    videoContainerRef,
    audioRef,
    captions,
    timelineContainerRef,
    currentTimeRef,
    fgVideoOptions,
    handleEffectChange
  );

  useEffect(() => {
    // Set up initial conditions
    fgVideoController.init();

    if (fgVideoOptions.isFullScreen) {
      document.addEventListener("fullscreenchange", () =>
        controls.handleFullScreenChange()
      );
    }

    document.addEventListener("keydown", (event) =>
      controls.handleKeyDown(event)
    );

    document.addEventListener("keyup", (event) => controls.handleKeyUp(event));

    document.addEventListener(
      "visibilitychange",
      fgVideoController.handleVisibilityChange
    );

    if (fgVideoOptions.isTimeLine) {
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
    }

    if (fgVideoOptions.isPictureInPicture) {
      videoRef.current?.addEventListener("enterpictureinpicture", () =>
        controls.handlePictureInPicture("enter")
      );

      videoRef.current?.addEventListener("leavepictureinpicture", () =>
        controls.handlePictureInPicture("leave")
      );
    }

    return () => {
      if (fgVideoOptions.isFullScreen) {
        document.removeEventListener("fullscreenchange", () =>
          controls.handleFullScreenChange()
        );
      }
      document.removeEventListener("keydown", (event) =>
        controls.handleKeyDown(event)
      );
      document.removeEventListener("keyup", (event) =>
        controls.handleKeyUp(event)
      );
      document.removeEventListener(
        "visibilitychange",
        fgVideoController.handleVisibilityChange
      );
      if (fgVideoOptions.isTimeLine) {
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
      }
      if (fgVideoOptions.isPictureInPicture) {
        videoRef.current?.removeEventListener("enterpictureinpicture", () =>
          controls.handlePictureInPicture("enter")
        );
        videoRef.current?.removeEventListener("leavepictureinpicture", () =>
          controls.handlePictureInPicture("leave")
        );
      }
    };
  }, []);

  useEffect(() => {
    socket?.current.on("message", fgVideoController.handleMessage);

    // Cleanup event listener on unmount
    return () => {
      socket?.current.off("message", fgVideoController.handleMessage);
    };
  }, []);

  return (
    <div
      ref={videoContainerRef}
      id={`${videoId}_container`}
      className={`video-container ${
        fgVideoOptions.autoPlay ? "" : "paused"
      } relative flex items-center justify-center text-white font-K2D overflow-hidden rounded-md`}
      onMouseEnter={() => controls.handleMouseEnter()}
      onMouseLeave={() => controls.handleMouseLeave()}
    >
      {videoStream && (
        <>
          <video
            ref={videoRef}
            id={videoId}
            onClick={() => {
              if (fgVideoOptions.isPlayPause) {
                controls.handlePausePlay();
              }
            }}
            onLoadedData={() => controls.loadedData()}
            onTimeUpdate={() => controls.timeUpdate()}
            className='main-video w-full z-0'
            controls={false}
            autoPlay={fgVideoOptions.autoPlay}
            style={videoStyles}
          >
            {fgVideoOptions.isClosedCaptions && (
              <track
                kind='captions'
                srcLang='eng'
                src='./subtitles.vtt'
                default
              ></track>
            )}
          </video>
          {fgVideoOptions.isTimeLine && fgVideoOptions.isThumbnail && (
            <img ref={thumbnailImgRef} className='thumbnail-img' />
          )}
          {fgVideoOptions.isTimeLine && (
            <div
              ref={timelineContainerRef}
              className='timeline-container z-20'
              onMouseMove={(event) =>
                controls.handleTimelineUpdate(event as unknown as MouseEvent)
              }
              onMouseDown={(event) =>
                controls.handleScrubbing(event as unknown as MouseEvent)
              }
            >
              <div className='timeline'>
                {fgVideoOptions.isPreview && (
                  <img ref={previewImgRef} className='preview-img shadow-md' />
                )}
                <div className='thumb-indicator'></div>
              </div>
            </div>
          )}
          <FgVideoNavigation
            name={name}
            username={username}
            isClose={fgVideoOptions.isClose}
            controls={controls}
          />
          <FgVideoControls
            socket={socket}
            videoId={videoId}
            username={username}
            instance={instance}
            type={type}
            isUser={isUser}
            controls={controls}
            clientMute={clientMute}
            localMute={localMute}
            videoContainerRef={videoContainerRef}
            audioRef={audioRef}
            currentTimeRef={currentTimeRef}
            totalTimeRef={totalTimeRef}
            playbackSpeedButtonRef={playbackSpeedButtonRef}
            tintColor={tintColor}
            effectsActive={effectsActive}
            fgVideoOptions={fgVideoOptions}
            handleEffectChange={handleEffectChange}
            handleMuteCallback={handleMuteCallback}
            handleVolumeSliderCallback={handleVolumeSliderCallback}
            tracksColorSetterCallback={tracksColorSetterCallback}
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
