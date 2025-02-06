import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { useEffectsContext } from "../context/effectsContext/EffectsContext";
import { useSocketContext } from "../context/socketContext/SocketContext";
import { useUserInfoContext } from "../context/userInfoContext/UserInfoContext";
import FgUpperVideoControls from "./lib/fgUpperVideoControls/FgUpperVideoControls";
import FgLowerVideoControls from "./lib/fgLowerVideoControls/FgLowerVideoControls";
import FgVideoController from "./lib/FgVideoController";
import FgLowerVideoController from "./lib/fgLowerVideoControls/lib/FgLowerVideoController";
import FgContentAdjustmentController from "../fgAdjustmentComponents/lib/FgContentAdjustmentControls";
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
  videoId,
  name,
  sharedBundleRef,
  videoContentMute,
  options,
}: {
  videoId: string;
  name?: string;
  sharedBundleRef: React.RefObject<HTMLDivElement>;
  videoContentMute: React.MutableRefObject<{
    [videoId: string]: boolean;
  }>;
  options?: FgVideoOptions;
}) {
  const fgVideoOptions = {
    ...defaultFgVideoOptions,
    ...options,
  };

  const { userMedia, userDataStreams, remoteDataStreams } = useMediaContext();
  const { userStreamEffects } = useEffectsContext();
  const { mediasoupSocket, tableStaticContentSocket } = useSocketContext();
  const { table_id } = useUserInfoContext();

  const videoMedia = userMedia.current.video[videoId];

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const panBtnRef = useRef<HTMLButtonElement>(null);

  const [inVideo, setInVideo] = useState(false);

  const leaveVideoTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const videoMovementTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const [pausedState, setPausedState] = useState(false);

  const paused = useRef(false);

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

  const [desync, setDesync] = useState(false);

  const fgContentAdjustmentController = new FgContentAdjustmentController(
    sharedBundleRef,
    positioning,
    setAdjustingDimensions,
    setRerender
  );

  const fgLowerVideoController = new FgLowerVideoController(
    tableStaticContentSocket,
    videoId,
    sharedBundleRef,
    videoMedia,
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
    tintColor,
    userStreamEffects,
    userMedia,
    initTimeOffset,
    fgContentAdjustmentController,
    positioning
  );

  const fgVideoController = new FgVideoController(
    tableStaticContentSocket,
    table_id,
    videoId,
    videoMedia,
    subContainerRef,
    fgLowerVideoController,
    positioningListeners,
    positioning,
    remoteDataStreams,
    videoContainerRef,
    fgVideoOptions,
    setInVideo,
    leaveVideoTimer,
    videoMovementTimeout,
    setRerender
  );

  useEffect(() => {
    fgVideoController.scaleCallback();

    tableStaticContentSocket.current?.requestCatchUpContentData(
      "video",
      videoId
    );

    // Set up initial conditions
    fgVideoController.init();

    // Listen for messages on mediasoupSocket
    mediasoupSocket.current?.addMessageListener(
      fgVideoController.handleMediasoupMessage
    );

    // Listen for messages on tableStaticContentSocket
    tableStaticContentSocket.current?.addMessageListener(
      fgVideoController.handleTableStaticContentMessage
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

    videoMedia.video.addEventListener("enterpictureinpicture", () =>
      fgLowerVideoController.handlePictureInPicture("enter")
    );

    videoMedia.video.addEventListener("leavepictureinpicture", () =>
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
        fgVideoController.handleMediasoupMessage
      );
      tableStaticContentSocket.current?.removeMessageListener(
        fgVideoController.handleTableStaticContentMessage
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
      videoMedia.video.removeEventListener("enterpictureinpicture", () =>
        fgLowerVideoController.handlePictureInPicture("enter")
      );
      videoMedia.video.removeEventListener("leavepictureinpicture", () =>
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
      // subContainerRef.current.appendChild(
      //   userMedia.current.video[videoId].canvas
      // );
    }
  }, [videoId, userMedia]);

  useEffect(() => {
    if (
      adjustingDimensions &&
      userDataStreams.current.positionScaleRotation?.readyState === "open"
    ) {
      userDataStreams.current.positionScaleRotation?.send(
        JSON.stringify({
          table_id: table_id.current,
          kind: "video",
          videoId: videoId,
          positioning: positioning.current,
        })
      );
    }
  }, [positioning.current]);

  useEffect(() => {
    fgVideoController.scaleCallback();
  }, [positioning.current.scale]);

  useEffect(() => {
    fgVideoController.attachPositioningListeners();

    subContainerRef.current?.appendChild(videoMedia.video);
    if (videoMedia.hiddenVideo) {
      subContainerRef.current?.appendChild(videoMedia.hiddenVideo);
    }
  }, []);

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
      <VideoAdjustmentButtons
        sharedBundleRef={sharedBundleRef}
        panBtnRef={panBtnRef}
        positioning={positioning}
        fgContentAdjustmentController={fgContentAdjustmentController}
      />
      {adjustingDimensions && (
        <>
          <div className='animated-border-box-glow'></div>
          <div className='animated-border-box'></div>
        </>
      )}
      <div
        ref={subContainerRef}
        className='flex relative items-center justify-center text-white font-K2D h-full w-full rounded-md overflow-hidden bg-black'
      >
        <FgUpperVideoControls
          desync={desync}
          fgLowerVideoController={fgLowerVideoController}
        />
        <FgLowerVideoControls
          videoId={videoId}
          videoMedia={videoMedia}
          fgLowerVideoController={fgLowerVideoController}
          pausedState={pausedState}
          videoContentMute={videoContentMute}
          videoContainerRef={videoContainerRef}
          subContainerRef={subContainerRef}
          currentTimeRef={currentTimeRef}
          tintColor={tintColor}
          videoEffectsActive={videoEffectsActive}
          audioEffectsActive={audioEffectsActive}
          setAudioEffectsActive={setAudioEffectsActive}
          settings={settings}
          setSettings={setSettings}
          fgVideoOptions={fgVideoOptions}
        />
        <VideoGradient />
      </div>
    </div>
  );
}
