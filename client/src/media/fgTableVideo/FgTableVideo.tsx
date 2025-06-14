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
import FgSVGElement from "../../elements/fgSVGElement/FgSVGElement";
import "./lib/fgVideoStyles.css";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;
const playIcon = nginxAssetServerBaseUrl + "svgs/playIcon.svg";

export default function FgTableVideo({
  tableTopRef,
  videoInstanceId,
  bundleRef,
  tableRef,
  videoContentMute,
  options,
}: {
  tableTopRef: React.RefObject<HTMLDivElement>;
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

  const videoMediaInstance = useRef(
    staticContentMedia.current.video.tableInstances[videoInstanceId],
  );

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
  }>(videoMediaInstance.current.initPositioning);

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const isScrubbing = useRef(false);
  const wasPaused = useRef(false);

  const [isEnded, setIsEnded] = useState(videoMediaInstance.current.meta.ended);

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
      setRerender,
      setSettingsActive,
      positioning,
      subContainerRef,
      setIsEnded,
    ),
  );

  useEffect(() => {
    videoController.current.init();

    videoMediaInstance.current.videoMedia.addVideoListener(
      videoController.current.handleVideoMessages,
    );

    videoMediaInstance.current.addVideoInstanceListener(
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
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener(),
        ),
      );
      positioningListeners.current = {};
      videoMediaInstance.current.videoMedia.removeVideoListener(
        videoController.current.handleVideoMessages,
      );
      videoMediaInstance.current.removeVideoInstanceListener(
        videoController.current.handleVideoInstanceMessages,
      );
      document.removeEventListener(
        "keydown",
        lowerVideoController.current.handleKeyDown,
      );
      tableRef.current?.removeEventListener(
        "scroll",
        videoController.current.handleTableScroll,
      );
    };
  }, []);

  useEffect(() => {
    lowerVideoController.current.updateCaptionsStyles();
  }, [videoMediaInstance.current.settings]);

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
    if (videoMediaInstance.current.meta.ended) {
      if (videoMediaInstance.current.instanceThumbnail) {
        subContainerRef.current?.appendChild(
          videoMediaInstance.current.instanceThumbnail,
        );
      }
    } else {
      subContainerRef.current?.appendChild(
        videoMediaInstance.current.instanceCanvas,
      );
    }

    return () => {
      videoMediaInstance.current.instanceThumbnail?.remove();
      videoMediaInstance.current.instanceCanvas.remove();
    };
  }, [isEnded, videoMediaInstance.current.instanceThumbnailSetUp]);

  useEffect(() => {
    if (videoMediaInstance.current.instanceVideo === undefined) return;

    positioning.current.scale = {
      x: videoMediaInstance.current.videoMedia.aspect
        ? positioning.current.scale.y *
          videoMediaInstance.current.videoMedia.aspect
        : positioning.current.scale.x,
      y: positioning.current.scale.y,
    };

    videoMediaInstance.current.hls.on(
      HlsEvents.BUFFER_APPENDED,
      lowerVideoController.current.bufferUpdate,
    );

    // Keep video time
    lowerVideoController.current.timeUpdate();
    videoMediaInstance.current.instanceVideo?.addEventListener(
      "timeupdate",
      lowerVideoController.current.timeUpdate,
    );

    videoMediaInstance.current.instanceVideo?.addEventListener(
      "enterpictureinpicture",
      () => lowerVideoController.current.handlePictureInPicture("enter"),
    );

    videoMediaInstance.current.instanceVideo?.addEventListener(
      "leavepictureinpicture",
      () => lowerVideoController.current.handlePictureInPicture("leave"),
    );

    setRerender((prev) => !prev);

    return () => {
      videoMediaInstance.current.hls.off(
        HlsEvents.BUFFER_APPENDED,
        lowerVideoController.current.bufferUpdate,
      );
      videoMediaInstance.current.instanceVideo?.removeEventListener(
        "timeupdate",
        lowerVideoController.current.timeUpdate,
      );
      videoMediaInstance.current.instanceVideo?.removeEventListener(
        "enterpictureinpicture",
        () => lowerVideoController.current.handlePictureInPicture("enter"),
      );
      videoMediaInstance.current.instanceVideo?.removeEventListener(
        "leavepictureinpicture",
        () => lowerVideoController.current.handlePictureInPicture("leave"),
      );
    };
  }, [videoMediaInstance.current.instanceVideoSetUp]);

  return (
    <FgMediaContainer
      tableRef={tableRef}
      tableTopRef={tableTopRef}
      filename={videoMediaInstance.current.videoMedia.filename}
      downloadingState={videoMediaInstance.current.videoMedia.loadingState}
      addDownloadListener={
        videoMediaInstance.current.videoMedia.loadingState !== "downloaded"
          ? videoMediaInstance.current.videoMedia.addVideoListener
          : undefined
      }
      removeDownloadListener={
        videoMediaInstance.current.videoMedia.loadingState !== "downloaded"
          ? videoMediaInstance.current.videoMedia.removeVideoListener
          : undefined
      }
      getAspect={videoMediaInstance.current.getAspect}
      setPositioning={videoMediaInstance.current.setPositioning}
      mediaId={videoMediaInstance.current.videoMedia.videoId}
      mediaInstanceId={videoInstanceId}
      kind="video"
      initState={videoMediaInstance.current.videoMedia.state}
      bundleRef={bundleRef}
      backgroundMedia={videoMediaInstance.current.settings.background.value}
      className="video-container"
      popupElements={
        !videoMediaInstance.current.meta.ended
          ? [
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
                onPointerDown={
                  lowerVideoController.current.handleStartScrubbing
                }
                onPointerMove={
                  lowerVideoController.current.handleHoverTimelineUpdate
                }
              >
                <div className="timeline">
                  <div className="buffered"></div>
                  <div className="thumb-indicator"></div>
                </div>
              </div>,
            ]
          : [
              <div
                className="pointer-events-auto absolute left-0 top-0 flex h-full w-full items-center justify-center bg-fg-tone-black-1 bg-opacity-20"
                onClick={lowerVideoController.current.handlePausePlay}
              >
                <FgSVGElement
                  src={playIcon}
                  className={`aspect-square fill-fg-white stroke-fg-white ${(videoMediaInstance.current.videoMedia.aspect ?? 1) > 1 ? "h-[50%]" : "w-[50%]"}`}
                  attributes={[
                    { key: "width", value: "100%" },
                    { key: "height", value: "100%" },
                  ]}
                />
              </div>,
            ]
      }
      leftLowerControls={
        !videoMediaInstance.current.meta.ended
          ? [
              <PlayPauseButton
                videoMediaInstance={videoMediaInstance}
                lowerVideoController={lowerVideoController}
                videoEffectsActive={videoEffectsActive}
                settingsActive={settingsActive}
              />,
              <div className="flex select-none items-center gap-1 px-1">
                <div ref={currentTimeRef} className="font-K2D text-lg"></div>
              </div>,
            ]
          : []
      }
      rightLowerControls={[
        <PictureInPictureButton
          lowerVideoController={lowerVideoController}
          videoEffectsActive={videoEffectsActive}
          settingsActive={settingsActive}
          scrollingContainerRef={rightLowerVideoControlsRef}
        />,
        ...(!videoMediaInstance.current.meta.ended
          ? [
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
              videoMediaInstance.current.videoMedia.loadingState ===
                "downloaded" && (
                <DownloadButton
                  videoMediaInstance={videoMediaInstance}
                  recording={recording}
                  lowerVideoController={lowerVideoController}
                  videoEffectsActive={videoEffectsActive}
                  scrollingContainerRef={rightLowerVideoControlsRef}
                />
              ),
              videoMediaInstance.current.settings.downloadType.value ===
                "record" && downloadRecordingReady.current ? (
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
                audioStream={videoMediaInstance.current.getAudioTrack()!}
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
            ]
          : []),
      ]}
      inMediaVariables={[
        videoEffectsActive,
        !videoMediaInstance.current.meta.ended &&
          !videoMediaInstance.current.meta.isPlaying,
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
