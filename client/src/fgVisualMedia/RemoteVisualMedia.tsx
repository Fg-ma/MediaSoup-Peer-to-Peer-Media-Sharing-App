import React, { Suspense, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { useEffectsContext } from "../context/effectsContext/EffectsContext";
import {
  HideBackgroundEffectTypes,
  PostProcessEffects,
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/effectsContext/typeConstant";
import FgUpperVisualMediaControls from "./lib/fgUpperVisualMediaControls/FgUpperVisualMediaControls";
import FgLowerVisualMediaControls from "./lib/fgLowerVisualMediaControls/FgLowerVisualMediaControls";
import FgVisualMediaController from "./lib/FgVisualMediaController";
import FgContentAdjustmentController from "../fgAdjustmentComponents/lib/FgContentAdjustmentControls";
import FgLowerVisualMediaController from "./lib/fgLowerVisualMediaControls/lib/FgLowerVisualMediaController";
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

export default function RemoteVisualMedia({
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
  videoStream,
  audioStream,
  screenAudioStream,
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
  table_id: string;
  visualMediaId: string;
  activeUsername: string | undefined;
  activeInstance: string | undefined;
  username: string;
  instance: string;
  name?: string;
  type: "camera" | "screen";
  bundleRef: React.RefObject<HTMLDivElement>;
  videoStream?: MediaStream;
  audioStream?: MediaStream;
  screenAudioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  videoStyles?: React.CSSProperties;
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

  const { userMedia, userDataStreams, remoteDataStreams } = useMediaContext();
  const {
    userEffectsStyles,
    remoteEffectsStyles,
    userStreamEffects,
    remoteStreamEffects,
  } = useEffectsContext();

  const visualMediaContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenAudioRef = useRef<HTMLAudioElement>(null);

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
    hideBackgroundColor?: string,
    postProcessStyle?: PostProcessEffects
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
            // @ts-expect-error: ts can't verify type, visualMediaId, and effect correlate
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
          postProcessStyle: postProcessStyle,
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
    videoStream,
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
    // Set up initial conditions
    fgVisualMediaController.init();

    fgVisualMediaController.attachPositioningListeners();

    // Listen for messages on socket
    socket.current.on("message", fgVisualMediaController.handleMessage);

    // Request initial catch up data
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
      adjustingDimensions &&
      fgVisualMediaOptions.permissions
        .acceptsPositionScaleRotationManipulation &&
      userDataStreams.current.positionScaleRotation?.readyState === "open"
    ) {
      userDataStreams.current.positionScaleRotation?.send(
        JSON.stringify({
          table_id,
          username,
          instance,
          type,
          positioning: positioning.current,
        })
      );
    }
  }, [positioning.current]);

  useEffect(() => {
    if (!screenAudioRef.current || !screenAudioStream) {
      return;
    }

    screenAudioRef.current.srcObject = screenAudioStream;
  }, [screenAudioStream]);

  return (
    <div
      ref={visualMediaContainerRef}
      id={`${visualMediaId}_container`}
      className={`visual-media-container ${pausedState ? "paused" : ""} ${
        visualEffectsActive ? "in-effects" : ""
      } ${audioEffectsActive ? "in-effects" : ""} ${
        inVisualMedia ? "in-visual-media" : ""
      } ${
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
        className='relative flex items-center justify-center text-white font-K2D h-full w-full overflow-hidden rounded-md'
      >
        <video
          ref={videoRef}
          id={visualMediaId}
          onTimeUpdate={() => fgLowerVisualMediaController.timeUpdate()}
          className='main-video w-full h-full absolute top-0 left-0'
          controls={false}
          autoPlay={fgVisualMediaOptions.autoPlay}
          style={{ ...videoStyles, objectFit: "fill" }}
        ></video>
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
      {type === "screen" && screenAudioStream && (
        <audio
          ref={screenAudioRef}
          id={`${visualMediaId}_audio`}
          className='w-0 z-0'
          autoPlay={true}
        ></audio>
      )}
    </div>
  );
}
