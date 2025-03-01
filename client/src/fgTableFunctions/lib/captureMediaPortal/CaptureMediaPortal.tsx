import React, { useEffect, useRef, useState } from "react";
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

  const captureContainerRef = useRef<HTMLDivElement>(null);

  const tintColor = useRef(captureEffectsStyles.current.tint.color);

  const leaveTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const movementTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const captureMediaController = new CaptureMediaController(
    captureStreamEffects,
    captureMedia,
    captureContainerRef,
    setCaptureMediaEffectsActive,
    setInCaptureMedia,
    leaveTimer,
    movementTimeout,
    tintColor
  );

  useEffect(() => {
    if (captureMedia.current)
      captureContainerRef.current?.appendChild(captureMedia.current.canvas);
  }, []);

  return (
    <FgPortal
      className={`${
        inCaptureMedia || captureMediaEffectsActive ? "in-capture-media" : ""
      } capture-media-container w-full aspect h-full bg-fg-tone-black-4 bg-opacity-45 pointer-events-none`}
      type='staticTopDomain'
      top={0}
      left={0}
      zValue={10000000000000000}
      content={
        <div className='flex absolute w-4/5 h-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center'>
          <div
            ref={captureContainerRef}
            className='min-w-full w-full h-max rounded-md overflow-hidden relative pointer-events-auto'
            onPointerEnter={captureMediaController.handlePointerEnter}
            onPointerLeave={captureMediaController.handlePointerLeave}
          >
            <div className='capture-media-overlay-container w-full h-full z-10 absolute top-0 left-0'>
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
                  tableFunctionsController={tableFunctionsController}
                />
              </div>
              <div className='flex bottom-[1%] w-full h-[12%] max-h-12 min-h-6 absolute left-0 items-center justify-center space-x-3'>
                <MediaTypeButton />
                <CaptureButton />
                <CaptureMediaEffectsButton
                  captureMediaController={captureMediaController}
                  captureMediaEffectsActive={captureMediaEffectsActive}
                />
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}
