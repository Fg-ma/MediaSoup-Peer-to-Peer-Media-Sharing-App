import React, { Suspense, useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import {
  HideBackgroundEffectTypes,
  PostProcessEffectTypes,
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import { useUserInfoContext } from "../../context/userInfoContext/UserInfoContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import FgUpperVisualMediaControls from "./lib/fgUpperVisualMediaControls/FgUpperVisualMediaControls";
import FgLowerVisualMediaControls from "./lib/fgLowerVisualMediaControls/FgLowerVisualMediaControls";
import FgVisualMediaController from "./lib/FgVisualMediaController";
import FgContentAdjustmentController from "../../elements/fgAdjustmentElements/lib/FgContentAdjustmentControls";
import FgLowerVisualMediaController from "./lib/fgLowerVisualMediaControls/lib/FgLowerVisualMediaController";
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
  () => import("./lib/VisualMediaAdjustmentButtons"),
);

export default function RemoteVisualMedia({
  table_id,
  visualMediaId,
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
  screenAudioClientMute,
  localMute,
  screenAudioLocalMute,
  videoStyles,
  options,
  handleAudioEffectChange,
  handleMute,
  handleMuteCallback,
  handleVolumeSliderCallback,
  tracksColorSetterCallback,
}: {
  table_id: string;
  visualMediaId: string;
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
  screenAudioClientMute: React.MutableRefObject<{
    [screenAudioId: string]: boolean;
  }>;
  localMute: React.MutableRefObject<boolean>;
  screenAudioLocalMute: React.MutableRefObject<{
    [screenAudioId: string]: boolean;
  }>;
  videoStyles?: React.CSSProperties;
  options?: FgVisualMediaOptions;
  handleAudioEffectChange: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
    effect: AudioEffectTypes,
  ) => void;
  handleMute: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
  ) => void;
  handleMuteCallback:
    | ((
        producerType: "audio" | "screenAudio",
        producerId: string | undefined,
      ) => void)
    | undefined;
  handleVolumeSliderCallback: (
    event: React.ChangeEvent<HTMLInputElement>,
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
  ) => void;
  tracksColorSetterCallback: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
  ) => void;
}) {
  const fgVisualMediaOptions = {
    ...defaultFgVisualMediaOptions,
    ...options,
  };

  const { userMedia, userDataStreams, remoteDataStreams } = useMediaContext();
  const { userEffectsStyles, remoteEffectsStyles, userEffects, remoteEffects } =
    useEffectsContext();
  const { mediasoupSocket, tableSocket } = useSocketContext();
  const { username: activeUsername, instance: activeInstance } =
    useUserInfoContext();

  const visualMediaContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenAudioRef = useRef<HTMLAudioElement>(null);
  const panBtnRef = useRef<HTMLButtonElement>(null);
  const behindEffectsContainerRef = useRef<HTMLDivElement>(null);
  const frontEffectsContainerRef = useRef<HTMLDivElement>(null);

  const [inVisualMedia, setInVisualMedia] = useState(false);

  const leaveVisualMediaTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const visualMediaMovementTimeout = useRef<NodeJS.Timeout | undefined>(
    undefined,
  );

  const [pausedState, setPausedState] = useState(false);

  const paused = useRef(!fgVisualMediaOptions.autoPlay);

  const [adjustingDimensions, setAdjustingDimensions] = useState(false);

  const [visualEffectsActive, setVisualEffectsActive] = useState(false);

  const [audioEffectsActive, setAudioEffectsActive] = useState(false);

  const tintColor = useRef("#d40213");

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
    scale: {
      x: 35,
      y: 35,
    },
    rotation: 0,
  });

  const aspectRatio = useRef(0);

  const [reactionsPanelActive, setReactionsPanelActive] = useState(false);

  const handleVisualEffectChange = async (
    effect: CameraEffectTypes | ScreenEffectTypes | "clearAll",
    blockStateChange: boolean = false,
    hideBackgroundStyle?: HideBackgroundEffectTypes,
    hideBackgroundColor?: string,
    postProcessStyle?: PostProcessEffectTypes,
  ) => {
    if (
      (type === "camera" &&
        fgVisualMediaOptions.permissions.acceptsCameraEffects) ||
      (type === "screen" &&
        fgVisualMediaOptions.permissions.acceptsScreenEffects)
    ) {
      if (effect !== "clearAll") {
        mediasoupSocket?.current?.sendMessage({
          type: "requestEffectChange",
          header: {
            table_id,
            requestedUsername: username,
            requestedInstance: instance,
            requestedProducerType: type,
            requestedProducerId: visualMediaId,
          },
          data: {
            effect: effect,
            blockStateChange: blockStateChange,
            style:
              // @ts-expect-error: ts can't verify username, instance, type, visualMediaId, and effect correlate
              remoteEffectsStyles.current[username][instance][type][
                visualMediaId
              ][effect],
            hideBackgroundStyle: hideBackgroundStyle,
            hideBackgroundColor: hideBackgroundColor,
            postProcessStyle: postProcessStyle,
          },
        });
      } else {
        mediasoupSocket?.current?.sendMessage({
          type: "requestClearEffects",
          header: {
            table_id,
            requestedUsername: username,
            requestedInstance: instance,
            requestedProducerType: type,
            requestedProducerId: visualMediaId,
          },
        });
      }
    }
  };

  const fgContentAdjustmentController = new FgContentAdjustmentController(
    bundleRef,
    positioning,
    setAdjustingDimensions,
    setRerender,
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
    userEffects,
    userMedia,
    initTimeOffset,
    fgContentAdjustmentController,
    positioning,
    aspectRatio,
    screenAudioStream,
    behindEffectsContainerRef,
    frontEffectsContainerRef,
    tableSocket,
    setReactionsPanelActive,
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
    remoteEffects,
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
    mediasoupSocket,
  );

  useEffect(() => {
    // Set up initial conditions
    fgVisualMediaController.init();

    // Listen for messages on mediasoupSocket
    mediasoupSocket.current?.addMessageListener(
      fgVisualMediaController.handleMediasoupMessage,
    );

    tableSocket.current?.addMessageListener(
      fgVisualMediaController.handleTableMessage,
    );

    // Request initial catch up data
    if (activeUsername.current && activeInstance.current) {
      mediasoupSocket.current?.sendMessage({
        type: "requestCatchUpData",
        header: {
          table_id,
          inquiringUsername: activeUsername.current,
          inquiringInstance: activeInstance.current,
          inquiredUsername: username,
          inquiredInstance: instance,
          inquiredType: type,
          inquiredProducerId: visualMediaId,
        },
      });
    }

    // Add eventlisteners
    if (fgVisualMediaOptions.isFullScreen) {
      document.addEventListener(
        "fullscreenchange",
        fgLowerVisualMediaController.handleFullScreenChange,
      );
    }

    document.addEventListener(
      "keydown",
      fgLowerVisualMediaController.handleKeyDown,
    );

    document.addEventListener(
      "visibilitychange",
      fgVisualMediaController.handleVisibilityChange,
    );

    if (fgVisualMediaOptions.isPictureInPicture) {
      videoRef.current?.addEventListener("enterpictureinpicture", () =>
        fgLowerVisualMediaController.handlePictureInPicture("enter"),
      );

      videoRef.current?.addEventListener("leavepictureinpicture", () =>
        fgLowerVisualMediaController.handlePictureInPicture("leave"),
      );
    }

    const videoElement = videoRef.current;

    if (videoElement) {
      videoElement.addEventListener("loadedmetadata", () =>
        fgVisualMediaController.handleVideoMetadataLoaded(videoElement),
      );
    }

    return () => {
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener(),
        ),
      );
      positioningListeners.current = {};
      mediasoupSocket.current?.removeMessageListener(
        fgVisualMediaController.handleMediasoupMessage,
      );
      tableSocket.current?.removeMessageListener(
        fgVisualMediaController.handleTableMessage,
      );
      if (fgVisualMediaOptions.isFullScreen) {
        document.removeEventListener(
          "fullscreenchange",
          fgLowerVisualMediaController.handleFullScreenChange,
        );
      }
      document.removeEventListener(
        "keydown",
        fgLowerVisualMediaController.handleKeyDown,
      );
      document.removeEventListener(
        "visibilitychange",
        fgVisualMediaController.handleVisibilityChange,
      );
      if (fgVisualMediaOptions.isPictureInPicture) {
        videoRef.current?.removeEventListener("enterpictureinpicture", () =>
          fgLowerVisualMediaController.handlePictureInPicture("enter"),
        );
        videoRef.current?.removeEventListener("leavepictureinpicture", () =>
          fgLowerVisualMediaController.handlePictureInPicture("leave"),
        );
      }
      if (videoElement) {
        videoElement.removeEventListener("loadedmetadata", () =>
          fgVisualMediaController.handleVideoMetadataLoaded(videoElement),
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
          producerId: visualMediaId,
          positioning: positioning.current,
        }),
      );
    }
  }, [positioning.current]);

  useEffect(() => {
    if (!screenAudioRef.current || !screenAudioStream) {
      return;
    }

    screenAudioRef.current.srcObject = screenAudioStream;
  }, [screenAudioStream]);

  useEffect(() => {
    fgVisualMediaController.attachPositioningListeners(
      fgVisualMediaOptions.permissions,
    );
  }, [fgVisualMediaOptions.permissions]);

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
          <div className="animated-border-box-glow"></div>
          <div className="animated-border-box"></div>
        </>
      )}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full">
        <div
          ref={frontEffectsContainerRef}
          className="pointer-events-none relative z-[100] h-full w-full"
        />
      </div>
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full">
        <div
          ref={behindEffectsContainerRef}
          className="pointer-events-none relative -z-[100] h-full w-full"
        />
      </div>
      <div
        ref={subContainerRef}
        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-md font-K2D text-white"
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
                    ? (fgVisualMediaOptions.permissions?.acceptsCameraEffects ??
                      defaultFgVisualMediaOptions.permissions
                        .acceptsCameraEffects)
                    : (fgVisualMediaOptions.permissions?.acceptsScreenEffects ??
                      defaultFgVisualMediaOptions.permissions
                        .acceptsScreenEffects)
                }
                handleVisualEffectChange={handleVisualEffectChange}
                tintColor={tintColor}
                visualMediaContainerRef={visualMediaContainerRef}
              />
            </Suspense>
          )}
        </AnimatePresence>
        <video
          ref={videoRef}
          id={visualMediaId}
          onTimeUpdate={() => fgLowerVisualMediaController.timeUpdate()}
          className="main-video absolute left-0 top-0 h-full w-full"
          controls={false}
          autoPlay={fgVisualMediaOptions.autoPlay}
          style={{ ...videoStyles, objectFit: "fill" }}
        ></video>
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
      {type === "screen" && screenAudioStream && (
        <audio
          ref={screenAudioRef}
          id={`${visualMediaId}_audio`}
          className="z-0 w-0"
          autoPlay={true}
        ></audio>
      )}
    </div>
  );
}
