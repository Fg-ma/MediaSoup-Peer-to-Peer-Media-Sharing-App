import React, { useState, useEffect, useRef } from "react";
import { Transition, Variants, motion } from "framer-motion";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/StreamsContext";
import GlassesButton from "./lib/GlassesButton";
import EarsButton from "./lib/EarsButton";
import BeardsButton from "./lib/BeardsButton";
import MustachesButton from "./lib/MustachesButton";
import FaceMasksButton from "./lib/FaceMasksButton";
import TintSection from "./lib/TintSection";
import BlurButtton from "./lib/BlurButton";

const EffectSectionVar: Variants = {
  init: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 80 },
    },
  },
};

const EffectSectionTransition: Transition = {
  transition: {
    opacity: { duration: 0.2, delay: 0.0 },
  },
};

export default function VisualEffectsSection({
  videoContainerRef,
  type,
  videoId,
  handleEffectChange,
  tintColor,
}: {
  videoContainerRef: React.RefObject<HTMLDivElement>;
  type: "camera" | "screen";
  videoId: string;
  handleEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  tintColor: React.MutableRefObject<string>;
}) {
  const [effectsWidth, setEffectsWidth] = useState(0);
  const [effectsDisabled, setEffectsDisabled] = useState(false);

  const [overflowingXDirection, setOverflowingXDirection] = useState(false);
  const effectsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (videoContainerRef.current) {
        const newEffectsWidth = videoContainerRef.current.clientWidth * 0.9;

        setEffectsWidth(newEffectsWidth);

        if (effectsContainerRef.current) {
          setOverflowingXDirection(
            effectsContainerRef.current.scrollWidth > newEffectsWidth
          );
        }
      }
    };

    // Update width on mount
    updateWidth();

    // Add resize event listener
    window.addEventListener("resize", updateWidth);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", updateWidth);
  }, [videoContainerRef]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (effectsContainerRef.current) {
        effectsContainerRef.current.scrollLeft += event.deltaY;
      }
    };

    effectsContainerRef.current?.addEventListener("wheel", handleWheel);

    return () => {
      effectsContainerRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <motion.div
      ref={effectsContainerRef}
      className={`${
        overflowingXDirection ? "" : "pb-2"
      } tiny-horizontal-scroll-bar overflow-x-auto rounded border mb-5 border-white border-opacity-75 bg-black bg-opacity-75 shadow-xl flex space-x-1 px-2 pt-2 absolute bottom-full items-center`}
      style={{
        width: effectsWidth,
        left: videoContainerRef.current
          ? `${
              ((videoContainerRef.current.clientWidth - effectsWidth) /
                2 /
                videoContainerRef.current.clientWidth) *
              100
            }%`
          : undefined,
      }}
      variants={EffectSectionVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={EffectSectionTransition}
    >
      <BlurButtton
        videoId={videoId}
        type={type}
        handleEffectChange={handleEffectChange}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <TintSection
        videoId={videoId}
        type={type}
        handleEffectChange={handleEffectChange}
        tintColor={tintColor}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
      />
      {type === "camera" && (
        <>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <EarsButton
            handleEffectChange={handleEffectChange}
            type={type}
            videoId={videoId}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
          />
        </>
      )}
      {type === "camera" && (
        <>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <GlassesButton
            handleEffectChange={handleEffectChange}
            type={type}
            videoId={videoId}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
          />
        </>
      )}
      {type === "camera" && (
        <>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <BeardsButton
            handleEffectChange={handleEffectChange}
            type={type}
            videoId={videoId}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
          />
        </>
      )}
      {type === "camera" && (
        <>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <MustachesButton
            handleEffectChange={handleEffectChange}
            type={type}
            videoId={videoId}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
          />
        </>
      )}
      {type === "camera" && (
        <>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <FaceMasksButton
            handleEffectChange={handleEffectChange}
            type={type}
            videoId={videoId}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
          />
        </>
      )}
    </motion.div>
  );
}
