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
import FgVideoController from "./lib/FgVideoController";
import {
  closedCaptionsSelections,
  expandedClosedCaptionsBrowserSelections,
  expandedClosedCaptionsVoskSelections,
} from "../fgVideoControls/lib/ClosedCaptionsPage";
import "./lib/fgVideoStyles.css";
import {
  HideBackgroundEffectTypes,
  PostProcessEffects,
} from "../context/currentEffectsStylesContext/typeConstant";
import RotateButton from "./lib/RotateButton";
import PanButton from "./lib/PanButton";
import ScaleButton from "./lib/ScaleButton";

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
  isClosedCaptions?: boolean;
  isPictureInPicture?: boolean;
  isEffects?: boolean;
  isFullScreen?: boolean;
  isClose?: boolean;
  controlsVanishTime?: number;
  closedCaptionsDecoratorColor?: string;
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
  isClosedCaptions: true,
  isPictureInPicture: true,
  isEffects: true,
  isFullScreen: true,
  isClose: true,
  controlsVanishTime: 1250,
  closedCaptionsDecoratorColor: "rgba(30, 30, 30, 0.6)",
  primaryVideoColor: "#f56114",
};

export default function FgVideo({
  socket,
  videoId,
  table_id,
  activeUsername,
  activeInstance,
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
  activeUsername: string | undefined;
  activeInstance: string | undefined;
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

  const {
    userMedia,
    userStreamEffects,
    remoteStreamEffects,
    userDataStreams,
    remoteDataStreams,
  } = useStreamsContext();
  const { currentEffectsStyles, remoteCurrentEffectsStyles } =
    useCurrentEffectsStylesContext();

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [inVideo, setInVideo] = useState(true);

  const leaveVideoTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  const [pausedState, setPausedState] = useState(false);

  const paused = useRef(!fgVideoOptions.autoPlay);

  const [adjustingDimensions, setAdjustingDimensions] = useState(true);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [effectsActive, setEffectsActive] = useState(false);

  const [audioEffectsActive, setAudioEffectsActive] = useState(false);

  const tintColor = useRef("#F56114");

  const currentTimeRef = useRef<HTMLDivElement>(null);

  const [_, setCaptionsActive] = useState(false);

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

  const initTimeOffset = useRef(0);

  const [position, setPosition] = useState({ left: 50, top: 50 });
  const [scale, setScale] = useState({ x: 25, y: 25 });
  const [rotation, setRotation] = useState(0);

  const handleVisualEffectChange = async (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange: boolean = false,
    hideBackgroundStyle?: HideBackgroundEffectTypes,
    hideBackgroundColor?: string,
    postProcessStyle?: PostProcessEffects
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
          // @ts-expect-error: ts can't verify type, videoId, and effect correlate
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
        blockStateChange: blockStateChange,
        data: {
          style:
            // @ts-expect-error: ts can't verify username, instance, type, videoId, and effect correlate
            remoteCurrentEffectsStyles.current[username][instance][type][
              videoId
            ][effect],
          hideBackgroundStyle: hideBackgroundStyle,
          hideBackgroundColor: hideBackgroundColor,
          postProcessStyle: postProcessStyle,
        },
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
    userMedia,
    initTimeOffset
  );

  const fgVideoController = new FgVideoController(
    username,
    instance,
    type,
    videoId,
    controls,
    videoStream,
    setPausedState,
    paused,
    setAdjustingDimensions,
    userMedia,
    remoteStreamEffects,
    currentEffectsStyles,
    remoteCurrentEffectsStyles,
    videoRef,
    videoContainerRef,
    audioRef,
    fgVideoOptions,
    handleVisualEffectChange,
    bundleRef,
    position,
    setPosition,
    scale,
    setScale,
    rotation,
    setRotation
  );

  useEffect(() => {
    // Set up initial conditions
    fgVideoController.init();

    // Listen for messages on socket
    socket.current.on("message", fgVideoController.handleMessage);

    // Request initial catch up data
    if (!fgVideoOptions.isUser && activeUsername && activeInstance) {
      const msg = {
        type: "requestCatchUpData",
        table_id: table_id,
        inquiringUsername: activeUsername,
        inquiringInstance: activeInstance,
        inquiredUsername: username,
        inquiredInstance: instance,
      };
      socket.current.send(msg);
    }

    if (
      !fgVideoOptions.isUser &&
      remoteDataStreams.current[username] &&
      remoteDataStreams.current[username][instance] &&
      remoteDataStreams.current[username][instance].positionScaleRotation
    ) {
      remoteDataStreams.current[username][instance].positionScaleRotation.on(
        "message",
        (message) => {
          const data = JSON.parse(message);

          setPosition(data.position);
          setScale(data.scale);
          setRotation(data.rotation);
        }
      );
    }

    // Add eventlisteners
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

    // Request initial data
    if (!fgVideoOptions.isUser && activeUsername && activeInstance) {
      const msg = {
        type: "requestCatchUpData",
        table_id: table_id,
        inquiringUsername: activeUsername,
        inquiringInstance: activeInstance,
        inquiredUsername: username,
        inquiredInstance: instance,
        inquiredType: type,
        inquiredVideoId: videoId,
      };
      socket.current.send(msg);
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
    controls.updateCaptionsStyles();
  }, [settings]);

  useEffect(() => {
    if (subContainerRef.current && userMedia.current[type][videoId]?.canvas) {
      userMedia.current[type][videoId].canvas.style.position = "absolute";
      userMedia.current[type][videoId].canvas.style.top = "0%";
      subContainerRef.current.appendChild(
        userMedia.current[type][videoId].canvas
      );
    }
  }, [videoId, userMedia]);

  useEffect(() => {
    if (fgVideoOptions.isUser) {
      userDataStreams.current.positionScaleRotation?.send(
        JSON.stringify({
          id: videoId,
          position,
          scale,
          rotation,
        })
      );
    }
  }, [position, scale, rotation]);

  return (
    <div
      ref={videoContainerRef}
      id={`${videoId}_container`}
      className={`video-container ${pausedState ? "paused" : ""} ${
        effectsActive ? "in-effects" : ""
      } ${audioEffectsActive ? "in-effects" : ""} ${
        inVideo ? "in-video" : ""
      } ${
        adjustingDimensions ? "adjusting-dimensions" : ""
      } flex items-center justify-center`}
      style={{
        position: "absolute",
        left: `${position.left}%`,
        top: `${position.top}%`,
        width: `${scale.x}%`,
        height: `${scale.y}%`,
        rotate: `${rotation}deg`,
        transformOrigin: "0% 0%",
      }}
      onMouseEnter={() => controls.handleMouseEnter()}
      onMouseLeave={() => controls.handleMouseLeave()}
    >
      <RotateButton
        dragFunction={fgVideoController.rotateDragFunction}
        bundleRef={bundleRef}
        mouseDownFunction={fgVideoController.adjustmentBtnMouseDownFunction}
        mouseUpFunction={fgVideoController.adjustmentBtnMouseUpFunction}
      />
      <PanButton
        dragFunction={fgVideoController.movementDragFunction}
        bundleRef={bundleRef}
        mouseDownFunction={fgVideoController.adjustmentBtnMouseDownFunction}
        mouseUpFunction={fgVideoController.adjustmentBtnMouseUpFunction}
      />
      <ScaleButton
        dragFunction={fgVideoController.scaleDragFunction}
        bundleRef={bundleRef}
        mouseDownFunction={fgVideoController.adjustmentBtnMouseDownFunction}
        mouseUpFunction={fgVideoController.adjustmentBtnMouseUpFunction}
      />
      <div
        ref={subContainerRef}
        className={`relative flex items-center justify-center text-white font-K2D h-full w-full overflow-hidden rounded-md`}
      >
        <video
          ref={videoRef}
          id={videoId}
          onTimeUpdate={() => controls.timeUpdate()}
          className='main-video w-full h-full absolute top-0 left-0'
          controls={false}
          autoPlay={fgVideoOptions.autoPlay}
          style={{ ...videoStyles, objectFit: "fill" }}
        ></video>
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
          videoContainerRef={videoContainerRef}
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
    </div>
  );
}
