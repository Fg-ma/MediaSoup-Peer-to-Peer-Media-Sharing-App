import { Events as HlsEvents } from "hls.js";
import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import { useSignalContext } from "../../context/signalContext/SignalContext";
import VideoController from "./lib/VideoController";
import LowerVideoController from "./lib/lowerVideoControls/LowerVideoController";
import {
  defaultVideoOptions,
  VideoOptions,
  ActivePages,
  defaultActivePages,
} from "./lib/typeConstant";
import FgMediaContainer from "../fgMediaContainer/FgMediaContainer";
import VideoEffectsSection from "./lib/videoEffectsSection/VideoEffectsSection";
import VideoEffectsButton from "./lib/lowerVideoControls/videoEffectsButton/VideoEffectsButton";
import PlayPauseButton from "./lib/lowerVideoControls/playPauseButton/PlayPauseButton";
import PictureInPictureButton from "./lib/lowerVideoControls/pictureInPictureButton/PictureInPictureButton";
import CaptionButton from "./lib/lowerVideoControls/captionsButton/CaptionButton";
import SettingsButton from "./lib/lowerVideoControls/settingsButton/SettingsButton";
import DownloadButton from "./lib/lowerVideoControls/downloadButton/DownloadButton";
import DownloadRecordingButton from "./lib/lowerVideoControls/downloadButton/DownloadRecordingButton";
import "./lib/fgVideoStyles.css";

export default function FgTableVideo({
  videoInstanceId,
  bundleRef,
  tableRef,
  videoContentMute,
  options,
}: {
  videoInstanceId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
  videoContentMute: React.MutableRefObject<{
    [videoId: string]: boolean;
  }>;
  options?: VideoOptions;
}) {
  const videoOptions = {
    ...defaultVideoOptions,
    ...options,
  };

  const { staticContentMedia } = useMediaContext();
  const { staticContentEffects, staticContentEffectsStyles } =
    useEffectsContext();
  const { tableStaticContentSocket, videoSocket } = useSocketContext();
  const { sendGroupSignal } = useSignalContext();

  const videoMediaInstance =
    staticContentMedia.current.video.tableInstances[videoInstanceId];

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const rightLowerVideoControlsRef = useRef<HTMLDivElement>(null);

  const [videoEffectsActive, setVideoEffectsActive] = useState(false);

  const [audioEffectsActive, setAudioEffectsActive] = useState(false);

  const tintColor = useRef(
    staticContentEffectsStyles.current.video[videoInstanceId].video.tint.color,
  );

  const currentTimeRef = useRef<HTMLDivElement>(null);

  const [captionsActive, setCaptionsActive] = useState(false);

  const [settingsActive, setSettingsActive] = useState(false);
  const [activePages, setActivePages] =
    useState<ActivePages>(defaultActivePages);

  const recording = useRef(false);
  const downloadRecordingReady = useRef(false);

  const [_, setRerender] = useState(false);

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

  const lowerVideoController = useRef(
    new LowerVideoController(
      videoInstanceId,
      videoMediaInstance,
      videoContainerRef,
      setCaptionsActive,
      currentTimeRef,
      setVideoEffectsActive,
      setAudioEffectsActive,
      tintColor,
      staticContentEffects,
      staticContentEffectsStyles,
      setSettingsActive,
      recording,
      downloadRecordingReady,
      setRerender,
      timelineContainerRef,
      isScrubbing,
      wasPaused,
      tableStaticContentSocket,
      videoSocket,
      sendGroupSignal,
    ),
  );

  const videoController = useRef(
    new VideoController(
      videoInstanceId,
      videoMediaInstance,
      videoContainerRef,
      videoOptions,
      staticContentEffects,
      staticContentEffectsStyles,
      tintColor,
      lowerVideoController,
      setRerender,
      subContainerRef,
      positioning,
      setSettingsActive,
    ),
  );

  useEffect(() => {
    if (
      videoMediaInstance.instanceVideo &&
      videoMediaInstance.instanceCanvas &&
      videoMediaInstance.videoMedia.loadingState === "downloaded"
    ) {
      subContainerRef.current?.appendChild(videoMediaInstance.instanceCanvas);
      positioning.current.scale = {
        x: videoMediaInstance.videoMedia.aspect
          ? positioning.current.scale.y * videoMediaInstance.videoMedia.aspect
          : positioning.current.scale.x,
        y: positioning.current.scale.y,
      };

      videoMediaInstance.hls.on(
        HlsEvents.BUFFER_APPENDED,
        lowerVideoController.current.bufferUpdate,
      );

      // Keep video time
      lowerVideoController.current.timeUpdate();
      videoMediaInstance.instanceVideo?.addEventListener(
        "timeupdate",
        lowerVideoController.current.timeUpdate,
      );

      videoMediaInstance.instanceVideo?.addEventListener(
        "enterpictureinpicture",
        () => lowerVideoController.current.handlePictureInPicture("enter"),
      );

      videoMediaInstance.instanceVideo?.addEventListener(
        "leavepictureinpicture",
        () => lowerVideoController.current.handlePictureInPicture("leave"),
      );

      setRerender((prev) => !prev);
    }

    // Set up initial conditions
    videoController.current.init();

    videoMediaInstance.videoMedia.addVideoListener(
      videoController.current.handleVideoMessages,
    );

    videoMediaInstance.addVideoInstanceListener(
      videoController.current.handleVideoInstanceMessages,
    );

    document.addEventListener(
      "keydown",
      lowerVideoController.current.handleKeyDown,
    );

    tableRef.current?.addEventListener(
      "scroll",
      videoController.current.handleTableScroll,
    );

    return () => {
      if (
        videoMediaInstance.instanceVideo &&
        videoMediaInstance.instanceCanvas
      ) {
        videoMediaInstance.hls.off(
          HlsEvents.BUFFER_APPENDED,
          lowerVideoController.current.bufferUpdate,
        );
        videoMediaInstance.instanceVideo.removeEventListener(
          "timeupdate",
          lowerVideoController.current.timeUpdate,
        );
        videoMediaInstance.instanceVideo.removeEventListener(
          "enterpictureinpicture",
          () => lowerVideoController.current.handlePictureInPicture("enter"),
        );
        videoMediaInstance.instanceVideo.removeEventListener(
          "leavepictureinpicture",
          () => lowerVideoController.current.handlePictureInPicture("leave"),
        );
      }
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener(),
        ),
      );
      positioningListeners.current = {};
      videoMediaInstance.videoMedia.removeVideoListener(
        videoController.current.handleVideoMessages,
      );
      videoMediaInstance.removeVideoInstanceListener(
        videoController.current.handleVideoInstanceMessages,
      );
      document.removeEventListener(
        "keydown",
        lowerVideoController.current.handleKeyDown,
      );
      tableRef.current?.addEventListener(
        "scroll",
        videoController.current.handleTableScroll,
      );
    };
  }, []);

  useEffect(() => {
    lowerVideoController.current.updateCaptionsStyles();
  }, [videoMediaInstance.settings]);

  useEffect(() => {
    tableStaticContentSocket.current?.addMessageListener(
      videoController.current.handleTableStaticContentMessage,
    );

    return () =>
      tableStaticContentSocket.current?.removeMessageListener(
        videoController.current.handleTableStaticContentMessage,
      );
  }, [tableStaticContentSocket.current]);

  useEffect(() => {
    videoSocket.current?.addMessageListener(
      videoController.current.handleVideoSocketMessage,
    );

    return () =>
      videoSocket.current?.removeMessageListener(
        videoController.current.handleVideoSocketMessage,
      );
  }, [videoSocket.current]);

  useEffect(() => {
    if (videoMediaInstance.settings.ended) {
    } else {
    }

    return () => {
      if (videoMediaInstance.settings.ended) {
      } else {
      }
    };
  }, [videoMediaInstance.settings.ended]);

  return (
    <FgMediaContainer
      filename={videoMediaInstance.videoMedia.filename}
      downloadingState={videoMediaInstance.videoMedia.loadingState}
      addDownloadListener={
        videoMediaInstance.videoMedia.loadingState !== "downloaded"
          ? videoMediaInstance.videoMedia.addVideoListener
          : undefined
      }
      removeDownloadListener={
        videoMediaInstance.videoMedia.loadingState !== "downloaded"
          ? videoMediaInstance.videoMedia.removeVideoListener
          : undefined
      }
      getAspect={videoMediaInstance.getAspect}
      setPositioning={videoMediaInstance.setPositioning}
      mediaId={videoMediaInstance.videoMedia.videoId}
      mediaInstanceId={videoInstanceId}
      kind="video"
      initState={videoMediaInstance.videoMedia.state}
      bundleRef={bundleRef}
      backgroundMedia={videoMediaInstance.settings.background.value}
      className="video-container"
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
          className="timeline-container pointer-events-auto"
          onPointerDown={lowerVideoController.current.handleStartScrubbing}
          onPointerMove={lowerVideoController.current.handleHoverTimelineUpdate}
        >
          <div className="timeline">
            <div className="buffered"></div>
            <div className="thumb-indicator"></div>
          </div>
        </div>,
      ]}
      leftLowerControls={[
        <PlayPauseButton
          videoMediaInstance={videoMediaInstance}
          lowerVideoController={lowerVideoController}
          videoEffectsActive={videoEffectsActive}
          settingsActive={settingsActive}
        />,
        <div className="flex select-none items-center gap-1 px-1">
          <div ref={currentTimeRef} className="font-K2D text-lg"></div>
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
          videoMediaInstance={videoMediaInstance}
          lowerVideoController={lowerVideoController}
          videoEffectsActive={videoEffectsActive}
          videoContainerRef={videoContainerRef}
          settingsActive={settingsActive}
          setSettingsActive={setSettingsActive}
          activePages={activePages}
          setActivePages={setActivePages}
          scrollingContainerRef={rightLowerVideoControlsRef}
          setExternalRerender={setRerender}
        />,
        videoMediaInstance.videoMedia.loadingState === "downloaded" && (
          <DownloadButton
            videoMediaInstance={videoMediaInstance}
            recording={recording}
            lowerVideoController={lowerVideoController}
            videoEffectsActive={videoEffectsActive}
            scrollingContainerRef={rightLowerVideoControlsRef}
          />
        ),
        videoMediaInstance.settings.downloadType.value === "record" &&
        downloadRecordingReady.current ? (
          <DownloadRecordingButton
            lowerVideoController={lowerVideoController}
            videoEffectsActive={videoEffectsActive}
            scrollingContainerRef={rightLowerVideoControlsRef}
          />
        ) : null,
        <CaptionButton
          videoMediaInstance={videoMediaInstance}
          lowerVideoController={lowerVideoController}
          videoEffectsActive={videoEffectsActive}
          settingsActive={settingsActive}
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
        //   tableId={tableId.current}
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
      inMediaVariables={[
        videoEffectsActive,
        !videoMediaInstance.settings.isPlaying.value,
        settingsActive,
      ]}
      preventLowerLabelsVariables={[settingsActive, videoEffectsActive]}
      externalPositioning={positioning}
      externalMediaContainerRef={videoContainerRef}
      externalSubContainerRef={subContainerRef}
      externalRightLowerControlsRef={rightLowerVideoControlsRef}
    />
  );
}
