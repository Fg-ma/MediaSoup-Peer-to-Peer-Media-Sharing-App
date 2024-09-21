import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import {
  useStreamsContext,
  CameraEffectTypes,
  ScreenEffectTypes,
  AudioEffectTypes,
} from "../context/StreamsContext";
import { useCurrentEffectsStylesContext } from "../context/CurrentEffectsStylesContext";
import "./lib/fgVideoStyles.css";
import handleVisualEffect from "../effects/visualEffects/handleVisualEffect";
import Controls from "../fgVideoControls/lib/Controls";
import FgVideoNavigation from "../fgVideoNavigation/FgVideoNavigation";
import FgVideoControls, {
  BackgroundColors,
  BackgroundOpacities,
  CharacterEdgeStyles,
  FontColors,
  FontFamilies,
  FontOpacities,
  FontSizes,
} from "../fgVideoControls/FgVideoControls";
import FgVideoController from "./lib/FgVideoController";
import {
  closedCaptionsSelections,
  expandedClosedCaptionsBrowserSelections,
  expandedClosedCaptionsVoskSelections,
} from "../fgVideoControls/lib/ClosedCaptionsPage";

export interface FgVideoOptions {
  isUser?: boolean;
  acceptsVisualEffects?: boolean;
  acceptsAudioEffects?: boolean;
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

export interface Settings {
  closedCaption: {
    value:
      | keyof typeof closedCaptionsSelections
      | keyof typeof expandedClosedCaptionsVoskSelections
      | keyof typeof expandedClosedCaptionsBrowserSelections;
    closedCaptionOptionsActive: {
      value: "";
      fontFamily: { value: FontFamilies };
      fontColor: { value: FontColors };
      fontOpacity: { value: FontOpacities };
      fontSize: { value: FontSizes };
      backgroundColor: { value: BackgroundColors };
      backgroundOpacity: { value: BackgroundOpacities };
      characterEdgeStyle: { value: CharacterEdgeStyles };
    };
  };
}

export const defaultFgVideoOptions = {
  isUser: false,
  acceptsVisualEffects: false,
  acceptsAudioEffects: false,
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
  bundleRef,
  videoStream,
  audioStream,
  audioRef,
  clientMute,
  localMute,
  videoStyles,
  options,
  handleAudioEffectChange,
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
  bundleRef: React.RefObject<HTMLDivElement>;
  videoStream?: MediaStream;
  audioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  videoStyles?: React.CSSProperties;
  options?: FgVideoOptions;
  handleAudioEffectChange: (effect: AudioEffectTypes) => Promise<void>;
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

  const { userMedia, userStreamEffects, remoteStreamEffects } =
    useStreamsContext();
  const { currentEffectsStyles, remoteCurrentEffectsStyles } =
    useCurrentEffectsStylesContext();

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

  const playbackSpeedButtonRef = useRef<HTMLButtonElement>(null);

  const totalTimeRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<HTMLDivElement>(null);

  const [captionsActive, setCaptionsActive] = useState(false);

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);
  const thumbnailImgRef = useRef<HTMLImageElement>(null);
  const isScrubbing = useRef(false);
  const thumbnails = useRef<string[]>([]);

  const [settings, setSettings] = useState<Settings>({
    closedCaption: {
      value: "en-US",
      closedCaptionOptionsActive: {
        value: "",
        fontFamily: { value: "K2D" },
        fontColor: { value: "white" },
        fontOpacity: { value: "100%" },
        fontSize: { value: "base" },
        backgroundColor: { value: "black" },
        backgroundOpacity: { value: "75%" },
        characterEdgeStyle: { value: "None" },
      },
    },
  });

  useEffect(() => {
    controls.updateCaptionsStyles();
  }, [settings]);

  const handleVisualEffectChange = async (
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

      if (fgVideoOptions.acceptsVisualEffects) {
        const msg = {
          type: "clientEffectChange",
          table_id: table_id,
          username: username,
          instance: instance,
          producerType: type,
          producerId: videoId,
          effect: effect,
          // @ts-ignore
          effectStyle: currentEffectsStyles.current[type][videoId][effect],
          blockStateChange: blockStateChange,
        };
        socket?.current.emit("message", msg);
      }
    } else if (fgVideoOptions.acceptsVisualEffects) {
      const msg = {
        type: "requestEffectChange",
        table_id: table_id,
        requestedUsername: username,
        requestedInstance: instance,
        requestedProducerType: type,
        requestedProducerId: videoId,
        effect: effect,
        effectStyle:
          // @ts-ignore
          remoteCurrentEffectsStyles.current[username][instance][type][videoId][
            effect
          ],
        blockStateChange: blockStateChange,
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
    bundleRef,
    videoRef,
    audioRef,
    videoContainerRef,
    shiftPressed,
    controlPressed,
    paused,
    wasPaused,
    captionsActive,
    setCaptionsActive,
    settings,
    setSettings,
    timelineContainerRef,
    isScrubbing,
    totalTimeRef,
    currentTimeRef,
    previewImgRef,
    thumbnails,
    thumbnailImgRef,
    10,
    5,
    theater,
    playbackSpeedButtonRef,
    leaveVideoTimer,
    setEffectsActive,
    handleMute,
    handleVisualEffectChange,
    tracksColorSetterCallback
  );

  const fgVideoController = new FgVideoController(
    username,
    instance,
    type,
    videoId,
    controls,
    videoStream,
    remoteStreamEffects,
    currentEffectsStyles,
    remoteCurrentEffectsStyles,
    videoRef,
    videoContainerRef,
    audioRef,
    timelineContainerRef,
    currentTimeRef,
    fgVideoOptions,
    handleVisualEffectChange
  );

  useEffect(() => {
    // Set up initial conditions
    fgVideoController.init();

    socket.current.on("message", fgVideoController.handleMessage);

    if (fgVideoOptions.isFullScreen) {
      document.addEventListener(
        "fullscreenchange",
        controls.handleFullScreenChange
      );
    }

    document.addEventListener("keydown", controls.handleKeyDown);

    document.addEventListener("keyup", controls.handleKeyUp);

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
      socket.current.off("message", fgVideoController.handleMessage);
      if (fgVideoOptions.isFullScreen) {
        document.removeEventListener(
          "fullscreenchange",
          controls.handleFullScreenChange
        );
      }
      document.removeEventListener("keydown", controls.handleKeyDown);
      document.removeEventListener("keyup", controls.handleKeyUp);
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
          ></video>
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
            table_id={table_id}
            username={username}
            instance={instance}
            type={type}
            videoId={videoId}
            controls={controls}
            clientMute={clientMute}
            localMute={localMute}
            videoContainerRef={videoContainerRef}
            audioStream={audioStream}
            audioRef={audioRef}
            currentTimeRef={currentTimeRef}
            totalTimeRef={totalTimeRef}
            playbackSpeedButtonRef={playbackSpeedButtonRef}
            tintColor={tintColor}
            effectsActive={effectsActive}
            settings={settings}
            setSettings={setSettings}
            fgVideoOptions={fgVideoOptions}
            handleVisualEffectChange={handleVisualEffectChange}
            handleAudioEffectChange={handleAudioEffectChange}
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
