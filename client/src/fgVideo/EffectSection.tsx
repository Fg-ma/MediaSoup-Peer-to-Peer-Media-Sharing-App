import React, { useState, useEffect, useRef } from "react";
import { Transition, Variants, motion } from "framer-motion";
import { EffectTypes } from "../context/StreamsContext";
import GlassesEffectSectionButton from "./GlassesEffectSectionButton";
import EarsEffectSectionButton from "./EarsEffectSectionButton";
import BeardsEffectSectionButton from "./BeardsEffectSectionButton";
import MustachesEffectSectionButton from "./MustachesEffectSectionButton";
import FaceMasksEffectSectionButton from "./FaceMasksEffectSectionButton";
import TintSection from "./TintSection";
import BlurSection from "./BlurSection";

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

export default function EffectSection({
  videoContainerRef,
  type,
  videoId,
  handleEffectChange,
  tintColor,
}: {
  videoContainerRef: React.RefObject<HTMLDivElement>;
  type: "camera" | "screen";
  videoId: string;
  handleEffectChange: (effect: EffectTypes, blockStateChange?: boolean) => void;
  tintColor: React.MutableRefObject<string>;
}) {
  const [effectsWidth, setEffectsWidth] = useState(0);

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
      <BlurSection
        videoId={videoId}
        type={type}
        handleEffectChange={handleEffectChange}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <TintSection
        videoId={videoId}
        type={type}
        handleEffectChange={handleEffectChange}
        tintColor={tintColor}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <EarsEffectSectionButton
        handleEffectChange={handleEffectChange}
        type={type}
        videoId={videoId}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <GlassesEffectSectionButton
        handleEffectChange={handleEffectChange}
        type={type}
        videoId={videoId}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <BeardsEffectSectionButton
        handleEffectChange={handleEffectChange}
        type={type}
        videoId={videoId}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <MustachesEffectSectionButton
        handleEffectChange={handleEffectChange}
        type={type}
        videoId={videoId}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <FaceMasksEffectSectionButton
        handleEffectChange={handleEffectChange}
        type={type}
        videoId={videoId}
      />
    </motion.div>
  );
}
