import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { useStreamsContext } from "../context/streamsContext/StreamsContext";
import { useCurrentEffectsStylesContext } from "../context/currentEffectsStylesContext/CurrentEffectsStylesContext";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/streamsContext/typeConstant";
import FgUpperVideoControls from "./lib/fgUpperVideoControls/FgUpperVideoControls";
import FgLowerVideoControls, {
  BackgroundColors,
  BackgroundOpacities,
  CharacterEdgeStyles,
  FontColors,
  FontFamilies,
  FontOpacities,
  FontSizes,
} from "./lib/fgLowerVideoControls/FgLowerVideoControls";
import {
  closedCaptionsSelections,
  expandedClosedCaptionsBrowserSelections,
  expandedClosedCaptionsVoskSelections,
} from "./lib/fgLowerVideoControls/lib/fgSettingsButton/lib/ClosedCaptionsPage";
import FgVideoController from "./lib/FgVideoController";
import { HideBackgroundEffectTypes } from "src/context/currentEffectsStylesContext/typeConstant";
import PanButton from "../fgAdjustmentComponents/PanButton";
import RotateButton from "../fgAdjustmentComponents/RotateButton";
import ScaleButton from "../fgAdjustmentComponents/ScaleButton";
import FgAdjustmentVideoController from "../fgAdjustmentComponents/lib/FgAdjustmentVideoControls";
import FgLowerVideoController from "./lib/fgLowerVideoControls/lib/FgLowerVideoController";

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
  activeUsername,
  activeInstance,
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
  activeUsername: string | undefined;
  activeInstance: string | undefined;
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

  const {
    userMedia,
    userStreamEffects,
    remoteStreamEffects,
    userDataStreams,
    remoteDataStreams,
  } = useStreamsContext();
  const { currentEffectsStyles, remoteCurrentEffectsStyles } =
    useCurrentEffectsStylesContext();

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(document.createElement("video"));

  const [inVideo, setInVideo] = useState(false);

  const leaveVideoTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  const [pausedState, setPausedState] = useState(false);

  const paused = useRef(!fgVideoOptions.autoPlay);

  const [adjustingDimensions, setAdjustingDimensions] = useState(false);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [visualEffectsActive, setVisualEffectsActive] = useState(false);

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

  const initTimeOffset = useRef(0);

  const [_rerender, setRerender] = useState(false);
  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>({
    position: { left: 50, top: 50 },
    scale: { x: 25, y: 25 },
    rotation: 0,
  });

  const handleVisualEffectChange = async (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange: boolean = false,
    hideBackgroundStyle?: HideBackgroundEffectTypes,
    hideBackgroundColor?: string
  ) => {
    if (fgVideoOptions.isUser) {
      fgLowerVideoController.handleVisualEffect(effect, blockStateChange);

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
        blockStateChange: blockStateChange,
        data: {
          style:
            // @ts-expect-error: ts can't verify username, instance, type, videoId, and effect correlate
            remoteCurrentEffectsStyles.current[username][instance][type][
              videoId
            ][effect],
          hideBackgroundStyle: hideBackgroundStyle,
          hideBackgroundColor: hideBackgroundColor,
        },
      };

      socket?.current.emit("message", msg);
    }
  };

  const fgAdjustmentVideoController = new FgAdjustmentVideoController(
    bundleRef,
    positioning,
    setAdjustingDimensions,
    setRerender
  );

  const fgLowerVideoController = new FgLowerVideoController(
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
    setVisualEffectsActive,
    setAudioEffectsActive,
    handleMute,
    handleVisualEffectChange,
    tracksColorSetterCallback,
    tintColor,
    userStreamEffects,
    userMedia,
    initTimeOffset,
    fgAdjustmentVideoController
  );

  const fgVideoController = new FgVideoController(
    username,
    instance,
    type,
    videoId,
    fgLowerVideoController,
    undefined,
    setPausedState,
    paused,
    userMedia,
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
    fgLowerVideoController.updateCaptionsStyles();
  }, [settings]);

  useEffect(() => {
    const canvas = userMedia.current[type][videoId].canvas;
    const stream = canvas.captureStream();
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
      };
    }

    // Set up initial conditions
    fgVideoController.init();

    // Listen for messages on socket
    socket.current.on("message", fgVideoController.handleMessage);

    // Keep video time
    fgLowerVideoController.timeUpdate();
    timeUpdateInterval.current = setInterval(
      fgLowerVideoController.timeUpdate,
      1000
    );

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

          if (
            data.table_id === table_id &&
            data.username === username &&
            data.instance === instance &&
            data.videoId === videoId
          ) {
            positioning.current = data.positioning;
            setRerender((prev) => !prev);
          }
        }
      );
    }

    // Add eventlisteners
    if (fgVideoOptions.isFullScreen) {
      document.addEventListener(
        "fullscreenchange",
        fgLowerVideoController.handleFullScreenChange
      );
    }

    document.addEventListener("keydown", fgLowerVideoController.handleKeyDown);

    document.addEventListener("keyup", fgLowerVideoController.handleKeyUp);

    document.addEventListener(
      "visibilitychange",
      fgVideoController.handleVisibilityChange
    );

    if (fgVideoOptions.isPictureInPicture) {
      videoRef.current?.addEventListener("enterpictureinpicture", () =>
        fgLowerVideoController.handlePictureInPicture("enter")
      );

      videoRef.current?.addEventListener("leavepictureinpicture", () =>
        fgLowerVideoController.handlePictureInPicture("leave")
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
      if (timeUpdateInterval.current !== undefined) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = undefined;
      }
      if (fgVideoOptions.isFullScreen) {
        document.removeEventListener(
          "fullscreenchange",
          fgLowerVideoController.handleFullScreenChange
        );
      }
      document.removeEventListener(
        "keydown",
        fgLowerVideoController.handleKeyDown
      );
      document.removeEventListener("keyup", fgLowerVideoController.handleKeyUp);
      document.removeEventListener(
        "visibilitychange",
        fgVideoController.handleVisibilityChange
      );
      if (fgVideoOptions.isPictureInPicture) {
        videoRef.current?.removeEventListener("enterpictureinpicture", () =>
          fgLowerVideoController.handlePictureInPicture("enter")
        );
        videoRef.current?.removeEventListener("leavepictureinpicture", () =>
          fgLowerVideoController.handlePictureInPicture("leave")
        );
      }
    };
  }, []);

  useEffect(() => {
    if (subContainerRef.current && userMedia.current[type][videoId]?.canvas) {
      userMedia.current[type][videoId].canvas.style.position = "absolute";
      userMedia.current[type][videoId].canvas.style.top = "0%";
      userMedia.current[type][videoId].canvas.style.left = "0%";
      userMedia.current[type][videoId].canvas.style.width = "100%";
      userMedia.current[type][videoId].canvas.style.height = "100%";
      subContainerRef.current.appendChild(
        userMedia.current[type][videoId].canvas
      );
    }
  }, [videoId, userMedia]);

  useEffect(() => {
    if (fgVideoOptions.isUser) {
      userDataStreams.current.positionScaleRotation?.send(
        JSON.stringify({
          table_id,
          username,
          instance,
          videoId,
          positioning: positioning.current,
        })
      );
    }
  }, [positioning.current]);

  return (
    <div
      ref={canvasContainerRef}
      id={`${videoId}_container`}
      className={`video-container ${pausedState ? "paused" : ""} ${
        fgVideoOptions.autoPlay ? "" : "paused"
      } ${visualEffectsActive ? "in-effects" : ""} ${
        audioEffectsActive ? "in-effects" : ""
      } ${inVideo ? "in-video" : ""} ${
        adjustingDimensions
          ? "adjusting-dimensions pointer-events-none"
          : "pointer-events-auto"
      } flex items-center justify-center z-10`}
      style={{
        position: "absolute",
        left: `${positioning.current.position.left}%`,
        top: `${positioning.current.position.top}%`,
        width: `${positioning.current.scale.x}%`,
        height: `${positioning.current.scale.y}%`,
        rotate: `${positioning.current.rotation}deg`,
        transformOrigin: "0% 0%",
      }}
      onMouseEnter={() => fgLowerVideoController.handleMouseEnter()}
      onMouseLeave={() => fgLowerVideoController.handleMouseLeave()}
    >
      <RotateButton
        className={
          "rotate-btn absolute left-full bottom-full w-6 aspect-square z-10"
        }
        dragFunction={(_displacement, event) => {
          if (!bundleRef.current) {
            return;
          }

          const box = bundleRef.current.getBoundingClientRect();

          fgAdjustmentVideoController.rotateDragFunction(event, {
            x:
              (positioning.current.position.left / 100) *
                bundleRef.current.clientWidth +
              box.left,
            y:
              (positioning.current.position.top / 100) *
                bundleRef.current.clientHeight +
              box.top,
          });
        }}
        bundleRef={bundleRef}
        mouseDownFunction={
          fgAdjustmentVideoController.adjustmentBtnMouseDownFunction
        }
        mouseUpFunction={
          fgAdjustmentVideoController.adjustmentBtnMouseUpFunction
        }
      />
      <PanButton
        className={
          "pan-btn absolute left-full top-1/2 -translate-y-1/2 w-7 aspect-square z-10 pl-1"
        }
        dragFunction={(displacement) => {
          if (!bundleRef.current) {
            return;
          }

          const angle =
            2 * Math.PI - positioning.current.rotation * (Math.PI / 180);

          const pixelScale = {
            x:
              (positioning.current.scale.x / 100) *
              bundleRef.current.clientWidth,
            y:
              (positioning.current.scale.y / 100) *
              bundleRef.current.clientHeight,
          };

          fgAdjustmentVideoController.movementDragFunction(
            displacement,
            {
              x:
                -15 * Math.cos(angle) -
                pixelScale.x * Math.cos(angle) -
                (pixelScale.y / 2) * Math.cos(Math.PI / 2 - angle),
              y:
                15 * Math.sin(angle) +
                pixelScale.x * Math.sin(angle) -
                (pixelScale.y / 2) * Math.sin(Math.PI / 2 - angle),
            },
            {
              x:
                (positioning.current.position.left / 100) *
                bundleRef.current.clientWidth,
              y:
                (positioning.current.position.top / 100) *
                bundleRef.current.clientHeight,
            }
          );
        }}
        bundleRef={bundleRef}
        mouseDownFunction={() =>
          fgAdjustmentVideoController.adjustmentBtnMouseDownFunction(
            "position",
            { rotationPointPlacement: "topLeft" }
          )
        }
        mouseUpFunction={
          fgAdjustmentVideoController.adjustmentBtnMouseUpFunction
        }
      />
      <ScaleButton
        className={
          "scale-btn absolute left-full top-full w-6 aspect-square z-10 pl-1 pt-1"
        }
        dragFunction={(displacement) => {
          if (!bundleRef.current) {
            return;
          }

          const referencePoint = {
            x:
              (positioning.current.position.left / 100) *
              bundleRef.current.clientWidth,
            y:
              (positioning.current.position.top / 100) *
              bundleRef.current.clientHeight,
          };

          fgAdjustmentVideoController.scaleDragFunction(
            "any",
            displacement,
            referencePoint,
            referencePoint
          );
        }}
        bundleRef={bundleRef}
        mouseDownFunction={() => {
          if (!bundleRef.current) {
            return;
          }

          const referencePoint = {
            x:
              (positioning.current.position.left / 100) *
              bundleRef.current.clientWidth,
            y:
              (positioning.current.position.top / 100) *
              bundleRef.current.clientHeight,
          };

          fgAdjustmentVideoController.adjustmentBtnMouseDownFunction("scale", {
            aspect: "square",
            referencePoint: referencePoint,
            rotationPoint: referencePoint,
          });
        }}
        mouseUpFunction={
          fgAdjustmentVideoController.adjustmentBtnMouseUpFunction
        }
      />
      {adjustingDimensions && (
        <>
          <div className='animated-border-box-glow'></div>
          <div className='animated-border-box'></div>
        </>
      )}
      <div
        ref={subContainerRef}
        className='relative flex items-center justify-center text-white font-K2D h-full w-full rounded-md overflow-hidden'
      >
        <FgUpperVideoControls
          name={name}
          username={username}
          isClose={fgVideoOptions.isClose}
          fgLowerVideoController={fgLowerVideoController}
        />
        <FgLowerVideoControls
          socket={socket}
          table_id={table_id}
          username={username}
          instance={instance}
          type={type}
          videoId={videoId}
          fgLowerVideoController={fgLowerVideoController}
          pausedState={pausedState}
          clientMute={clientMute}
          localMute={localMute}
          videoContainerRef={canvasContainerRef}
          audioStream={audioStream}
          audioRef={audioRef}
          currentTimeRef={currentTimeRef}
          tintColor={tintColor}
          visualEffectsActive={visualEffectsActive}
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
