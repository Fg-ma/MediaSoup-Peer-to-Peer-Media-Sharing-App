import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import VideoController from "./lib/VideoController";
import LowerVideoController from "./lib/lowerVideoControls/LowerVideoController";
import {
  defaultVideoOptions,
  VideoOptions,
  Settings,
  ActivePages,
  defaultSettings,
  defaultActivePages,
} from "./lib/typeConstant";
import FgMediaContainer from "../fgMediaContainer/FgMediaContainer";
import VideoEffectsSection from "./lib/videoEffectsSection/VideoEffectsSection";
import VideoEffectsButton from "./lib/lowerVideoControls/videoEffectsButton/VideoEffectsButton";
import PlayPauseButton from "./lib/lowerVideoControls/playPauseButton/PlayPauseButton";
import PictureInPictureButton from "./lib/lowerVideoControls/pictureInPictureButton/PictureInPictureButton";
import CaptionButton from "./lib/lowerVideoControls/captionsButton/CaptionButton";
import SettingsButton from "./lib/lowerVideoControls/settingsButton/SettingsButton";
import "./lib/fgVideoStyles.css";
import DownloadButton from "./lib/lowerVideoControls/downloadButton/DownloadButton";
import DownloadRecordingButton from "./lib/lowerVideoControls/downloadButton/DownloadRecordingButton";

export default function FgVideo({
  videoInstanceId,
  name,
  bundleRef,
  videoContentMute,
  options,
}: {
  videoInstanceId: string;
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

  const { userMedia } = useMediaContext();
  const { userEffects, userEffectsStyles } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const videoMediaInstance = userMedia.current.video.instances[videoInstanceId];

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const rightLowerVideoControlsRef = useRef<HTMLDivElement>(null);

  const [pausedState, setPausedState] = useState(false);

  const paused = useRef(false);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [videoEffectsActive, setVideoEffectsActive] = useState(false);

  const [audioEffectsActive, setAudioEffectsActive] = useState(false);

  const tintColor = useRef(
    userEffectsStyles.current.video[videoInstanceId].video.tint.color
  );

  const currentTimeRef = useRef<HTMLDivElement>(null);

  const [_, setCaptionsActive] = useState(false);

  const [settingsActive, setSettingsActive] = useState(false);
  const [settings, setSettings] = useState<Settings>(
    structuredClone(defaultSettings)
  );
  const [activePages, setActivePages] =
    useState<ActivePages>(defaultActivePages);

  const recording = useRef(false);
  const downloadRecordingReady = useRef(false);

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
  }>(videoMediaInstance.initPositioning);

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const isScrubbing = useRef(false);
  const wasPaused = useRef(false);

  const lowerVideoController = new LowerVideoController(
    videoInstanceId,
    videoMediaInstance,
    videoContainerRef,
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
    userEffects,
    userEffectsStyles,
    setSettingsActive,
    recording,
    downloadRecordingReady,
    setRerender,
    timelineContainerRef,
    isScrubbing,
    wasPaused,
    tableStaticContentSocket,
    setSettings
  );

  const videoController = new VideoController(
    videoInstanceId,
    videoMediaInstance,
    videoContainerRef,
    videoOptions,
    userEffects,
    userEffectsStyles,
    tintColor,
    paused,
    setPausedState,
    lowerVideoController
  );

  useEffect(() => {
    subContainerRef.current?.appendChild(videoMediaInstance.instanceCanvas);
    if (videoMediaInstance.instanceCanvas) {
      subContainerRef.current?.appendChild(videoMediaInstance.instanceCanvas);
      positioning.current.scale = {
        x: videoMediaInstance.videoMedia.aspect
          ? positioning.current.scale.y * videoMediaInstance.videoMedia.aspect
          : positioning.current.scale.x,
        y: positioning.current.scale.y,
      };

      // Keep video time
      lowerVideoController.timeUpdate();
      videoMediaInstance.instanceVideo?.addEventListener(
        "timeupdate",
        lowerVideoController.timeUpdate
      );

      videoMediaInstance.instanceVideo?.addEventListener(
        "enterpictureinpicture",
        () => lowerVideoController.handlePictureInPicture("enter")
      );

      videoMediaInstance.instanceVideo?.addEventListener(
        "leavepictureinpicture",
        () => lowerVideoController.handlePictureInPicture("leave")
      );

      setRerender((prev) => !prev);
    }
    videoMediaInstance.videoMedia.addDownloadCompleteListener(() => {
      if (videoMediaInstance.instanceCanvas) {
        const allCanvas = subContainerRef.current?.querySelectorAll("canvas");

        if (allCanvas) {
          allCanvas.forEach((canvasElement) => {
            canvasElement.remove();
          });
        }

        subContainerRef.current?.appendChild(videoMediaInstance.instanceCanvas);

        positioning.current.scale = {
          x: videoMediaInstance.videoMedia.aspect
            ? positioning.current.scale.y * videoMediaInstance.videoMedia.aspect
            : positioning.current.scale.x,
          y: positioning.current.scale.y,
        };

        // Keep video time
        lowerVideoController.timeUpdate();
        videoMediaInstance.instanceVideo?.addEventListener(
          "timeupdate",
          lowerVideoController.timeUpdate
        );

        videoMediaInstance.instanceVideo?.addEventListener(
          "enterpictureinpicture",
          () => lowerVideoController.handlePictureInPicture("enter")
        );

        videoMediaInstance.instanceVideo?.addEventListener(
          "leavepictureinpicture",
          () => lowerVideoController.handlePictureInPicture("leave")
        );

        setRerender((prev) => !prev);
      }
    });

    // Set up initial conditions
    videoController.init();

    document.addEventListener("keydown", lowerVideoController.handleKeyDown);

    document.addEventListener("keyup", lowerVideoController.handleKeyUp);

    return () => {
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener()
        )
      );
      positioningListeners.current = {};
      document.removeEventListener(
        "keydown",
        lowerVideoController.handleKeyDown
      );
      document.removeEventListener("keyup", lowerVideoController.handleKeyUp);
      videoMediaInstance.instanceVideo?.removeEventListener(
        "enterpictureinpicture",
        () => lowerVideoController.handlePictureInPicture("enter")
      );
      videoMediaInstance.instanceVideo?.removeEventListener(
        "leavepictureinpicture",
        () => lowerVideoController.handlePictureInPicture("leave")
      );
    };
  }, []);

  useEffect(() => {
    lowerVideoController.updateCaptionsStyles();
  }, [settings]);

  useEffect(() => {
    tableStaticContentSocket.current?.addMessageListener(
      videoController.handleTableStaticContentMessage
    );

    return () =>
      tableStaticContentSocket.current?.removeMessageListener(
        videoController.handleTableStaticContentMessage
      );
  }, [tableStaticContentSocket.current]);

  return (
    <FgMediaContainer
      mediaId={videoMediaInstance.videoMedia.videoId}
      mediaInstanceId={videoInstanceId}
      filename={videoMediaInstance.videoMedia.filename}
      kind='video'
      rootMedia={videoMediaInstance.instanceVideo}
      bundleRef={bundleRef}
      backgroundMedia={settings.background.value === "true"}
      className='video-container'
      popupElements={[
        videoEffectsActive ? (
          <VideoEffectsSection
            videoInstanceId={videoInstanceId}
            lowerVideoController={lowerVideoController}
            tintColor={tintColor}
            videoMediaInstance={videoMediaInstance}
            videoContainerRef={videoContainerRef}
          />
        ) : null,
        <div
          ref={timelineContainerRef}
          className='timeline-container'
          onPointerDown={lowerVideoController.handleStartScrubbing}
          onPointerMove={lowerVideoController.handleHoverTimelineUpdate}
        >
          <div className='timeline'>
            <div className='thumb-indicator'></div>
          </div>
        </div>,
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
        <PictureInPictureButton
          lowerVideoController={lowerVideoController}
          videoEffectsActive={videoEffectsActive}
          settingsActive={settingsActive}
          scrollingContainerRef={rightLowerVideoControlsRef}
        />,
        <SettingsButton
          lowerVideoController={lowerVideoController}
          videoEffectsActive={videoEffectsActive}
          videoContainerRef={videoContainerRef}
          settingsActive={settingsActive}
          setSettingsActive={setSettingsActive}
          activePages={activePages}
          setActivePages={setActivePages}
          settings={settings}
          setSettings={setSettings}
          scrollingContainerRef={rightLowerVideoControlsRef}
        />,
        <DownloadButton
          settings={settings}
          recording={recording}
          lowerVideoController={lowerVideoController}
          videoEffectsActive={videoEffectsActive}
          scrollingContainerRef={rightLowerVideoControlsRef}
        />,
        settings.downloadType.value === "record" &&
        downloadRecordingReady.current ? (
          <DownloadRecordingButton
            lowerVideoController={lowerVideoController}
            videoEffectsActive={videoEffectsActive}
            scrollingContainerRef={rightLowerVideoControlsRef}
          />
        ) : null,
        <CaptionButton
          lowerVideoController={lowerVideoController}
          videoEffectsActive={videoEffectsActive}
          settingsActive={settingsActive}
          settings={settings}
          audioStream={videoMediaInstance.getAudioTrack()!}
          videoContainerRef={videoContainerRef}
          scrollingContainerRef={rightLowerVideoControlsRef}
          containerRef={subContainerRef}
        />,
        <VideoEffectsButton
          lowerVideoController={lowerVideoController}
          videoEffectsActive={videoEffectsActive}
          scrollingContainerRef={rightLowerVideoControlsRef}
          settingsActive={settingsActive}
        />,
        // <AudioEffectsButton
        //   table_id={table_id.current}
        //   username={username.current}
        //   instance={instance.current}
        //   isUser={false}
        //   permissions={undefined}
        //   producerType={"video"}
        //   producerId={videoInstanceId}
        //   audioEffectsActive={audioEffectsActive}
        //   setAudioEffectsActive={setAudioEffectsActive}
        //   visualMediaContainerRef={videoContainerRef}
        //   handleAudioEffectChange={handleAudioEffectChange}
        //   handleMute={handleMute}
        //   videoContentMute={videoContentMute}
        //   closeLabelElement={
        //     <FgHoverContentStandard content='Close (x)' style='dark' />
        //   }
        //   hoverLabelElement={
        //     <FgHoverContentStandard content='Audio effects (a)' style='dark' />
        //   }
        //   scrollingContainerRef={rightLowerVideoControlsRef}
        //   style={{ transform: "scaleX(-1)" }}
        //   options={{
        //     backgroundColor: "rgba(10, 10, 10, 1)",
        //     secondaryBackgroundColor: "rgba(35, 35, 35, 1)",
        //   }}
        // />,
      ]}
      inMediaVariables={[videoEffectsActive, pausedState, settingsActive]}
      preventLowerLabelsVariables={[settingsActive, videoEffectsActive]}
      externalPositioning={positioning}
      externalMediaContainerRef={videoContainerRef}
      externalSubContainerRef={subContainerRef}
      externalRightLowerControlsRef={rightLowerVideoControlsRef}
    />
  );
}
