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
import {
  closedCaptionsSelections,
  expandedClosedCaptionsBrowserSelections,
  expandedClosedCaptionsVoskSelections,
} from "../fgVideoControls/lib/ClosedCaptionsPage";
import FgVideoController from "../fgVideo/lib/FgVideoController";
import { HideBackgroundEffectTypes } from "src/context/currentEffectsStylesContext/typeConstant";
import MovementButton from "./MovementButton";
import RotateButton from "./RotateButton";
import ScaleButton from "./ScaleButton";

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

  const { userMedia, userStreamEffects, remoteStreamEffects } =
    useStreamsContext();
  const { currentEffectsStyles, remoteCurrentEffectsStyles } =
    useCurrentEffectsStylesContext();

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [inVideo, setInVideo] = useState(true);

  const [pausedState, setPausedState] = useState(false);

  const paused = useRef(!fgVideoOptions.autoPlay);

  const leaveVideoTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [effectsActive, setEffectsActive] = useState(false);

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

  const [position, setPosition] = useState({ left: 50, top: 50 });
  const [scale, setScale] = useState({ x: 25, y: 25 });
  const [rotation, setRotation] = useState(0);

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
    controls.updateCaptionsStyles();
  }, [settings]);

  const handleVisualEffectChange = async (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange: boolean = false,
    hideBackgroundStyle?: HideBackgroundEffectTypes,
    hideBackgroundColor?: string
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
    // Set up initial conditions
    fgVideoController.init();

    // Listen for messages on socket
    socket.current.on("message", fgVideoController.handleMessage);

    // Keep video time
    controls.timeUpdate();
    timeUpdateInterval.current = setInterval(controls.timeUpdate, 1000);

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
      if (timeUpdateInterval.current !== undefined) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = undefined;
      }
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

  const movementDragFunction = (displacement: { x: number; y: number }) => {
    if (!bundleRef.current || !subContainerRef.current) {
      return;
    }

    setPosition({
      left: Math.max(
        Math.min(
          (displacement.x / bundleRef.current.clientWidth -
            subContainerRef.current.clientWidth /
              bundleRef.current.clientWidth) *
            100,
          (1 -
            subContainerRef.current.clientWidth /
              bundleRef.current.clientWidth) *
            100
        ),
        0
      ),
      top: Math.max(
        Math.min(
          (displacement.y / bundleRef.current.clientHeight -
            (subContainerRef.current.clientWidth + 10) /
              2 /
              bundleRef.current.clientWidth) *
            100,
          (1 -
            subContainerRef.current.clientHeight /
              bundleRef.current.clientHeight) *
            100
        ),
        0
      ),
    });
  };

  const scaleDragFunction = (displacement: { x: number; y: number }) => {
    if (!bundleRef.current || !subContainerRef.current) {
      return;
    }
    const bundleRect = bundleRef.current.getBoundingClientRect();
    const subContainerRect = subContainerRef.current.getBoundingClientRect();
    const referenceX = subContainerRect.left - bundleRect.left;
    const referenceY = subContainerRect.top - bundleRect.top;

    setScale({
      x: Math.max(
        6,
        ((Math.min(displacement.x, bundleRef.current.clientWidth) -
          referenceX) /
          bundleRef.current.clientWidth) *
          100
      ),
      y: Math.max(
        6,
        ((Math.min(displacement.y, bundleRef.current.clientHeight) -
          referenceY) /
          bundleRef.current.clientHeight) *
          100
      ),
    });
  };

  const rotateTriangleToAlign = (
    purple: { x: number; y: number },
    orange: { x: number; y: number },
    red: { x: number; y: number },
    blue: { x: number; y: number }
  ) => {
    const vectorToRed = { x: red.x - orange.x, y: red.y - orange.y };
    const vectorToPurple = { x: purple.x - orange.x, y: purple.y - orange.y };

    const angleToRed = Math.atan2(vectorToRed.y, vectorToRed.x);
    const angleToPurple = Math.atan2(vectorToPurple.y, vectorToPurple.x);

    // Calculate the required rotation angle to align purple point with the red vector.
    const rotationAngle = angleToRed - angleToPurple;

    // Rotation matrix components based on the rotationAngle
    const cosTheta = Math.cos(rotationAngle);
    const sinTheta = Math.sin(rotationAngle);

    // Helper function to apply the rotation matrix
    function rotateAroundOrange(point: { x: number; y: number }) {
      // Translate point to origin (relative to orange), apply rotation, then translate back
      const translatedX = point.x - orange.x;
      const translatedY = point.y - orange.y;

      return {
        x: translatedX * cosTheta - translatedY * sinTheta + orange.x,
        y: translatedX * sinTheta + translatedY * cosTheta + orange.y,
      };
    }

    // Step 5: Rotate all points in the triangle around the orange point
    const rotatedPurple = rotateAroundOrange(purple);
    const rotatedRed = rotateAroundOrange(red);
    const rotatedBlue = rotateAroundOrange(blue);

    // Step 6: Calculate the angle of the rotated red point with respect to the x-axis, relative to the orange point
    const finalVectorToRed = {
      x: rotatedRed.x - orange.x,
      y: rotatedRed.y - orange.y,
    };
    const finalAngleRedX = Math.atan2(finalVectorToRed.y, finalVectorToRed.x);

    // Return the rotated coordinates and the final angle
    return {
      rotatedPoints: {
        purple: rotatedPurple,
        orange: orange, // unchanged
        red: rotatedRed,
        blue: rotatedBlue,
      },
      finalAngleRedX: finalAngleRedX * (180 / Math.PI), // convert to degrees for easier interpretation
    };
  };

  const rotateDragFunction = (displacement: { x: number; y: number }) => {
    if (!bundleRef.current || !subContainerRef.current) {
      return;
    }

    const subContainerRect = subContainerRef.current.getBoundingClientRect();

    const topRightCorner = {
      x: subContainerRect.right,
      y: subContainerRect.top,
    };

    const bottomLeftCorner = {
      x: subContainerRect.left,
      y: subContainerRect.bottom,
    };

    const bottomRightCorner = {
      x: subContainerRect.right,
      y: subContainerRect.bottom,
    };

    console.log(
      topRightCorner,
      bottomLeftCorner,
      bottomRightCorner,
      displacement,
      rotateTriangleToAlign(
        topRightCorner,
        bottomLeftCorner,
        bottomRightCorner,
        displacement
      ).finalAngleRedX
    );
    setRotation(
      rotateTriangleToAlign(
        topRightCorner,
        bottomLeftCorner,
        bottomRightCorner,
        displacement
      ).finalAngleRedX
    );
  };

  return (
    <div
      ref={canvasContainerRef}
      id={`${videoId}_container`}
      className={`video-container ${pausedState ? "paused" : ""} ${
        fgVideoOptions.autoPlay ? "" : "paused"
      } ${effectsActive ? "in-effects" : ""} ${
        audioEffectsActive ? "in-effects" : ""
      } ${inVideo ? "in-video" : ""}
        flex items-center justify-center`}
      style={{
        position: "absolute",
        left: `${position.left}%`,
        top: `${position.top}%`,
        height: `${scale.y}%`,
        width: `${scale.x}%`,
        rotate: `${rotation}deg`,
        transformOrigin: "0% 100%",
      }}
      onMouseEnter={() => controls.handleMouseEnter()}
      onMouseLeave={() => controls.handleMouseLeave()}
    >
      <RotateButton dragFunction={rotateDragFunction} bundleRef={bundleRef} />
      <MovementButton
        dragFunction={movementDragFunction}
        bundleRef={bundleRef}
      />
      <ScaleButton dragFunction={scaleDragFunction} bundleRef={bundleRef} />
      <div
        ref={subContainerRef}
        className={`relative flex items-center justify-center text-white font-K2D h-full w-full overflow-hidden rounded-md`}
      >
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
          videoContainerRef={canvasContainerRef}
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
