import React, { useEffect, useRef } from "react";
import { MediaContainerOptions } from "../typeConstant";
import FullScreenButton from "./lib/fullScreenButton/FullScreenButton";
import LowerController from "./lib/LowerController";

export default function LowerControls({
  lowerController,
  externalRightLowerControlsRef,
  leftLowerControls,
  rightLowerControls,
  mediaContainerOptions,
  preventLowerLabelsVariables,
  fullscreen,
  backgroundMedia,
}: {
  lowerController: LowerController;
  externalRightLowerControlsRef?: React.RefObject<HTMLDivElement>;
  leftLowerControls?: (React.ReactNode | null)[];
  rightLowerControls?: (React.ReactNode | null)[];
  mediaContainerOptions: MediaContainerOptions;
  preventLowerLabelsVariables?: boolean[];
  fullscreen: boolean;
  backgroundMedia: boolean;
}) {
  const rightControlsRef = externalRightLowerControlsRef
    ? externalRightLowerControlsRef
    : useRef<HTMLDivElement>(null);

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (rightControlsRef.current) {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        rightControlsRef.current.scrollLeft -= event.deltaX / 2;
      } else {
        rightControlsRef.current.scrollLeft -= event.deltaY / 2;
      }
    }
  };

  useEffect(() => {
    rightControlsRef.current?.addEventListener("wheel", handleWheel);

    return () => {
      rightControlsRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div
      className={`media-lower-controls ${
        mediaContainerOptions.controlsPlacement === "inside" ||
        fullscreen ||
        backgroundMedia
          ? "bottom-0"
          : "top-full"
      } absolute w-full h-[12%] max-h-12 min-h-6 flex-col items-end justify-center z-20 pointer-events-none`}
    >
      <div className='flex w-full h-full justify-between'>
        <div
          className='flex w-max h-full z-20 items-center space-x-2'
          style={{ boxShadow: "20px 0 15px -12px rgba(0, 0, 0, 0.9)" }}
        >
          {leftLowerControls &&
            leftLowerControls.length > 0 &&
            leftLowerControls.map((control, index) => (
              <React.Fragment key={index}>{control}</React.Fragment>
            ))}
        </div>
        <div
          ref={rightControlsRef}
          className='hide-scroll-bar w-max h-full overflow-x-auto z-10 flex items-center space-x-2 scale-x-[-1] pr-2'
        >
          <FullScreenButton
            lowerController={lowerController}
            preventLowerLabelsVariables={preventLowerLabelsVariables}
            scrollingContainerRef={rightControlsRef}
          />
          {rightLowerControls &&
            rightLowerControls.length > 0 &&
            rightLowerControls.map((control, index) => (
              <React.Fragment key={index}>{control}</React.Fragment>
            ))}
        </div>
      </div>
    </div>
  );
}
