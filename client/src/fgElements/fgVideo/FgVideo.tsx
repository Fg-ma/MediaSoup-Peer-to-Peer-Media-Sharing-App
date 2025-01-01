import React, { Suspense, useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import {
  HideBackgroundEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../context/effectsContext/typeConstant";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import FgUpperVideoControls from "./lib/fgUpperVideoControls/FgUpperVideoControls";
import FgLowerVideoControls from "./lib/fgLowerVideoControls/FgLowerVideoControls";
import FgVideoController from "./lib/FgVideoController";
import FgLowerVideoController from "./lib/fgLowerVideoControls/lib/FgLowerVideoController";
import FgContentAdjustmentController from "../../fgAdjustmentComponents/lib/FgContentAdjustmentControls";
import {
  defaultFgVideoOptions,
  FgVideoOptions,
  Settings,
} from "./lib/typeConstant";
import VideoGradient from "./lib/VideoGradient";
import "./lib/fgVideoStyles.css";

const VideoAdjustmentButtons = React.lazy(
  () => import("./lib/VideoAdjustmentButtons")
);

export default function FgVideo({
  table_id,
  username,
  instance,
  name,
  videoId,
  bundleRef,
  videoStream,
  audioStream,
  options,
}: {
  table_id: string;
  username: string;
  instance: string;
  name?: string;
  videoId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  videoStream: MediaStream;
  audioStream: MediaStream;
  options?: FgVideoOptions;
}) {
  const fgVideoOptions = {
    ...defaultFgVideoOptions,
    ...options,
  };

  const { userMedia, userDataStreams, remoteDataStreams } = useMediaContext();
  const {
    userEffectsStyles,
    remoteEffectsStyles,
    userStreamEffects,
    remoteStreamEffects,
  } = useEffectsContext();
  const { mediasoupSocket } = useSocketContext();

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const panBtnRef = useRef<HTMLButtonElement>(null);

  const [inVideo, setInVideo] = useState(false);

  const leaveVideoTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const videoMovementTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const [pausedState, setPausedState] = useState(false);

  const paused = useRef("false");

  const [adjustingDimensions, setAdjustingDimensions] = useState(false);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [videoEffectsActive, setVideoEffectsActive] = useState(false);

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

  const handleVideoEffectChange = async (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange: boolean = false,
    hideBackgroundStyle?: HideBackgroundEffectTypes,
    hideBackgroundColor?: string
  ) => {
    fgLowerVideoController.handleVideoEffect(effect, blockStateChange);
  };

  const fgContentAdjustmentController = new FgContentAdjustmentController(
    bundleRef,
    positioning,
    setAdjustingDimensions,
    setRerender
  );

  const fgLowerVideoController = new FgLowerVideoController(
    mediasoupSocket,
    videoId,
    table_id,
    username,
    instance,
    fgVideoOptions,
    bundleRef,
    videoRef,
    audioRef,
    videoContainerRef,
    panBtnRef,
    setPausedState,
    shiftPressed,
    controlPressed,
    paused,
    setCaptionsActive,
    settings,
    currentTimeRef,
    setVideoEffectsActive,
    setAudioEffectsActive,
    handleVideoEffectChange,
    tintColor,
    userStreamEffects,
    userMedia,
    initTimeOffset,
    fgContentAdjustmentController,
    positioning
  );

  const fgVideoController = new FgVideoController(
    table_id,
    username,
    instance,
    videoId,
    fgLowerVideoController,
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
    videoContainerRef,
    audioRef,
    fgVideoOptions,
    handleVideoEffectChange,
    setInVideo,
    leaveVideoTimer,
    videoMovementTimeout,
    setRerender
  );

  useEffect(() => {
    const canvas = userMedia.current.video[videoId].canvas;
    const stream = canvas.captureStream();
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
      };
    }

    // Set up initial conditions
    fgVideoController.init();

    // Listen for messages on tableSocket
    tableSocket.current?.addMessageListener(
      fgVideoController.handleTableMessage
    );

    // Listen for messages on mediasoupSocket
    mediasoupSocket.current?.addMessageListener(
      fgVideoController.handleMediasoupMessage
    );

    // Keep video time
    fgLowerVideoController.timeUpdate();
    timeUpdateInterval.current = setInterval(
      fgLowerVideoController.timeUpdate,
      1000
    );

    // Add eventlisteners
    document.addEventListener(
      "fullscreenchange",
      fgLowerVideoController.handleFullScreenChange
    );

    document.addEventListener("keydown", fgLowerVideoController.handleKeyDown);

    document.addEventListener("keyup", fgLowerVideoController.handleKeyUp);

    document.addEventListener(
      "visibilitychange",
      fgVideoController.handleVisibilityChange
    );

    videoRef.current?.addEventListener("enterpictureinpicture", () =>
      fgLowerVideoController.handlePictureInPicture("enter")
    );

    videoRef.current?.addEventListener("leavepictureinpicture", () =>
      fgLowerVideoController.handlePictureInPicture("leave")
    );

    return () => {
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener()
        )
      );
      positioningListeners.current = {};
      mediasoupSocket.current?.removeMessageListener(
        fgVideoController.handleMessage
      );
      if (timeUpdateInterval.current !== undefined) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = undefined;
      }
      document.removeEventListener(
        "fullscreenchange",
        fgLowerVideoController.handleFullScreenChange
      );
      document.removeEventListener(
        "keydown",
        fgLowerVideoController.handleKeyDown
      );
      document.removeEventListener("keyup", fgLowerVideoController.handleKeyUp);
      document.removeEventListener(
        "visibilitychange",
        fgVideoController.handleVisibilityChange
      );
      videoRef.current?.removeEventListener("enterpictureinpicture", () =>
        fgLowerVideoController.handlePictureInPicture("enter")
      );
      videoRef.current?.removeEventListener("leavepictureinpicture", () =>
        fgLowerVideoController.handlePictureInPicture("leave")
      );
    };
  }, []);

  useEffect(() => {
    fgLowerVideoController.updateCaptionsStyles();
  }, [settings]);

  useEffect(() => {
    if (subContainerRef.current && userMedia.current.video[videoId]?.canvas) {
      userMedia.current.video[videoId].canvas.style.position = "absolute";
      userMedia.current.video[videoId].canvas.style.top = "0%";
      userMedia.current.video[videoId].canvas.style.left = "0%";
      userMedia.current.video[videoId].canvas.style.width = "100%";
      userMedia.current.video[videoId].canvas.style.height = "100%";
      subContainerRef.current.appendChild(
        userMedia.current.video[videoId].canvas
      );
    }
  }, [videoId, userMedia]);

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
          kind: "video",
          producerId: videoId,
          positioning: positioning.current,
        })
      );
    }
  }, [positioning.current]);

  useEffect(() => {
    if (fgVideoOptions.permissions.acceptsVideoEffects) {
      fgVideoController.attachPositioningListeners(fgVideoOptions.permissions);
    }
  }, [fgVideoOptions.permissions]);

  return (
    <div
      ref={videoContainerRef}
      id={`${videoId}_container`}
      className={`video-media-container ${pausedState ? "paused" : ""} ${
        videoEffectsActive ? "in-effects" : ""
      } ${audioEffectsActive ? "in-effects" : ""} ${
        inVideo ? "in-video" : ""
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
      onPointerEnter={() => fgVideoController.handlePointerEnter()}
      onPointerLeave={() => fgVideoController.handlePointerLeave()}
      data-positioning={JSON.stringify(positioning.current)}
    >
      {fgVideoOptions.permissions.acceptsPositionScaleRotationManipulation && (
        <Suspense fallback={<div>Loading...</div>}>
          <VideoAdjustmentButtons
            bundleRef={bundleRef}
            panBtnRef={panBtnRef}
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
        <FgUpperVideoControls
          name={name}
          username={username}
          fgVideoOptions={fgVideoOptions}
          fgLowerVideoController={fgLowerVideoController}
        />
        <FgLowerVideoControls
          table_id={table_id}
          username={username}
          instance={instance}
          videoId={videoId}
          fgLowerVideoController={fgLowerVideoController}
          pausedState={pausedState}
          videoContainerRef={videoContainerRef}
          audioStream={audioStream}
          audioRef={audioRef}
          subContainerRef={subContainerRef}
          currentTimeRef={currentTimeRef}
          tintColor={tintColor}
          videoEffectsActive={videoEffectsActive}
          audioEffectsActive={audioEffectsActive}
          setAudioEffectsActive={setAudioEffectsActive}
          settings={settings}
          setSettings={setSettings}
          fgVideoOptions={fgVideoOptions}
          handleVideoEffectChange={handleVideoEffectChange}
        />
        <VideoGradient />
      </div>
    </div>
  );
}
