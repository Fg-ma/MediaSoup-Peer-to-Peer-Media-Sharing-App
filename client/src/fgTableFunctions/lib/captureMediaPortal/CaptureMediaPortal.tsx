import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useEffectsContext } from "../../../context/effectsContext/EffectsContext";
import FgPortal from "../../../elements/fgPortal/FgPortal";
import CloseButton from "./lib/CloseButton";
import CaptureButton from "./lib/CaptureButton";
import TableFunctionsController from "../TableFunctionsController";
import MediaTypeButton from "./lib/MediaTypeButton";
import CaptureMediaEffectsButton from "./lib/CaptureMediaEffectsButton";
import CaptureMediaController from "./lib/CaptureMediaController";
import CaptureMedia from "../../../media/capture/CaptureMedia";
import CaptureMediaEffectsSection from "./lib/CaptureMediaEffectsSection";
import "./lib/captureMedia.css";
import CaptureMediaTypeSection from "./lib/CaptureMediaTypeSection";
import { CaptureMediaTypes } from "./lib/typeConstant";
import ConfirmButton from "./lib/ConfirmButton";
import DownloadButton from "./lib/DownloadButton";

export default function CaptureMediaPortal({
  captureMedia,
  tableFunctionsController,
}: {
  captureMedia: React.RefObject<CaptureMedia | undefined>;
  tableFunctionsController: TableFunctionsController;
}) {
  const { captureStreamEffects, captureEffectsStyles } = useEffectsContext();

  const [inCaptureMedia, setInCaptureMedia] = useState(false);
  const [captureMediaEffectsActive, setCaptureMediaEffectsActive] =
    useState(false);
  const [captureMediaTypeActive, setCaptureMediaTypeActive] = useState(false);

  const [mediaType, setMediaType] = useState<CaptureMediaTypes>("camera");

  const [largestDim, setLargestDim] = useState<"width" | "height">("width");

  const captureMediaPortalRef = useRef<HTMLDivElement>(null);
  const captureMainContainerRef = useRef<HTMLDivElement>(null);
  const captureContainerRef = useRef<HTMLDivElement>(null);

  const tintColor = useRef(captureEffectsStyles.current.tint.color);

  const leaveTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const movementTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const countDownTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const countDownInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  const [recording, setRecording] = useState(false);
  const [recordingCount, setRecordingCount] = useState(0);

  const [finalizeCapture, setFinalizeCapture] = useState(false);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const captureMediaController = new CaptureMediaController(
    captureStreamEffects,
    captureMedia,
    captureContainerRef,
    captureMediaEffectsActive,
    setCaptureMediaEffectsActive,
    captureMediaTypeActive,
    setCaptureMediaTypeActive,
    setInCaptureMedia,
    leaveTimer,
    movementTimeout,
    tintColor,
    mediaType,
    setRecordingCount,
    recording,
    setRecording,
    finalizeCapture,
    setFinalizeCapture,
    countDownTimeout,
    countDownInterval,
    shiftPressed,
    controlPressed,
    captureMediaPortalRef,
    tableFunctionsController
  );

  useEffect(() => {
    if (finalizeCapture) {
      if (captureMedia.current) {
        captureMedia.current.canvas.remove();
      }
    } else {
      if (captureMedia.current) {
        captureContainerRef.current?.appendChild(captureMedia.current.canvas);
      }
      captureMedia.current?.restartVideo();
    }
  }, [finalizeCapture]);

  useLayoutEffect(() => {
    if (!captureMainContainerRef.current) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (!captureMedia.current || !captureMainContainerRef.current) return;

      const aspect =
        captureMedia.current.video.videoWidth /
        captureMedia.current.video.videoHeight;

      const maxHeight = captureMainContainerRef.current.clientHeight * 0.95;
      const maxWidth = captureMainContainerRef.current.clientWidth * 0.95;

      const calculatedMaxWidthHeight = maxWidth / aspect;

      if (calculatedMaxWidthHeight > maxHeight) {
        setLargestDim("height");
      } else {
        setLargestDim("width");
      }
    });

    observer.observe(captureMainContainerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", captureMediaController.handleKeyDown);
    document.addEventListener("keyup", captureMediaController.handleKeyUp);

    return () => {
      document.removeEventListener(
        "keydown",
        captureMediaController.handleKeyDown
      );
      document.removeEventListener("keyup", captureMediaController.handleKeyUp);
    };
  }, []);

  return !finalizeCapture ? (
    <FgPortal
      type='staticTopDomain'
      top={0}
      left={0}
      zValue={499999998}
      className='w-full h-full'
      content={
        <div
          ref={captureMediaPortalRef}
          className={`${
            inCaptureMedia ||
            captureMediaEffectsActive ||
            captureMediaTypeActive
              ? "in-capture-media"
              : ""
          } capture-media-container w-full h-full bg-fg-tone-black-4 bg-opacity-45 pointer-events-none`}
        >
          <div
            ref={captureMainContainerRef}
            className='flex absolute w-4/5 h-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center'
          >
            <div
              ref={captureContainerRef}
              className={`${
                largestDim === "width" ? "w-full" : "h-full"
              } max-w-[95%] max-h-[95%] rounded-md overflow-hidden relative pointer-events-auto bg-transparent`}
              style={{
                aspectRatio: `${captureMedia.current?.video.videoWidth} / ${captureMedia.current?.video.videoHeight}`,
              }}
              onPointerEnter={captureMediaController.handlePointerEnter}
              onPointerLeave={captureMediaController.handlePointerLeave}
            >
              <div className='capture-media-overlay-container w-full h-full z-10 absolute top-0 left-0'>
                {captureMediaTypeActive && (
                  <CaptureMediaTypeSection
                    captureMedia={captureMedia}
                    captureContainerRef={captureContainerRef}
                    setMediaType={setMediaType}
                    setRecordingCount={setRecordingCount}
                    recording={recording}
                  />
                )}
                {captureMediaEffectsActive && (
                  <CaptureMediaEffectsSection
                    tintColor={tintColor}
                    captureMedia={captureMedia}
                    captureMediaController={captureMediaController}
                    captureContainerRef={captureContainerRef}
                  />
                )}
                <div className='flex top-[1%] w-full h-[12%] max-h-12 min-h-6 absolute left-0 items-center justify-center'>
                  <CloseButton
                    finalizeCapture={finalizeCapture}
                    tableFunctionsController={tableFunctionsController}
                    captureMediaController={captureMediaController}
                  />
                </div>
                <div className='flex bottom-[1%] w-full h-[12%] max-h-12 min-h-6 absolute left-0 items-center justify-center space-x-3'>
                  <div className='flex h-full grow items-center justify-end'>
                    <MediaTypeButton
                      mediaType={mediaType}
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
                  <div className='flex h-full grow items-center justify-start'>
                    <CaptureMediaEffectsButton
                      captureMediaController={captureMediaController}
                      captureMediaEffectsActive={captureMediaEffectsActive}
                      captureMediaTypeActive={captureMediaTypeActive}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    />
  ) : (
    <FgPortal
      externalRef={captureMediaPortalRef}
      className='w-full h-full'
      type='staticTopDomain'
      top={0}
      left={0}
      zValue={499999998}
      content={
        <div
          ref={captureMediaPortalRef}
          className={`${
            inCaptureMedia ? "in-capture-media" : ""
          } capture-media-container w-full aspect h-full bg-fg-tone-black-4 bg-opacity-45 pointer-events-auto`}
        >
          <div className='flex absolute w-4/5 h-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center'>
            <div
              ref={captureContainerRef}
              className={`${
                largestDim === "width" ? "w-full" : "h-full"
              } max-w-[95%] max-h-[95%] rounded-md overflow-hidden relative pointer-events-auto bg-transparent`}
              style={{
                aspectRatio: `${captureMedia.current?.video.videoWidth} / ${captureMedia.current?.video.videoHeight}`,
              }}
              onPointerEnter={captureMediaController.handlePointerEnter}
              onPointerLeave={captureMediaController.handlePointerLeave}
            >
              <img
                className='w-full h-full'
                src={captureMedia.current?.babylonScene?.downloadSnapShotLink()}
              />
              <div className='capture-media-overlay-container w-full h-full z-10 absolute top-0 left-0'>
                <div className='flex top-[1%] w-full h-[12%] max-h-12 min-h-6 absolute left-0 items-center justify-center'>
                  <CloseButton
                    finalizeCapture={finalizeCapture}
                    tableFunctionsController={tableFunctionsController}
                    captureMediaController={captureMediaController}
                  />
                </div>
                <div className='flex bottom-[1%] w-full h-[12%] max-h-12 min-h-6 absolute left-0 items-center justify-center space-x-3'>
                  <div className='flex h-full grow items-center justify-end'>
                    <div className='h-full aspect-square'></div>
                  </div>
                  <ConfirmButton
                    captureMediaController={captureMediaController}
                  />
                  <div className='flex h-full grow items-center justify-start'>
                    <DownloadButton
                      captureMediaController={captureMediaController}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}
