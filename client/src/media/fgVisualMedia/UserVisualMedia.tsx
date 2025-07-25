import React, { Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import { useSignalContext } from "../../context/signalContext/SignalContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import FgUpperVisualMediaControls from "./lib/fgUpperVisualMediaControls/FgUpperVisualMediaControls";
import FgLowerVisualMediaControls from "./lib/fgLowerVisualMediaControls/FgLowerVisualMediaControls";
import FgVisualMediaController from "./lib/FgVisualMediaController";
import FgLowerVisualMediaController from "./lib/fgLowerVisualMediaControls/lib/FgLowerVisualMediaController";
import FgContentAdjustmentController from "../../elements/fgAdjustmentElements/lib/FgContentAdjustmentControls";
import {
  defaultFgVisualMediaOptions,
  FgVisualMediaOptions,
} from "./lib/typeConstant";
import VisualMediaGradient from "./lib/VisualMediaGradient";
import VisualEffectsSection from "./lib/visualEffectsSection/VisualEffectsSection";
import FourCornersDecorator from "../../elements/decorators/FourCornersDecorator";
import "./lib/fgVisualMediaStyles.css";

const VisualMediaAdjustmentButtons = React.lazy(
  () => import("./lib/VisualMediaAdjustmentButtons"),
);

export default function UserVisualMedia({
  tableTopRef,
  tableId,
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
  tableRef,
  hideSelectedIndicator,
}: {
  tableTopRef: React.RefObject<HTMLDivElement>;
  visualMediaId: string;
  tableId: string;
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
  tableRef: React.RefObject<HTMLDivElement>;
  hideSelectedIndicator?: boolean;
}) {
  const fgVisualMediaOptions = {
    ...defaultFgVisualMediaOptions,
    ...options,
  };

  const { userMedia, userDataStreams, remoteDataStreams } = useMediaContext();
  const { userEffectsStyles, remoteEffectsStyles, userEffects, remoteEffects } =
    useEffectsContext();
  const { mediasoupSocket, tableSocket } = useSocketContext();
  const {
    addMediaPositioningSignalListener,
    removeMediaPositioningSignalListener,
    sendGroupSignal,
    addGroupSignalListener,
    removeGroupSignalListener,
  } = useSignalContext();

  const visualMedia = userMedia.current[type][visualMediaId];

  const visualMediaContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const behindEffectsContainerRef = useRef<HTMLDivElement>(null);
  const frontEffectsContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(document.createElement("video"));
  const panBtnRef = useRef<HTMLButtonElement>(null);
  const rotationBtnRef = useRef<HTMLButtonElement>(null);
  const scaleBtnRef = useRef<HTMLButtonElement>(null);
  const lowerControlsRef = useRef<HTMLDivElement>(null);
  const upperControlsRef = useRef<HTMLDivElement>(null);

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

  const [settingsActive, setSettingsActive] = useState(false);

  const timeUpdateInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  const initTimeOffset = useRef(0);

  const [_, setRerender] = useState(false);

  const positioningListeners = useRef<{
    [username: string]: {
      [instance: string]: () => void;
    };
  }>({});

  const aspectRatio = useRef((visualMedia.aspectRatio ?? 1) - 0.01);

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

  const [selected, setSelected] = useState(false);

  const adjustmentButtonsActive = useRef(false);

  const handleVisualEffectChange = async (
    effect: CameraEffectTypes | ScreenEffectTypes | "clearAll",
    blockStateChange: boolean = false,
  ) => {
    if (effect !== "clearAll") {
      fgLowerVisualMediaController.current.handleVisualEffect(
        effect,
        blockStateChange,
      );

      if (
        (type === "camera" &&
          fgVisualMediaOptions.permissions.acceptsCameraEffects) ||
        (type === "screen" &&
          fgVisualMediaOptions.permissions.acceptsScreenEffects)
      ) {
        mediasoupSocket?.current?.sendMessage({
          type: "clientEffectChange",
          header: {
            tableId,
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
      visualMedia.clearAllEffects();

      mediasoupSocket?.current?.sendMessage({
        type: "clientClearEffects",
        header: {
          tableId,
          username,
          instance,
          producerType: type,
          producerId: visualMediaId,
        },
      });
    }
  };

  const fgContentAdjustmentController = useRef<FgContentAdjustmentController>(
    new FgContentAdjustmentController(
      bundleRef,
      positioning,
      setAdjustingDimensions,
      setRerender,
    ),
  );

  const fgLowerVisualMediaController = useRef(
    new FgLowerVisualMediaController(
      visualMedia,
      mediasoupSocket,
      visualMediaId,
      tableId,
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
      setSettingsActive,
      currentTimeRef,
      setVisualEffectsActive,
      setAudioEffectsActive,
      handleMute,
      handleVisualEffectChange,
      tracksColorSetterCallback,
      tintColor,
      userEffects,
      initTimeOffset,
      fgContentAdjustmentController,
      positioning,
      aspectRatio,
      screenAudioStream,
      behindEffectsContainerRef,
      frontEffectsContainerRef,
      tableSocket,
      setReactionsPanelActive,
      setRerender,
      sendGroupSignal,
    ),
  );

  const fgVisualMediaController = useRef(
    new FgVisualMediaController(
      visualMedia,
      tableId,
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
      fgContentAdjustmentController,
      bundleRef,
      sendGroupSignal,
      userDataStreams,
      setSettingsActive,
      setReactionsPanelActive,
      adjustmentButtonsActive,
    ),
  );

  useEffect(() => {
    const canvas = visualMedia.canvas;
    const stream = canvas.captureStream();
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
      };
    }

    // Set up initial conditions
    fgVisualMediaController.current.init();

    // Listen for messages on mediasoupSocket
    mediasoupSocket.current?.addMessageListener(
      fgVisualMediaController.current.handleMediasoupMessage,
    );

    tableSocket.current?.addMessageListener(
      fgVisualMediaController.current.handleTableMessage,
    );

    addGroupSignalListener(fgVisualMediaController.current.handleSignal);

    addMediaPositioningSignalListener(
      fgVisualMediaController.current.handleMediaPositioningSignal,
    );

    // Keep video time
    fgLowerVisualMediaController.current.timeUpdate();
    timeUpdateInterval.current = setInterval(
      fgLowerVisualMediaController.current.timeUpdate,
      1000,
    );

    // Add eventlisteners
    if (fgVisualMediaOptions.isFullScreen) {
      document.addEventListener(
        "fullscreenchange",
        fgLowerVisualMediaController.current.handleFullScreenChange,
      );
    }

    document.addEventListener(
      "keydown",
      fgLowerVisualMediaController.current.handleKeyDown,
    );

    document.addEventListener(
      "visibilitychange",
      fgVisualMediaController.current.handleVisibilityChange,
    );

    if (fgVisualMediaOptions.isPictureInPicture) {
      videoRef.current?.addEventListener("enterpictureinpicture", () =>
        fgLowerVisualMediaController.current.handlePictureInPicture("enter"),
      );

      videoRef.current?.addEventListener("leavepictureinpicture", () =>
        fgLowerVisualMediaController.current.handlePictureInPicture("leave"),
      );
    }

    visualMedia.addVisualMediaListener(
      fgVisualMediaController.current.handleVisualMediaMessage,
    );

    if (visualMedia.video) {
      visualMedia.video.addEventListener("loadedmetadata", () =>
        fgVisualMediaController.current.handleVideoMetadataLoaded(
          visualMedia.video,
        ),
      );
    }

    tableRef.current?.addEventListener(
      "scroll",
      fgVisualMediaController.current.handleTableScroll,
    );

    return () => {
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener(),
        ),
      );
      positioningListeners.current = {};
      mediasoupSocket.current?.removeMessageListener(
        fgVisualMediaController.current.handleMediasoupMessage,
      );
      tableSocket.current?.removeMessageListener(
        fgVisualMediaController.current.handleTableMessage,
      );
      removeGroupSignalListener(fgVisualMediaController.current.handleSignal);
      removeMediaPositioningSignalListener(
        fgVisualMediaController.current.handleMediaPositioningSignal,
      );
      if (timeUpdateInterval.current !== undefined) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = undefined;
      }
      if (fgVisualMediaOptions.isFullScreen) {
        document.removeEventListener(
          "fullscreenchange",
          fgLowerVisualMediaController.current.handleFullScreenChange,
        );
      }
      document.removeEventListener(
        "keydown",
        fgLowerVisualMediaController.current.handleKeyDown,
      );
      document.removeEventListener(
        "visibilitychange",
        fgVisualMediaController.current.handleVisibilityChange,
      );
      if (fgVisualMediaOptions.isPictureInPicture) {
        videoRef.current?.removeEventListener("enterpictureinpicture", () =>
          fgLowerVisualMediaController.current.handlePictureInPicture("enter"),
        );
        videoRef.current?.removeEventListener("leavepictureinpicture", () =>
          fgLowerVisualMediaController.current.handlePictureInPicture("leave"),
        );
      }
      visualMedia.removeVisualMediaListener(
        fgVisualMediaController.current.handleVisualMediaMessage,
      );
      if (visualMedia.video) {
        visualMedia.video.removeEventListener("loadedmetadata", () =>
          fgVisualMediaController.current.handleVideoMetadataLoaded(
            visualMedia.video,
          ),
        );
      }
      tableRef.current?.removeEventListener(
        "scroll",
        fgVisualMediaController.current.handleTableScroll,
      );
    };
  }, []);

  useEffect(() => {
    fgLowerVisualMediaController.current.updateCaptionsStyles();
  }, [visualMedia.settings]);

  useEffect(() => {
    if (subContainerRef.current && visualMedia.canvas) {
      visualMedia.canvas.style.width = "100%";
      visualMedia.canvas.style.height = "100%";
      subContainerRef.current.appendChild(visualMedia.canvas);
    }
  }, [visualMediaId]);

  useEffect(() => {
    if (
      adjustingDimensions &&
      fgVisualMediaOptions.permissions
        .acceptsPositionScaleRotationManipulation &&
      userDataStreams.current.positionScaleRotation?.readyState === "open"
    ) {
      userDataStreams.current.positionScaleRotation?.send(
        JSON.stringify({
          tableId,
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
    if (
      (type === "camera" &&
        fgVisualMediaOptions.permissions.acceptsCameraEffects) ||
      (type === "screen" &&
        fgVisualMediaOptions.permissions.acceptsScreenEffects)
    ) {
      fgVisualMediaController.current.attachPositioningListeners(
        fgVisualMediaOptions.permissions,
      );
    }
  }, [fgVisualMediaOptions.permissions]);

  useEffect(() => {
    if (!selected) return;

    const handleTableClick = (e: MouseEvent) => {
      if (
        tableTopRef.current?.contains(e.target as Node) &&
        !subContainerRef.current?.contains(e.target as Node) &&
        !rotationBtnRef.current?.contains(e.target as Node) &&
        !panBtnRef.current?.contains(e.target as Node) &&
        !scaleBtnRef.current?.contains(e.target as Node) &&
        !upperControlsRef.current?.contains(e.target as Node) &&
        !lowerControlsRef.current?.contains(e.target as Node) &&
        !visualMediaContainerRef.current?.contains(e.target as Node)
      ) {
        setSelected(false);
      }
    };

    document.addEventListener("pointerdown", handleTableClick);

    return () => {
      document.removeEventListener("pointerdown", handleTableClick);
    };
  }, [selected]);

  return (
    <motion.div
      ref={visualMediaContainerRef}
      id={`${visualMediaId}_container`}
      className={`visual-media-container ${pausedState ? "paused" : ""} ${
        fgVisualMediaOptions.autoPlay ? "" : "paused"
      } ${visualEffectsActive ? "in-effects" : ""} ${
        audioEffectsActive ? "in-effects" : ""
      } ${
        inVisualMedia || selected || reactionsPanelActive
          ? "in-visual-media"
          : ""
      } ${
        adjustingDimensions
          ? "adjusting-dimensions pointer-events-none"
          : "pointer-events-auto"
      } ${visualMedia.settings.background.value ? "z-background-content" : "z-base-content"} absolute flex items-center justify-center`}
      style={
        visualMedia.settings.background.value
          ? {
              left: "50%",
              top: "50%",
              width: (visualMedia.aspectRatio ?? 1) > 1 ? "" : "100%",
              height: (visualMedia.aspectRatio ?? 1) > 1 ? "100%" : "",
              aspectRatio: visualMedia.aspectRatio ?? 1,
              rotate: "0deg",
            }
          : {
              left: `${positioning.current.position.left}%`,
              top: `${positioning.current.position.top}%`,
              width: `${positioning.current.scale.x}%`,
              height: `${positioning.current.scale.y}%`,
              rotate: `${positioning.current.rotation}deg`,
              transformOrigin: "0% 0%",
            }
      }
      onPointerEnter={() =>
        fgVisualMediaController.current.handlePointerEnter(
          "main",
          visualMediaContainerRef,
        )
      }
      onPointerLeave={() =>
        fgVisualMediaController.current.handlePointerLeave(
          "main",
          visualMediaContainerRef,
        )
      }
      data-positioning={JSON.stringify(positioning.current)}
      variants={{
        init: {
          opacity: 0,
          scale: 0.8,
          transform: visualMedia.settings.background.value
            ? "translate(-50%, -50%)"
            : "",
        },
        animate: {
          opacity: 1,
          scale: 1,
          transform: visualMedia.settings.background.value
            ? "translate(-50%, -50%)"
            : "",
          transition: {
            scale: { type: "spring", stiffness: 100 },
          },
        },
      }}
      initial="init"
      animate="animate"
      exit="init"
      transition={{
        opacity: { duration: 0.001 },
        scale: { duration: 0.001 },
      }}
    >
      {!visualMedia.settings.background.value && (
        <>
          {selected && !hideSelectedIndicator && (
            <FourCornersDecorator
              className="z-[100] stroke-fg-red-light"
              width={4}
            />
          )}
          {(selected || adjustmentButtonsActive.current) &&
            fgVisualMediaOptions.permissions
              .acceptsPositionScaleRotationManipulation && (
              <Suspense fallback={<div>Loading...</div>}>
                <VisualMediaAdjustmentButtons
                  fgVisualMediaController={fgVisualMediaController}
                  bundleRef={bundleRef}
                  positioning={positioning}
                  fgContentAdjustmentController={fgContentAdjustmentController}
                  aspectRatio={aspectRatio}
                  rotationBtnRef={rotationBtnRef}
                  panBtnRef={panBtnRef}
                  scaleBtnRef={scaleBtnRef}
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
        </>
      )}
      <div
        ref={subContainerRef}
        className="flex selectable relative h-full w-full items-center justify-center overflow-hidden rounded-md font-K2D text-fg-white"
        data-selectable-type={type}
        data-selectable-id={visualMediaId}
        data-selectable-isuser={true}
        data-selectable-username={username}
        data-selectable-instance={instance}
      >
        {!visualMedia.settings.background.value && (
          <>
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
                        ? (fgVisualMediaOptions.permissions
                            ?.acceptsCameraEffects ??
                          defaultFgVisualMediaOptions.permissions
                            .acceptsCameraEffects)
                        : (fgVisualMediaOptions.permissions
                            ?.acceptsScreenEffects ??
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
            <FgUpperVisualMediaControls
              name={name}
              username={username}
              fgVisualMediaOptions={fgVisualMediaOptions}
              fgLowerVisualMediaController={fgLowerVisualMediaController}
              reactionsPanelActive={reactionsPanelActive}
              setReactionsPanelActive={setReactionsPanelActive}
            />
            <FgLowerVisualMediaControls
              visualMedia={visualMedia}
              tableId={tableId}
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
              visualEffectsActive={visualEffectsActive}
              audioEffectsActive={audioEffectsActive}
              setAudioEffectsActive={setAudioEffectsActive}
              fgVisualMediaOptions={fgVisualMediaOptions}
              handleVisualEffectChange={handleVisualEffectChange}
              handleAudioEffectChange={handleAudioEffectChange}
              handleMuteCallback={handleMuteCallback}
              handleVolumeSliderCallback={handleVolumeSliderCallback}
              tracksColorSetterCallback={tracksColorSetterCallback}
              settingsActive={settingsActive}
              setSettingsActive={setSettingsActive}
              setRerender={setRerender}
            />
            <VisualMediaGradient />
            {!selected && (
              <div
                className="pointer-events-auto absolute inset-0 bg-opacity-15"
                onClick={() => setSelected(true)}
              ></div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
