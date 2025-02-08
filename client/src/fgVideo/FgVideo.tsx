import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { useEffectsContext } from "../context/effectsContext/EffectsContext";
import { useSocketContext } from "../context/socketContext/SocketContext";
import { useUserInfoContext } from "../context/userInfoContext/UserInfoContext";
import VideoController from "./lib/VideoController";
import LowerVideoController from "./lib/lowerVideoControls/lib/LowerVideoController";
import {
  defaultVideoOptions,
  VideoOptions,
  Settings,
} from "./lib/typeConstant";
import "./lib/fgVideoStyles.css";
import FgMediaContainer from "../fgMediaContainer/FgMediaContainer";
import VideoEffectsSection from "./lib/videoEffectsSection/VideoEffectsSection";
import FullScreenButton from "./lib/lowerVideoControls/lib/fullScreenButton/FullScreenButton";
import VideoEffectsButton from "./lib/lowerVideoControls/lib/videoEffectsButton/VideoEffectsButton";
import PlayPauseButton from "./lib/lowerVideoControls/lib/playPauseButton/PlayPauseButton";

const VideoAdjustmentButtons = React.lazy(
  () => import("./lib/VideoAdjustmentButtons")
);

export default function FgVideo({
  videoId,
  name,
  bundleRef,
  videoContentMute,
  options,
}: {
  videoId: string;
  name?: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  videoContentMute: React.MutableRefObject<{
    [videoId: string]: boolean;
  }>;
  options?: VideoOptions;
}) {
  const videoOptions = {
    ...defaultVideoOptions,
    ...options,
  };

  const { userMedia, userDataStreams, remoteDataStreams } = useMediaContext();
  const { userStreamEffects } = useEffectsContext();
  const { mediasoupSocket, tableStaticContentSocket } = useSocketContext();
  const { table_id } = useUserInfoContext();

  const videoMedia = userMedia.current.video[videoId];

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const rightLowerVideoControlsRef = useRef<HTMLDivElement>(null);

  const [pausedState, setPausedState] = useState(false);

  const paused = useRef(false);

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

  const lowerVideoController = new LowerVideoController(
    tableStaticContentSocket,
    videoId,
    bundleRef,
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

  const videoController = new VideoController(
    tableStaticContentSocket,
    videoId,
    videoMedia,
    subContainerRef,
    lowerVideoController,
    positioning,
    videoContainerRef,
    videoOptions,
    setRerender
  );

  useEffect(() => {
    subContainerRef.current?.appendChild(videoMedia.video);
    if (videoMedia.hiddenVideo) {
      subContainerRef.current?.appendChild(videoMedia.hiddenVideo);
    }

    videoController.scaleCallback();

    tableStaticContentSocket.current?.requestCatchUpContentData(
      "video",
      videoId
    );

    // Set up initial conditions
    videoController.init();

    // Listen for messages on tableStaticContentSocket
    tableStaticContentSocket.current?.addMessageListener(
      videoController.handleTableStaticContentMessage
    );

    // Keep video time
    lowerVideoController.timeUpdate();
    timeUpdateInterval.current = setInterval(
      lowerVideoController.timeUpdate,
      1000
    );

    // Add eventlisteners
    document.addEventListener(
      "fullscreenchange",
      lowerVideoController.handleFullScreenChange
    );

    document.addEventListener("keydown", lowerVideoController.handleKeyDown);

    document.addEventListener("keyup", lowerVideoController.handleKeyUp);

    document.addEventListener(
      "visibilitychange",
      videoController.handleVisibilityChange
    );

    videoMedia.video.addEventListener("enterpictureinpicture", () =>
      lowerVideoController.handlePictureInPicture("enter")
    );

    videoMedia.video.addEventListener("leavepictureinpicture", () =>
      lowerVideoController.handlePictureInPicture("leave")
    );

    return () => {
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener()
        )
      );
      positioningListeners.current = {};
      tableStaticContentSocket.current?.removeMessageListener(
        videoController.handleTableStaticContentMessage
      );
      if (timeUpdateInterval.current !== undefined) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = undefined;
      }
      document.removeEventListener(
        "fullscreenchange",
        lowerVideoController.handleFullScreenChange
      );
      document.removeEventListener(
        "keydown",
        lowerVideoController.handleKeyDown
      );
      document.removeEventListener("keyup", lowerVideoController.handleKeyUp);
      document.removeEventListener(
        "visibilitychange",
        videoController.handleVisibilityChange
      );
      videoMedia.video.removeEventListener("enterpictureinpicture", () =>
        lowerVideoController.handlePictureInPicture("enter")
      );
      videoMedia.video.removeEventListener("leavepictureinpicture", () =>
        lowerVideoController.handlePictureInPicture("leave")
      );
    };
  }, []);

  useEffect(() => {
    lowerVideoController.updateCaptionsStyles();
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
    videoController.scaleCallback();
  }, [positioning.current.scale]);

  return (
    <FgMediaContainer
      mediaId={videoId}
      filename={videoMedia.filename}
      kind='video'
      bundleRef={bundleRef}
      lowerPopupElements={[
        videoEffectsActive ? (
          <VideoEffectsSection
            videoId={videoId}
            videoContainerRef={videoContainerRef}
            lowerVideoController={lowerVideoController}
            tintColor={tintColor}
          />
        ) : null,
      ]}
      leftLowerControls={[
        <PlayPauseButton
          pausedState={pausedState}
          lowerVideoController={lowerVideoController}
          videoEffectsActive={videoEffectsActive}
          settingsActive={settingsActive}
        />,
        <div className='flex items-center gap-1 px-1 select-none'>
          <div ref={currentTimeRef} className='font-K2D text-lg'></div>
        </div>,
      ]}
      rightLowerControls={[
        <FullScreenButton
          lowerVideoController={lowerVideoController}
          videoEffectsActive={videoEffectsActive}
          scrollingContainerRef={rightLowerVideoControlsRef}
        />,
        <PictureInPictureButton
          fgLowerVideoController={fgLowerVideoController}
          videoEffectsActive={videoEffectsActive}
          settingsActive={settingsActive}
          scrollingContainerRef={rightVideoControlsRef}
        />,
        <CaptionButton
          fgLowerVideoController={fgLowerVideoController}
          videoEffectsActive={videoEffectsActive}
          settingsActive={settingsActive}
          settings={settings}
          audioStream={videoMedia.getAudioTrack()}
          videoContainerRef={videoContainerRef}
          scrollingContainerRef={rightVideoControlsRef}
          containerRef={subContainerRef}
        />,
        <FgSettingsButton
          fgVideoOptions={fgVideoOptions}
          videoEffectsActive={videoEffectsActive}
          videoContainerRef={videoContainerRef}
          settingsActive={settingsActive}
          setSettingsActive={setSettingsActive}
          activePages={activePages}
          setActivePages={setActivePages}
          settings={settings}
          setSettings={setSettings}
          scrollingContainerRef={rightVideoControlsRef}
        />,
        <VideoEffectsButton
          lowerVideoController={lowerVideoController}
          videoEffectsActive={videoEffectsActive}
          scrollingContainerRef={rightLowerVideoControlsRef}
        />,
        <AudioEffectsButton
          table_id={table_id.current}
          username={username.current}
          instance={instance.current}
          isUser={false}
          permissions={undefined}
          producerType={"video"}
          producerId={videoId}
          audioEffectsActive={audioEffectsActive}
          setAudioEffectsActive={setAudioEffectsActive}
          visualMediaContainerRef={videoContainerRef}
          handleAudioEffectChange={handleAudioEffectChange}
          handleMute={handleMute}
          videoContentMute={videoContentMute}
          closeLabelElement={
            <FgHoverContentStandard content='Close (x)' style='dark' />
          }
          hoverLabelElement={
            <FgHoverContentStandard content='Audio effects (a)' style='dark' />
          }
          scrollingContainerRef={rightVideoControlsRef}
          style={{ transform: "scaleX(-1)" }}
          options={{
            backgroundColor: "rgba(10, 10, 10, 1)",
            secondaryBackgroundColor: "rgba(35, 35, 35, 1)",
          }}
        />,
      ]}
      inMediaVariables={[videoEffectsActive, pausedState]}
      externalPositioning={positioning}
      externalMediaContainerRef={videoContainerRef}
      externalSubContainerRef={subContainerRef}
      externalRightLowerControlsRef={rightLowerVideoControlsRef}
    />
  );
}
