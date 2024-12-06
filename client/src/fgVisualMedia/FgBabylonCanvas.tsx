import React, { Suspense, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { useStreamsContext } from "../context/streamsContext/StreamsContext";
import { useCurrentEffectsStylesContext } from "../context/currentEffectsStylesContext/CurrentEffectsStylesContext";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/streamsContext/typeConstant";
import FgUpperVisualMediaControls from "./lib/fgUpperVisualMediaControls/FgUpperVisualMediaControls";
import FgLowerVisualMediaControls from "./lib/fgLowerVisualMediaControls/FgLowerVisualMediaControls";
import FgVisualMediaController from "./lib/FgVisualMediaController";
import { HideBackgroundEffectTypes } from "../context/currentEffectsStylesContext/typeConstant";
import FgLowerVisualMediaController from "./lib/fgLowerVisualMediaControls/lib/FgLowerVisualMediaController";
import FgContentAdjustmentController from "../fgAdjustmentComponents/lib/FgContentAdjustmentControls";
import {
  defaultFgVisualMediaOptions,
  FgVisualMediaOptions,
  Settings,
} from "./lib/typeConstant";
import "./lib/fgVideoStyles.css";

const PanButton = React.lazy(
  () => import("../fgAdjustmentComponents/PanButton")
);
const RotateButton = React.lazy(
  () => import("../fgAdjustmentComponents/RotateButton")
);
const ScaleButton = React.lazy(
  () => import("../fgAdjustmentComponents/ScaleButton")
);

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
  options?: FgVisualMediaOptions;
  handleAudioEffectChange: (effect: AudioEffectTypes) => void;
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
          producerId: videoId,
          effect: effect,
          // @ts-expect-error: ts can't infer type, videoId, and effect are strictly enforces and exist
          effectStyle: currentEffectsStyles.current[type][videoId][effect],
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

  const fgContentAdjustmentController = new FgContentAdjustmentController(
    bundleRef,
    positioning,
    setAdjustingDimensions,
    setRerender
  );

  const fgLowerVisualMediaController = new FgLowerVisualMediaController(
    socket,
    videoId,
    table_id,
    username,
    instance,
    type,
    fgVisualMediaOptions,
    bundleRef,
    videoRef,
    audioRef,
    canvasContainerRef,
    setPausedState,
    inVideo,
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
    positioning
  );

  const fgVisualMediaController = new FgVisualMediaController(
    username,
    instance,
    type,
    videoId,
    fgLowerVisualMediaController,
    undefined,
    positioning,
    setPausedState,
    paused,
    userMedia,
    remoteStreamEffects,
    currentEffectsStyles,
    remoteCurrentEffectsStyles,
    videoRef,
    canvasContainerRef,
    audioRef,
    fgVisualMediaOptions,
    handleVisualEffectChange,
    setInVideo,
    leaveVideoTimer
  );

  useEffect(() => {
    fgLowerVisualMediaController.updateCaptionsStyles();
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
    fgVisualMediaController.init();

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
        inquiredVideoId: videoId,
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
    if (
      !fgVisualMediaOptions.isUser &&
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
  }, [remoteDataStreams.current]);

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
    if (fgVisualMediaOptions.isUser) {
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
        fgVisualMediaOptions.autoPlay ? "" : "paused"
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
      onMouseEnter={() => fgVisualMediaController.handleMouseEnter()}
      onMouseLeave={() => fgVisualMediaController.handleMouseLeave()}
      data-positioning={JSON.stringify(positioning.current)}
    >
      {(fgVisualMediaOptions.isUser ||
        fgVisualMediaOptions.permissions
          .acceptsPositionScaleRotationManipulation) && (
        <Suspense fallback={<div>Loading...</div>}>
          <RotateButton
            className={
              "rotate-btn absolute left-full bottom-full w-6 aspect-square z-10"
            }
            dragFunction={(_displacement, event) => {
              if (!bundleRef.current) {
                return;
              }

              const box = bundleRef.current.getBoundingClientRect();

              fgContentAdjustmentController.rotateDragFunction(event, {
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
              fgContentAdjustmentController.adjustmentBtnMouseDownFunction
            }
            mouseUpFunction={
              fgContentAdjustmentController.adjustmentBtnMouseUpFunction
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

              fgContentAdjustmentController.movementDragFunction(
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
              fgContentAdjustmentController.adjustmentBtnMouseDownFunction(
                "position",
                { rotationPointPlacement: "topLeft" }
              )
            }
            mouseUpFunction={
              fgContentAdjustmentController.adjustmentBtnMouseUpFunction
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

              fgContentAdjustmentController.scaleDragFunction(
                "any",
                displacement,
                referencePoint,
                referencePoint
              );
            }}
            bundleRef={bundleRef}
            mouseDownFunction={
              fgContentAdjustmentController.adjustmentBtnMouseDownFunction
            }
            mouseUpFunction={
              fgContentAdjustmentController.adjustmentBtnMouseUpFunction
            }
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
          isClose={fgVisualMediaOptions.isClose}
          fgLowerVisualMediaController={fgLowerVisualMediaController}
        />
        <FgLowerVisualMediaControls
          socket={socket}
          table_id={table_id}
          username={username}
          instance={instance}
          type={type}
          videoId={videoId}
          fgLowerVisualMediaController={fgLowerVisualMediaController}
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
          fgVisualMediaOptions={fgVisualMediaOptions}
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
