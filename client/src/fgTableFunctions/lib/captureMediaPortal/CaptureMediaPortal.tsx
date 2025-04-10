import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Transition, Variants, motion } from "framer-motion";
import { useUserInfoContext } from "../../../context/userInfoContext/UserInfoContext";
import { useEffectsContext } from "../../../context/effectsContext/EffectsContext";
import FgPortal from "../../../elements/fgPortal/FgPortal";
import CloseButton from "./lib/CloseButton";
import CaptureButton from "./lib/capture/CaptureButton";
import TableFunctionsController from "../TableFunctionsController";
import MediaTypeButton from "./lib/capture/mediaType/TypeButton";
import EffectsButton from "./lib/capture/effects/EffectsButton";
import CaptureMediaController from "./lib/CaptureMediaController";
import CaptureMedia from "../../../media/capture/CaptureMedia";
import EffectsSection from "./lib/capture/effects/EffectsSection";
import TypeSection from "./lib/capture/mediaType/TypeSection";
import {
  ActivePages,
  CaptureMediaTypes,
  defaultActivePages,
  defaultSettings,
  Settings,
} from "./lib/typeConstant";
import ConfirmButton from "./lib/finalize/ConfirmButton";
import DownloadButton from "./lib/finalize/DownloadButton";
import SettingsButton from "./lib/settingsButton/SettingsButton";
import VideoDurationSection from "./lib/finalize/VideoDurationSection";
import DelayCountDownButton from "./lib/delay/DelayCountDownButton";
import ShutterSVG from "../../../elements/shutterSVG/ShutterSVG";
import "./lib/captureMedia.css";

const CaptureMediaVar: Variants = {
  init: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 100 },
    },
  },
};

const CaptureMediaTransition: Transition = {
  transition: {
    opacity: { duration: 0.001 },
    scale: { duration: 0.001 },
  },
};

export default function CaptureMediaPortal({
  captureMedia,
  tableFunctionsController,
  setCaptureMediaActive,
}: {
  captureMedia: React.MutableRefObject<CaptureMedia | undefined>;
  tableFunctionsController: TableFunctionsController;
  setCaptureMediaActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { captureEffects, captureEffectsStyles } = useEffectsContext();
  const { table_id, preferences } = useUserInfoContext();

  const [inCaptureMedia, setInCaptureMedia] = useState(false);
  const [captureMediaEffectsActive, setCaptureMediaEffectsActive] =
    useState(false);
  const [captureMediaTypeActive, setCaptureMediaTypeActive] = useState(false);

  const [mediaType, setMediaType] = useState<CaptureMediaTypes>("camera");

  const [largestDim, setLargestDim] = useState<"width" | "height">("width");
  const [controlsHeight, setControlsHeight] = useState(0);

  const captureMediaPortalRef = useRef<HTMLDivElement>(null);
  const captureMainContainerRef = useRef<HTMLDivElement>(null);
  const captureContainerRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const tintColor = useRef(captureEffectsStyles.current.tint.color);

  const leaveTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const movementTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const countDownTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const countDownInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  const [recording, setRecording] = useState(false);
  const [recordingCount, setRecordingCount] = useState(0);

  const [finalizeCapture, setFinalizeCapture] = useState(false);
  const finalizingCapture = useRef(false);
  const finalizedCaptureType = useRef<"image" | "video" | undefined>(undefined);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [settingsActive, setSettingsActive] = useState(false);
  const [settings, setSettings] = useState<Settings>(
    structuredClone(defaultSettings),
  );
  const [activePages, setActivePages] =
    useState<ActivePages>(defaultActivePages);

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const isScrubbing = useRef(false);
  const wasPaused = useRef(false);

  const [_, setRerender] = useState(false);

  const delaying = useRef(false);
  const [delayCountDown, setDelayCountDown] = useState(0);
  const delayTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const delayCountDownInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  const captureMediaController = new CaptureMediaController(
    table_id,
    captureEffects,
    captureMedia,
    captureContainerRef,
    setCaptureMediaEffectsActive,
    setCaptureMediaTypeActive,
    setInCaptureMedia,
    leaveTimer,
    movementTimeout,
    tintColor,
    mediaType,
    setRecordingCount,
    recording,
    setRecording,
    setFinalizeCapture,
    countDownTimeout,
    countDownInterval,
    shiftPressed,
    controlPressed,
    captureMediaPortalRef,
    tableFunctionsController,
    finalizingCapture,
    finalizedCaptureType,
    videoRef,
    imageRef,
    settings,
    timelineContainerRef,
    isScrubbing,
    wasPaused,
    setCaptureMediaActive,
    setRerender,
    setDelayCountDown,
    delayTimeout,
    delayCountDownInterval,
    delaying,
  );

  const handleResize = () => {
    if (!captureMedia.current || !captureMainContainerRef.current) return;

    const aspect =
      captureMedia.current.video.videoWidth /
      captureMedia.current.video.videoHeight;

    const maxHeight = captureMainContainerRef.current.clientHeight;
    const maxWidth = captureMainContainerRef.current.clientWidth;

    const calculatedMaxWidthHeight = maxWidth / aspect;

    if (calculatedMaxWidthHeight > maxHeight) {
      setLargestDim("height");
    } else {
      setLargestDim("width");
    }

    setControlsHeight(
      Math.max(
        24,
        Math.min(48, captureMainContainerRef.current.clientHeight * 0.12),
      ),
    );
  };

  useEffect(() => {
    if (delaying.current) {
      if (captureMedia.current) {
        captureMedia.current.canvas.remove();
        captureContainerRef.current?.appendChild(captureMedia.current.canvas);
        captureMedia.current?.restartVideo();
      }
    } else if (finalizingCapture.current) {
      if (captureMedia.current) {
        captureMedia.current.canvas.remove();
      }
    } else {
      if (captureMedia.current) {
        captureMedia.current?.canvas.remove();
        captureContainerRef.current?.appendChild(captureMedia.current.canvas);
        captureMedia.current?.restartVideo();
      }
    }
  }, [finalizingCapture.current, delaying.current]);

  useLayoutEffect(() => {
    if (!captureMainContainerRef.current) {
      return;
    }

    const observer = new ResizeObserver(handleResize);

    observer.observe(captureMainContainerRef.current);

    return () => observer.disconnect();
  }, [
    captureMainContainerRef.current,
    finalizingCapture.current,
    delaying.current,
  ]);

  useEffect(() => {
    document.addEventListener("keydown", captureMediaController.handleKeyDown);
    document.addEventListener("keyup", captureMediaController.handleKeyUp);
    if (captureMedia.current)
      captureMedia.current.video.addEventListener(
        "loadedmetadata",
        handleResize,
      );

    return () => {
      document.removeEventListener(
        "keydown",
        captureMediaController.handleKeyDown,
      );
      document.removeEventListener("keyup", captureMediaController.handleKeyUp);
      if (captureMedia.current)
        captureMedia.current.video.removeEventListener(
          "loadedmetadata",
          handleResize,
        );
    };
  }, []);

  return !finalizeCapture && !delaying.current ? (
    <FgPortal
      type="staticTopDomain"
      top={0}
      left={0}
      zValue={500000000}
      className="h-full w-full"
      content={
        <div
          ref={captureMediaPortalRef}
          className={`${
            inCaptureMedia ||
            captureMediaEffectsActive ||
            captureMediaTypeActive ||
            settingsActive
              ? "in-capture-media"
              : ""
          } capture-media-container pointer-events-none h-full w-full bg-fg-tone-black-4 bg-opacity-45`}
        >
          <div
            ref={captureMainContainerRef}
            className="absolute left-1/2 top-1/2 flex h-[95%] w-4/5 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          >
            <motion.div
              ref={captureContainerRef}
              className={`${
                largestDim === "width" ? "w-full" : "h-full"
              } pointer-events-auto relative overflow-hidden rounded-md bg-transparent`}
              style={{
                aspectRatio: `${captureMedia.current?.video.videoWidth} / ${captureMedia.current?.video.videoHeight}`,
              }}
              onPointerEnter={captureMediaController.handlePointerEnter}
              onPointerLeave={captureMediaController.handlePointerLeave}
              variants={CaptureMediaVar}
              initial="init"
              animate="animate"
              exit="init"
              transition={CaptureMediaTransition}
            >
              <div className="capture-media-overlay-container pointer-events-none absolute left-0 top-0 z-10 h-full w-full">
                {captureMediaTypeActive && (
                  <TypeSection
                    captureMedia={captureMedia}
                    captureContainerRef={captureContainerRef}
                    setMediaType={setMediaType}
                    setRecordingCount={setRecordingCount}
                    recording={recording}
                  />
                )}
                {captureMediaEffectsActive && (
                  <EffectsSection
                    tintColor={tintColor}
                    captureMedia={captureMedia}
                    captureMediaController={captureMediaController}
                    captureContainerRef={captureContainerRef}
                  />
                )}
                <div className="absolute left-0 top-[1%] flex h-[12%] max-h-12 min-h-6 w-full items-center justify-center">
                  <CloseButton
                    delaying={delaying}
                    finalizeCapture={finalizeCapture}
                    tableFunctionsController={tableFunctionsController}
                    captureMediaController={captureMediaController}
                  />
                </div>
                <div className="absolute bottom-[1%] left-0 flex h-[12%] max-h-12 min-h-6 w-full items-center justify-center space-x-3">
                  <div
                    className="flex h-full items-center justify-end overflow-hidden"
                    style={{ width: `calc(50% - ${controlsHeight / 2}px` }}
                  >
                    <MediaTypeButton
                      mediaType={mediaType}
                      recording={recording}
                      recordingCount={recordingCount}
                      captureMediaController={captureMediaController}
                      captureMediaEffectsActive={captureMediaEffectsActive}
                      captureMediaTypeActive={captureMediaTypeActive}
                    />
                  </div>
                  <CaptureButton
                    recording={recording}
                    captureMediaController={captureMediaController}
                  />
                  <div
                    className="flex h-full items-center justify-between overflow-hidden pr-3"
                    style={{ width: `calc(50% - ${controlsHeight / 2}px` }}
                  >
                    <EffectsButton
                      captureMediaController={captureMediaController}
                      captureMediaEffectsActive={captureMediaEffectsActive}
                      captureMediaTypeActive={captureMediaTypeActive}
                    />
                    <SettingsButton
                      captureMediaController={captureMediaController}
                      captureMediaEffectsActive={captureMediaEffectsActive}
                      captureMediaTypeActive={captureMediaTypeActive}
                      settingsActive={settingsActive}
                      setSettingsActive={setSettingsActive}
                      activePages={activePages}
                      setActivePages={setActivePages}
                      settings={settings}
                      setSettings={setSettings}
                      finalizeCapture={finalizeCapture}
                      mediaType={mediaType}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      }
      options={{ animate: false }}
    />
  ) : delaying.current ? (
    <FgPortal
      className="h-full w-full"
      type="staticTopDomain"
      top={0}
      left={0}
      zValue={500000000}
      content={
        <div
          ref={captureMediaPortalRef}
          className={`${
            inCaptureMedia || settingsActive ? "in-capture-media" : ""
          } capture-media-container aspect h-full w-full bg-fg-tone-black-4 bg-opacity-45`}
        >
          <div className="absolute left-1/2 top-1/2 flex h-[95%] w-4/5 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <motion.div
              ref={captureContainerRef}
              className={`${
                largestDim === "width" ? "w-full" : "h-full"
              } pointer-events-auto relative overflow-hidden rounded-md bg-transparent`}
              style={{
                aspectRatio: `${captureMedia.current?.video.videoWidth} / ${captureMedia.current?.video.videoHeight}`,
              }}
              onPointerEnter={captureMediaController.handlePointerEnter}
              onPointerLeave={captureMediaController.handlePointerLeave}
              variants={CaptureMediaVar}
              initial="init"
              animate="animate"
              exit="init"
              transition={CaptureMediaTransition}
            >
              <div className="capture-media-overlay-container pointer-events-none absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center">
                <div className="absolute left-0 top-[1%] z-[100] flex h-[12%] max-h-12 min-h-6 w-full items-center justify-center">
                  <CloseButton
                    delaying={delaying}
                    finalizeCapture={finalizeCapture}
                    tableFunctionsController={tableFunctionsController}
                    captureMediaController={captureMediaController}
                  />
                </div>
                <div className="absolute bottom-[1%] left-0 z-[100] flex h-[16%] max-h-20 min-h-10 w-full items-center justify-center">
                  <DelayCountDownButton delayCountDown={delayCountDown} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      }
      options={{ animate: false }}
    />
  ) : (
    <FgPortal
      className="h-full w-full"
      type="staticTopDomain"
      top={0}
      left={0}
      zValue={500000000}
      content={
        <div
          ref={captureMediaPortalRef}
          className={`${
            inCaptureMedia || settingsActive ? "in-capture-media" : ""
          } capture-media-container aspect h-full w-full bg-fg-tone-black-4 bg-opacity-45`}
        >
          <div className="absolute left-1/2 top-1/2 flex h-[95%] w-4/5 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <motion.div
              ref={captureContainerRef}
              className={`${
                largestDim === "width" ? "w-full" : "h-full"
              } pointer-events-auto relative overflow-hidden rounded-md bg-transparent`}
              style={{
                aspectRatio: `${captureMedia.current?.video.videoWidth} / ${captureMedia.current?.video.videoHeight}`,
              }}
              onPointerEnter={captureMediaController.handlePointerEnter}
              onPointerLeave={captureMediaController.handlePointerLeave}
              variants={CaptureMediaVar}
              initial="init"
              animate="animate"
              exit="init"
              transition={CaptureMediaTransition}
            >
              {finalizedCaptureType.current === "image" && (
                <ShutterSVG soundEffect={preferences.current.soundEffects} />
              )}
              {finalizedCaptureType.current === "image" ? (
                <img
                  ref={imageRef}
                  className="absolute left-0 top-0 z-10 h-full w-full"
                  src={captureMedia.current?.babylonScene?.downloadSnapShotLink()}
                />
              ) : finalizedCaptureType.current === "video" ? (
                <video
                  ref={videoRef}
                  className="pointer-events-auto absolute left-0 top-0 z-10 h-full w-full"
                  src={captureMedia.current?.babylonScene?.downloadRecordingLink()}
                  autoPlay
                  onClick={captureMediaController.handlePausePlay}
                />
              ) : null}
              <div className="capture-media-overlay-container pointer-events-none absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center">
                {finalizedCaptureType.current === "video" && (
                  <div
                    ref={timelineContainerRef}
                    className="timeline-container z-[100]"
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      captureMediaController.handleStartScrubbing(event);
                    }}
                    onPointerMove={(event) => {
                      event.stopPropagation();
                      captureMediaController.handleHoverTimelineUpdate(event);
                    }}
                  >
                    <div className="timeline">
                      <div className="thumb-indicator"></div>
                    </div>
                  </div>
                )}
                <div className="absolute left-0 top-[1%] z-[100] flex h-[12%] max-h-12 min-h-6 w-full items-center justify-center">
                  <CloseButton
                    delaying={delaying}
                    finalizeCapture={finalizeCapture}
                    tableFunctionsController={tableFunctionsController}
                    captureMediaController={captureMediaController}
                  />
                </div>
                <div className="absolute bottom-[1%] left-0 z-[100] flex h-[12%] max-h-12 min-h-6 w-full items-center justify-center space-x-3">
                  <div
                    className="flex h-full items-center justify-start overflow-hidden pl-3"
                    style={{ width: `calc(50% - ${controlsHeight / 2}px` }}
                  >
                    {finalizedCaptureType.current === "video" && (
                      <VideoDurationSection
                        captureMediaController={captureMediaController}
                        videoRef={videoRef}
                      />
                    )}
                  </div>
                  <ConfirmButton
                    captureMediaController={captureMediaController}
                  />
                  <div
                    className={`${
                      finalizedCaptureType.current === "video"
                        ? "justify-between"
                        : "justify-start"
                    } flex h-full items-center overflow-hidden pr-3`}
                    style={{ width: `calc(50% - ${controlsHeight / 2}px` }}
                  >
                    <DownloadButton
                      captureMediaController={captureMediaController}
                    />
                    {finalizedCaptureType.current === "video" && (
                      <SettingsButton
                        captureMediaController={captureMediaController}
                        captureMediaEffectsActive={captureMediaEffectsActive}
                        captureMediaTypeActive={captureMediaTypeActive}
                        settingsActive={settingsActive}
                        setSettingsActive={setSettingsActive}
                        activePages={activePages}
                        setActivePages={setActivePages}
                        settings={settings}
                        setSettings={setSettings}
                        finalizeCapture={finalizeCapture}
                        mediaType={mediaType}
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      }
      options={{ animate: false }}
    />
  );
}
