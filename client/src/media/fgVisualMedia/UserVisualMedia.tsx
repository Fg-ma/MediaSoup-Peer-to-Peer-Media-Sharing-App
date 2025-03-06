import React, { Suspense, useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../context/effectsContext/typeConstant";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import FgUpperVisualMediaControls from "./lib/fgUpperVisualMediaControls/FgUpperVisualMediaControls";
import FgLowerVisualMediaControls from "./lib/fgLowerVisualMediaControls/FgLowerVisualMediaControls";
import FgVisualMediaController from "./lib/FgVisualMediaController";
import FgLowerVisualMediaController from "./lib/fgLowerVisualMediaControls/lib/FgLowerVisualMediaController";
import FgContentAdjustmentController from "../../elements/fgAdjustmentElements/lib/FgContentAdjustmentControls";
import {
  defaultFgVisualMediaOptions,
  FgVisualMediaOptions,
  Settings,
} from "./lib/typeConstant";
import VisualMediaGradient from "./lib/VisualMediaGradient";
import "./lib/fgVisualMediaStyles.css";
import { AnimatePresence } from "framer-motion";
import VisualEffectsSection from "./lib/visualEffectsSection/VisualEffectsSection";

const VisualMediaAdjustmentButtons = React.lazy(
  () => import("./lib/VisualMediaAdjustmentButtons")
);

export default function UserVisualMedia({
  table_id,
  visualMediaId,
  username,
  instance,
  name,
  type,
  bundleRef,
  audioStream,
  screenAudioStream,
  audioRef,
  clientMute,
  screenAudioClientMute,
  localMute,
  screenAudioLocalMute,
  options,
  handleAudioEffectChange,
  handleMute,
  handleMuteCallback,
  handleVolumeSliderCallback,
  tracksColorSetterCallback,
}: {
  visualMediaId: string;
  table_id: string;
  username: string;
  instance: string;
  name?: string;
  type: "camera" | "screen";
  bundleRef: React.RefObject<HTMLDivElement>;
  audioStream?: MediaStream;
  screenAudioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  clientMute: React.MutableRefObject<boolean>;
  screenAudioClientMute: React.MutableRefObject<{
    [screenAudioId: string]: boolean;
  }>;
  localMute: React.MutableRefObject<boolean>;
  screenAudioLocalMute: React.MutableRefObject<{
    [screenAudioId: string]: boolean;
  }>;
  options?: FgVisualMediaOptions;
  handleAudioEffectChange: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
    effect: AudioEffectTypes
  ) => void;
  handleMute: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined
  ) => void;
  handleMuteCallback:
    | ((
        producerType: "audio" | "screenAudio",
        producerId: string | undefined
      ) => void)
    | undefined;
  handleVolumeSliderCallback: (
    event: React.ChangeEvent<HTMLInputElement>,
    producerType: "audio" | "screenAudio",
    producerId: string | undefined
  ) => void;
  tracksColorSetterCallback: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined
  ) => void;
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
  const { mediasoupSocket, tableSocket } = useSocketContext();

  const visualMediaContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const behindEffectsContainerRef = useRef<HTMLDivElement>(null);
  const frontEffectsContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(document.createElement("video"));
  const panBtnRef = useRef<HTMLButtonElement>(null);

  const [inVisualMedia, setInVisualMedia] = useState(false);

  const leaveVisualMediaTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const visualMediaMovementTimeout = useRef<NodeJS.Timeout | undefined>(
    undefined
  );

  const [pausedState, setPausedState] = useState(false);

  const paused = useRef(!fgVisualMediaOptions.autoPlay);

  const [adjustingDimensions, setAdjustingDimensions] = useState(false);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [visualEffectsActive, setVisualEffectsActive] = useState(false);

  const [audioEffectsActive, setAudioEffectsActive] = useState(false);

  const tintColor = useRef("#d40213");

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

  const aspectRatio = useRef(
    userMedia.current[type][visualMediaId].aspectRatio ?? 1 - 0.01
  );

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>({
    position: { left: 32.5, top: 32.5 },
    scale: {
      x: 35,
      y: 35 / aspectRatio.current,
    },
    rotation: 0,
  });

  const [reactionsPanelActive, setReactionsPanelActive] = useState(false);

  const handleVisualEffectChange = async (
    effect: CameraEffectTypes | ScreenEffectTypes | "clearAll",
    blockStateChange: boolean = false
  ) => {
    if (effect !== "clearAll") {
      fgLowerVisualMediaController.handleVisualEffect(effect, blockStateChange);

      if (
        (type === "camera" &&
          fgVisualMediaOptions.permissions.acceptsCameraEffects) ||
        (type === "screen" &&
          fgVisualMediaOptions.permissions.acceptsScreenEffects)
      ) {
        mediasoupSocket?.current?.sendMessage({
          type: "clientEffectChange",
          header: {
            table_id,
            username,
            instance,
            producerType: type,
            producerId: visualMediaId,
          },
          data: {
            effect: effect,
            effectStyle:
              // @ts-expect-error: ts can't infer type, visualMediaId, and effect are strictly enforces and exist
              userEffectsStyles.current[type][visualMediaId][effect],
            blockStateChange: blockStateChange,
          },
        });
      }
    } else {
      userMedia.current[type][visualMediaId].clearAllEffects();

      mediasoupSocket?.current?.sendMessage({
        type: "clientClearEffects",
        header: {
          table_id,
          username,
          instance,
          producerType: type,
          producerId: visualMediaId,
        },
      });
    }
  };

  const fgContentAdjustmentController = new FgContentAdjustmentController(
    bundleRef,
    positioning,
    setAdjustingDimensions,
    setRerender
  );

  const fgLowerVisualMediaController = new FgLowerVisualMediaController(
    mediasoupSocket,
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
    panBtnRef,
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
    aspectRatio,
    screenAudioStream,
    behindEffectsContainerRef,
    frontEffectsContainerRef,
    tableSocket,
    setReactionsPanelActive
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
    visualMediaMovementTimeout,
    setRerender,
    aspectRatio,
    mediasoupSocket
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

    // Listen for messages on mediasoupSocket
    mediasoupSocket.current?.addMessageListener(
      fgVisualMediaController.handleMessage
    );

    tableSocket.current?.addMessageListener(
      fgVisualMediaController.handleTableMessage
    );

    // Keep video time
    fgLowerVisualMediaController.timeUpdate();
    timeUpdateInterval.current = setInterval(
      fgLowerVisualMediaController.timeUpdate,
      1000
    );

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

    const videoElement = userMedia.current[type][visualMediaId].video;

    if (videoElement) {
      videoElement.addEventListener("loadedmetadata", () =>
        fgVisualMediaController.handleVideoMetadataLoaded(videoElement)
      );
    }

    return () => {
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener()
        )
      );
      positioningListeners.current = {};
      mediasoupSocket.current?.removeMessageListener(
        fgVisualMediaController.handleMessage
      );
      tableSocket.current?.removeMessageListener(
        fgVisualMediaController.handleTableMessage
      );

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
      if (videoElement) {
        videoElement.removeEventListener("loadedmetadata", () =>
          fgVisualMediaController.handleVideoMetadataLoaded(videoElement)
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
          producerId: visualMediaId,
          positioning: positioning.current,
        })
      );
    }
  }, [positioning.current]);

  useEffect(() => {
    if (
      (type === "camera" &&
        fgVisualMediaOptions.permissions.acceptsCameraEffects) ||
      (type === "screen" &&
        fgVisualMediaOptions.permissions.acceptsScreenEffects)
    ) {
      fgVisualMediaController.attachPositioningListeners(
        fgVisualMediaOptions.permissions
      );
    }
  }, [fgVisualMediaOptions.permissions]);

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
      onPointerEnter={() => fgVisualMediaController.handlePointerEnter()}
      onPointerLeave={() => fgVisualMediaController.handlePointerLeave()}
      data-positioning={JSON.stringify(positioning.current)}
    >
      {fgVisualMediaOptions.permissions
        .acceptsPositionScaleRotationManipulation && (
        <Suspense fallback={<div>Loading...</div>}>
          <VisualMediaAdjustmentButtons
            bundleRef={bundleRef}
            panBtnRef={panBtnRef}
            positioning={positioning}
            fgContentAdjustmentController={fgContentAdjustmentController}
            aspectRatio={aspectRatio}
          />
        </Suspense>
      )}
      {adjustingDimensions && (
        <>
          <div className='animated-border-box-glow'></div>
          <div className='animated-border-box'></div>
        </>
      )}
      <div className='w-full h-full absolute top-0 left-0 pointer-events-none'>
        <div
          ref={frontEffectsContainerRef}
          className='w-full h-full relative z-[100] pointer-events-none'
        />
      </div>
      <div className='w-full h-full absolute top-0 left-0 pointer-events-none'>
        <div
          ref={behindEffectsContainerRef}
          className='w-full h-full relative -z-[100] pointer-events-none'
        />
      </div>
      <div
        ref={subContainerRef}
        className='flex relative items-center justify-center text-white font-K2D h-full w-full rounded-md overflow-hidden'
      >
        <AnimatePresence>
          {visualEffectsActive && (
            <Suspense fallback={<div>Loading...</div>}>
              <VisualEffectsSection
                username={username}
                instance={instance}
                type={type}
                visualMediaId={visualMediaId}
                isUser={
                  fgVisualMediaOptions.isUser ??
                  defaultFgVisualMediaOptions.isUser
                }
                acceptsVisualEffects={
                  type === "camera"
                    ? fgVisualMediaOptions.permissions?.acceptsCameraEffects ??
                      defaultFgVisualMediaOptions.permissions
                        .acceptsCameraEffects
                    : fgVisualMediaOptions.permissions?.acceptsScreenEffects ??
                      defaultFgVisualMediaOptions.permissions
                        .acceptsScreenEffects
                }
                handleVisualEffectChange={handleVisualEffectChange}
                tintColor={tintColor}
                visualMediaContainerRef={visualMediaContainerRef}
              />
            </Suspense>
          )}
        </AnimatePresence>
        <FgUpperVisualMediaControls
          name={name}
          username={username}
          fgVisualMediaOptions={fgVisualMediaOptions}
          fgLowerVisualMediaController={fgLowerVisualMediaController}
          reactionsPanelActive={reactionsPanelActive}
          setReactionsPanelActive={setReactionsPanelActive}
        />
        <FgLowerVisualMediaControls
          table_id={table_id}
          username={username}
          instance={instance}
          type={type}
          visualMediaId={visualMediaId}
          fgLowerVisualMediaController={fgLowerVisualMediaController}
          pausedState={pausedState}
          clientMute={clientMute}
          screenAudioClientMute={screenAudioClientMute}
          localMute={localMute}
          screenAudioLocalMute={screenAudioLocalMute}
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
