import React, { Suspense, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { useStreamsContext } from "../context/streamsContext/StreamsContext";
import { useStreamEffectsContext } from "../context/streamEffectsContext/StreamEffectsContext";
import {
  HideBackgroundEffectTypes,
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/streamEffectsContext/typeConstant";
import FgUpperVisualMediaControls from "./lib/fgUpperVisualMediaControls/FgUpperVisualMediaControls";
import FgLowerVisualMediaControls from "./lib/fgLowerVisualMediaControls/FgLowerVisualMediaControls";
import FgVisualMediaController from "./lib/FgVisualMediaController";
import FgLowerVisualMediaController from "./lib/fgLowerVisualMediaControls/lib/FgLowerVisualMediaController";
import FgContentAdjustmentController from "../fgAdjustmentComponents/lib/FgContentAdjustmentControls";
import {
  defaultFgVisualMediaOptions,
  FgVisualMediaOptions,
  Settings,
} from "./lib/typeConstant";
import VisualMediaGradient from "./lib/VisualMediaGradient";
import "./lib/fgVisualMediaStyles.css";

const VisualMediaAdjustmentButtons = React.lazy(
  () => import("./lib/VisualMediaAdjustmentButtons")
);

export default function FgBabylonCanvas({
  socket,
  table_id,
  visualMediaId,
  activeUsername,
  activeInstance,
  username,
  instance,
  name,
  type,
  bundleRef,
  audioStream,
  screenAudioStream,
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
  visualMediaId: string;
  table_id: string;
  activeUsername: string | undefined;
  activeInstance: string | undefined;
  username: string;
  instance: string;
  name?: string;
  type: "camera" | "screen";
  bundleRef: React.RefObject<HTMLDivElement>;
  audioStream?: MediaStream;
  screenAudioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  options?: FgVisualMediaOptions;
  handleAudioEffectChange: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
    effect: AudioEffectTypes
  ) => void;
  handleMute: () => void;
  handleMuteCallback: (() => void) | undefined;
  handleVolumeSliderCallback: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  tracksColorSetterCallback: () => void;
}) {
  const fgVisualMediaOptions = {
    ...defaultFgVisualMediaOptions,
    ...options,
  };

  const { userMedia, userDataStreams, remoteDataStreams } = useStreamsContext();
  const {
    userEffectsStyles,
    remoteEffectsStyles,
    userStreamEffects,
    remoteStreamEffects,
  } = useStreamEffectsContext();

  const visualMediaContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(document.createElement("video"));

  const [inVisualMedia, setInVisualMedia] = useState(false);

  const leaveVisualMediaTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  const [pausedState, setPausedState] = useState(false);

  const paused = useRef(!fgVisualMediaOptions.autoPlay);

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

  const positioningListeners = useRef<{
    [username: string]: {
      [instance: string]: () => void;
    };
  }>({});

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>({
    position: { left: 32.5, top: 32.5 },
    scale: { x: 35, y: 35 },
    rotation: 0,
  });

  const handleVisualEffectChange = async (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange: boolean = false,
    hideBackgroundStyle?: HideBackgroundEffectTypes,
    hideBackgroundColor?: string
  ) => {
    if (fgVisualMediaOptions.isUser) {
      fgLowerVisualMediaController.handleVisualEffect(effect, blockStateChange);

      if (
        (type === "camera" &&
          fgVisualMediaOptions.permissions.acceptsCameraEffects) ||
        (type === "screen" &&
          fgVisualMediaOptions.permissions.acceptsScreenEffects)
      ) {
        const msg = {
          type: "clientEffectChange",
          table_id: table_id,
          username: username,
          instance: instance,
          producerType: type,
          producerId: visualMediaId,
          effect: effect,
          effectStyle:
            // @ts-expect-error: ts can't infer type, visualMediaId, and effect are strictly enforces and exist
            userEffectsStyles.current[type][visualMediaId][effect],
          blockStateChange: blockStateChange,
        };
        socket?.current.emit("message", msg);
      }
    } else if (
      (type === "camera" &&
        fgVisualMediaOptions.permissions.acceptsCameraEffects) ||
      (type === "screen" &&
        fgVisualMediaOptions.permissions.acceptsScreenEffects)
    ) {
      const msg = {
        type: "requestEffectChange",
        table_id: table_id,
        requestedUsername: username,
        requestedInstance: instance,
        requestedProducerType: type,
        requestedProducerId: visualMediaId,
        effect: effect,
        blockStateChange: blockStateChange,
        data: {
          style:
            // @ts-expect-error: ts can't verify username, instance, type, visualMediaId, and effect correlate
            remoteEffectsStyles.current[username][instance][type][
              visualMediaId
            ][effect],
          hideBackgroundStyle: hideBackgroundStyle,
          hideBackgroundColor: hideBackgroundColor,
        },
      };

      socket?.current.emit("message", msg);
    }
  };

  const fgContentAdjustmentController = new FgContentAdjustmentController(
    bundleRef,
    positioning,
    setAdjustingDimensions,
    setRerender
  );

  const fgLowerVisualMediaController = new FgLowerVisualMediaController(
    socket,
    visualMediaId,
    table_id,
    username,
    instance,
    type,
    fgVisualMediaOptions,
    bundleRef,
    videoRef,
    audioRef,
    visualMediaContainerRef,
    setPausedState,
    shiftPressed,
    controlPressed,
    paused,
    setCaptionsActive,
    settings,
    currentTimeRef,
    setVisualEffectsActive,
    setAudioEffectsActive,
    handleMute,
    handleVisualEffectChange,
    tracksColorSetterCallback,
    tintColor,
    userStreamEffects,
    userMedia,
    initTimeOffset,
    fgContentAdjustmentController,
    positioning,
    screenAudioStream
  );

  const fgVisualMediaController = new FgVisualMediaController(
    table_id,
    username,
    instance,
    type,
    visualMediaId,
    fgLowerVisualMediaController,
    undefined,
    positioningListeners,
    positioning,
    setPausedState,
    paused,
    userMedia,
    remoteStreamEffects,
    userEffectsStyles,
    remoteEffectsStyles,
    remoteDataStreams,
    videoRef,
    visualMediaContainerRef,
    audioRef,
    fgVisualMediaOptions,
    handleVisualEffectChange,
    setInVisualMedia,
    leaveVisualMediaTimer,
    setRerender
  );

  useEffect(() => {
    const canvas = userMedia.current[type][visualMediaId].canvas;
    const stream = canvas.captureStream();
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
      };
    }

    // Set up initial conditions
    fgVisualMediaController.init();

    if (
      (type === "camera" &&
        fgVisualMediaOptions.permissions.acceptsCameraEffects) ||
      (type === "screen" &&
        fgVisualMediaOptions.permissions.acceptsScreenEffects)
    ) {
      fgVisualMediaController.attachPositioningListeners();
    }

    // Listen for messages on socket
    socket.current.on("message", fgVisualMediaController.handleMessage);

    // Keep video time
    fgLowerVisualMediaController.timeUpdate();
    timeUpdateInterval.current = setInterval(
      fgLowerVisualMediaController.timeUpdate,
      1000
    );

    // Request initial data
    if (!fgVisualMediaOptions.isUser && activeUsername && activeInstance) {
      const msg = {
        type: "requestCatchUpData",
        table_id: table_id,
        inquiringUsername: activeUsername,
        inquiringInstance: activeInstance,
        inquiredUsername: username,
        inquiredInstance: instance,
        inquiredType: type,
        inquiredProducerId: visualMediaId,
      };
      socket.current.send(msg);
    }

    // Add eventlisteners
    if (fgVisualMediaOptions.isFullScreen) {
      document.addEventListener(
        "fullscreenchange",
        fgLowerVisualMediaController.handleFullScreenChange
      );
    }

    document.addEventListener(
      "keydown",
      fgLowerVisualMediaController.handleKeyDown
    );

    document.addEventListener(
      "keyup",
      fgLowerVisualMediaController.handleKeyUp
    );

    document.addEventListener(
      "visibilitychange",
      fgVisualMediaController.handleVisibilityChange
    );

    if (fgVisualMediaOptions.isPictureInPicture) {
      videoRef.current?.addEventListener("enterpictureinpicture", () =>
        fgLowerVisualMediaController.handlePictureInPicture("enter")
      );

      videoRef.current?.addEventListener("leavepictureinpicture", () =>
        fgLowerVisualMediaController.handlePictureInPicture("leave")
      );
    }

    return () => {
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener()
        )
      );
      socket.current.off("message", fgVisualMediaController.handleMessage);
      if (timeUpdateInterval.current !== undefined) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = undefined;
      }
      if (fgVisualMediaOptions.isFullScreen) {
        document.removeEventListener(
          "fullscreenchange",
          fgLowerVisualMediaController.handleFullScreenChange
        );
      }
      document.removeEventListener(
        "keydown",
        fgLowerVisualMediaController.handleKeyDown
      );
      document.removeEventListener(
        "keyup",
        fgLowerVisualMediaController.handleKeyUp
      );
      document.removeEventListener(
        "visibilitychange",
        fgVisualMediaController.handleVisibilityChange
      );
      if (fgVisualMediaOptions.isPictureInPicture) {
        videoRef.current?.removeEventListener("enterpictureinpicture", () =>
          fgLowerVisualMediaController.handlePictureInPicture("enter")
        );
        videoRef.current?.removeEventListener("leavepictureinpicture", () =>
          fgLowerVisualMediaController.handlePictureInPicture("leave")
        );
      }
    };
  }, []);

  useEffect(() => {
    fgLowerVisualMediaController.updateCaptionsStyles();
  }, [settings]);

  useEffect(() => {
    if (
      subContainerRef.current &&
      userMedia.current[type][visualMediaId]?.canvas
    ) {
      userMedia.current[type][visualMediaId].canvas.style.position = "absolute";
      userMedia.current[type][visualMediaId].canvas.style.top = "0%";
      userMedia.current[type][visualMediaId].canvas.style.left = "0%";
      userMedia.current[type][visualMediaId].canvas.style.width = "100%";
      userMedia.current[type][visualMediaId].canvas.style.height = "100%";
      subContainerRef.current.appendChild(
        userMedia.current[type][visualMediaId].canvas
      );
    }
  }, [visualMediaId, userMedia]);

  useEffect(() => {
    if (
      adjustingDimensions &&
      userDataStreams.current.positionScaleRotation?.readyState === "open"
    ) {
      userDataStreams.current.positionScaleRotation?.send(
        JSON.stringify({
          table_id,
          username,
          instance,
          type: "audio",
          positioning: positioning.current,
        })
      );
    }
  }, [positioning.current]);

  return (
    <div
      ref={visualMediaContainerRef}
      id={`${visualMediaId}_container`}
      className={`visual-media-container ${pausedState ? "paused" : ""} ${
        fgVisualMediaOptions.autoPlay ? "" : "paused"
      } ${visualEffectsActive ? "in-effects" : ""} ${
        audioEffectsActive ? "in-effects" : ""
      } ${inVisualMedia ? "in-visual-media" : ""} ${
        adjustingDimensions
          ? "adjusting-dimensions pointer-events-none"
          : "pointer-events-auto"
      } flex items-center justify-center`}
      style={{
        position: "absolute",
        left: `${positioning.current.position.left}%`,
        top: `${positioning.current.position.top}%`,
        width: `${positioning.current.scale.x}%`,
        height: `${positioning.current.scale.y}%`,
        rotate: `${positioning.current.rotation}deg`,
        transformOrigin: "0% 0%",
      }}
      onMouseEnter={() => fgVisualMediaController.handleMouseEnter()}
      onMouseLeave={() => fgVisualMediaController.handleMouseLeave()}
      data-positioning={JSON.stringify(positioning.current)}
    >
      {(fgVisualMediaOptions.isUser ||
        fgVisualMediaOptions.permissions
          .acceptsPositionScaleRotationManipulation) && (
        <Suspense fallback={<div>Loading...</div>}>
          <VisualMediaAdjustmentButtons
            bundleRef={bundleRef}
            positioning={positioning}
            fgContentAdjustmentController={fgContentAdjustmentController}
          />
        </Suspense>
      )}
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
        <FgUpperVisualMediaControls
          name={name}
          username={username}
          fgVisualMediaOptions={fgVisualMediaOptions}
          fgLowerVisualMediaController={fgLowerVisualMediaController}
        />
        <FgLowerVisualMediaControls
          socket={socket}
          table_id={table_id}
          username={username}
          instance={instance}
          type={type}
          visualMediaId={visualMediaId}
          fgLowerVisualMediaController={fgLowerVisualMediaController}
          pausedState={pausedState}
          clientMute={clientMute}
          localMute={localMute}
          visualMediaContainerRef={visualMediaContainerRef}
          audioStream={audioStream}
          screenAudioStream={screenAudioStream}
          audioRef={audioRef}
          subContainerRef={subContainerRef}
          currentTimeRef={currentTimeRef}
          tintColor={tintColor}
          visualEffectsActive={visualEffectsActive}
          audioEffectsActive={audioEffectsActive}
          setAudioEffectsActive={setAudioEffectsActive}
          settings={settings}
          setSettings={setSettings}
          fgVisualMediaOptions={fgVisualMediaOptions}
          handleVisualEffectChange={handleVisualEffectChange}
          handleAudioEffectChange={handleAudioEffectChange}
          handleMuteCallback={handleMuteCallback}
          handleVolumeSliderCallback={handleVolumeSliderCallback}
          tracksColorSetterCallback={tracksColorSetterCallback}
        />
        <VisualMediaGradient />
      </div>
    </div>
  );
}
