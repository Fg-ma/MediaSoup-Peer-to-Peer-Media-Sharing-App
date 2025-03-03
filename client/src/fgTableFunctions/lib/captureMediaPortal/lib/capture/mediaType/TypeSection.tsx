import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Transition, Variants, motion } from "framer-motion";
import CaptureMedia from "../../../../../../media/capture/CaptureMedia";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import { captureMediaTypeMeta, CaptureMediaTypes } from "../../typeConstant";

const CaptureMediaTypeSectionVar: Variants = {
  init: { opacity: 0, scale: 0.8, translate: "-50%" },
  animate: {
    opacity: 1,
    scale: 1,
    translate: "-50%",
    transition: {
      scale: { type: "spring", stiffness: 80 },
    },
  },
};

const CaptureMediaTypeSectionTransition: Transition = {
  transition: {
    opacity: { duration: 0.2, delay: 0.0 },
  },
};

export default function TypeSection({
  captureMedia,
  captureContainerRef,
  setMediaType,
  setRecordingCount,
  recording,
}: {
  captureMedia: React.RefObject<CaptureMedia | undefined>;
  captureContainerRef: React.RefObject<HTMLDivElement>;
  setMediaType: React.Dispatch<React.SetStateAction<CaptureMediaTypes>>;
  setRecordingCount: React.Dispatch<React.SetStateAction<number>>;
  recording: boolean;
}) {
  const captureMediaTypeContainerRef = useRef<HTMLDivElement>(null);
  const subCaptureMediaTypeContainerRef = useRef<HTMLDivElement>(null);

  const overflow = useRef(false);

  const [_, setRerender] = useState(false);

  const handleWheel = (event: WheelEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (captureMediaTypeContainerRef.current) {
      captureMediaTypeContainerRef.current.scrollLeft += event.deltaY;
    }
  };

  useEffect(() => {
    captureMediaTypeContainerRef.current?.addEventListener(
      "wheel",
      handleWheel
    );

    return () => {
      captureMediaTypeContainerRef.current?.removeEventListener(
        "wheel",
        handleWheel
      );
    };
  }, []);

  useLayoutEffect(() => {
    if (!captureContainerRef.current) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (
        captureMediaTypeContainerRef.current &&
        subCaptureMediaTypeContainerRef.current
      ) {
        overflow.current =
          captureMediaTypeContainerRef.current.clientWidth <
          subCaptureMediaTypeContainerRef.current.clientWidth;
        setRerender((prev) => !prev);
      }
    });

    observer.observe(captureContainerRef.current);

    if (
      captureMediaTypeContainerRef.current &&
      subCaptureMediaTypeContainerRef.current
    ) {
      overflow.current =
        captureMediaTypeContainerRef.current.clientWidth <
        subCaptureMediaTypeContainerRef.current.clientWidth;
      setRerender((prev) => !prev);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (
      captureMediaTypeContainerRef.current &&
      subCaptureMediaTypeContainerRef.current
    ) {
      overflow.current =
        captureMediaTypeContainerRef.current.clientWidth <
        subCaptureMediaTypeContainerRef.current.clientWidth;
      setRerender((prev) => !prev);
    }
  }, [captureMedia.current?.maxFacesDetected]);

  return (
    <motion.div
      ref={captureMediaTypeContainerRef}
      className='flex small-horizontal-scroll-bar z-30 w-full max-w-full left-1/2 rounded absolute items-center pointer-events-auto'
      style={{
        bottom: "calc(max(2.5rem, min(13% + 1rem, 4rem)))",
        height: overflow.current ? "calc(1.75rem + 10%)" : "10%",
        maxHeight: overflow.current ? "6.75rem" : "5rem",
        minHeight: overflow.current ? "4.75rem" : "3rem",
        overflowX: overflow.current ? "auto" : "hidden",
        justifyContent: overflow.current ? "flex-start" : "center",
      }}
      variants={CaptureMediaTypeSectionVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={CaptureMediaTypeSectionTransition}
    >
      <div
        ref={subCaptureMediaTypeContainerRef}
        className='flex h-full w-max items-center justify-center px-4 space-x-2'
      >
        {Object.entries(captureMediaTypeMeta).map(([key, meta]) => (
          <FgButton
            key={key}
            className='flex items-center justify-center h-full !aspect-square border-2 border-fg-white border-opacity-90 rounded-full hover:border-fg-red-light'
            clickFunction={() => {
              setMediaType(key as CaptureMediaTypes);
              if (!recording) {
                if (key === "10s") {
                  setRecordingCount(10);
                } else if (key === "15s") {
                  setRecordingCount(15);
                } else if (key === "30s") {
                  setRecordingCount(30);
                } else if (key === "60s") {
                  setRecordingCount(60);
                }
              }
            }}
            contentFunction={() => (
              <FgSVG
                src={meta.icon}
                className='flex h-full w-full items-center justify-center'
                attributes={[
                  { key: "width", value: "75%" },
                  { key: "height", value: "75%" },
                  { key: "fill", value: "#f2f2f2" },
                ]}
              />
            )}
            hoverContent={<FgHoverContentStandard content={meta.title} />}
            scrollingContainerRef={captureMediaTypeContainerRef}
            options={{
              hoverZValue: 500000000001,
              hoverTimeoutDuration: 750,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
