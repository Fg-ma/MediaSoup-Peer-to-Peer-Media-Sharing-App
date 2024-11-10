import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { useStreamsContext } from "../context/streamsContext/StreamsContext";
import { useCurrentEffectsStylesContext } from "../context/currentEffectsStylesContext/CurrentEffectsStylesContext";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/streamsContext/typeConstant";
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
import {
  closedCaptionsSelections,
  expandedClosedCaptionsBrowserSelections,
  expandedClosedCaptionsVoskSelections,
} from "../fgVideoControls/lib/ClosedCaptionsPage";
import FgVideoController from "../fgVideo/lib/FgVideoController";

export interface FgVideoOptions {
  isUser?: boolean;
  acceptsVisualEffects?: boolean;
  acceptsAudioEffects?: boolean;
  isStream?: boolean;
  autoPlay?: boolean;
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

export default function FgBabylonCanvas({
  socket,
  videoId,
  table_id,
  username,
  instance,
  name,
  type,
  bundleRef,
  audioStream,
  audioRef,
  clientMute,
  localMute,
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
  audioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  options?: FgVideoOptions;
  handleAudioEffectChange: (effect: AudioEffectTypes) => void;
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

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [inVideo, setInVideo] = useState(true);

  const [pausedState, setPausedState] = useState(false);

  const paused = useRef(fgVideoOptions.autoPlay);

  const leaveVideoTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [effectsActive, setEffectsActive] = useState(false);

  const [audioEffectsActive, setAudioEffectsActive] = useState(false);

  const tintColor = useRef("#F56114");

  const currentTimeRef = useRef<HTMLDivElement>(null);

  const [_, setCaptionsActive] = useState(false);

  const timeUpdateInterval = useRef<NodeJS.Timeout | undefined>(undefined);

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
    if (
      canvasContainerRef.current &&
      userMedia.current[type][videoId]?.canvas
    ) {
      canvasContainerRef.current.appendChild(
        userMedia.current[type][videoId].canvas
      );
    }
  }, [videoId, userMedia]);

  useEffect(() => {
    controls.updateCaptionsStyles();
  }, [settings]);

  const handleVisualEffectChange = async (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange: boolean = false
  ) => {
    if (fgVideoOptions.isUser) {
      controls.handleVisualEffect(effect, blockStateChange);

      if (fgVideoOptions.acceptsVisualEffects) {
        const msg = {
          type: "clientEffectChange",
          table_id: table_id,
          username: username,
          instance: instance,
          producerType: type,
          producerId: videoId,
          effect: effect,
          // @ts-expect-error: ts can't infer type, videoId, and effect are strictly enforces and exist
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
          // @ts-expect-error: ts can't infer type, videoId, and effect are strictly enforces and exist
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
    canvasContainerRef,
    setPausedState,
    inVideo,
    setInVideo,
    shiftPressed,
    controlPressed,
    paused,
    setCaptionsActive,
    settings,
    currentTimeRef,
    leaveVideoTimer,
    setEffectsActive,
    setAudioEffectsActive,
    handleMute,
    handleVisualEffectChange,
    tracksColorSetterCallback,
    tintColor,
    userStreamEffects,
    userMedia
  );

  const fgVideoController = new FgVideoController(
    username,
    instance,
    type,
    videoId,
    controls,
    undefined,
    setPausedState,
    remoteStreamEffects,
    currentEffectsStyles,
    remoteCurrentEffectsStyles,
    videoRef,
    canvasContainerRef,
    audioRef,
    fgVideoOptions,
    handleVisualEffectChange
  );

  useEffect(() => {
    // Set up initial conditions
    fgVideoController.init();

    socket.current.on("message", fgVideoController.handleMessage);

    controls.timeUpdate();
    timeUpdateInterval.current = setInterval(controls.timeUpdate, 1000);

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
      if (timeUpdateInterval.current !== undefined) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = undefined;
      }
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
      ref={canvasContainerRef}
      id={`${videoId}_container`}
      className={`video-container ${fgVideoOptions.autoPlay ? "" : "paused"} ${
        effectsActive ? "in-effects" : ""
      } ${audioEffectsActive ? "in-effects" : ""} ${
        inVideo ? "in-video" : ""
      } relative flex items-center justify-center text-white font-K2D overflow-hidden rounded-md h-[${
        userMedia.current[type][videoId].canvas.height
      }px] w-[${
        userMedia.current[type][videoId].canvas.width
      }px] max-h-[720px] max-w-[1280px]`}
      onMouseEnter={() => controls.handleMouseEnter()}
      onMouseLeave={() => controls.handleMouseLeave()}
    >
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
        pausedState={pausedState}
        clientMute={clientMute}
        localMute={localMute}
        videoContainerRef={canvasContainerRef}
        audioStream={audioStream}
        audioRef={audioRef}
        currentTimeRef={currentTimeRef}
        tintColor={tintColor}
        effectsActive={effectsActive}
        audioEffectsActive={audioEffectsActive}
        setAudioEffectsActive={setAudioEffectsActive}
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
    </div>
  );
}
