import React, { useState, useEffect, useRef, Suspense } from "react";
import { Transition, Variants, motion } from "framer-motion";
import TintSection from "./lib/TintSection";
import BlurButtton from "./lib/BlurButton";
import FgLowerVideoController from "../fgLowerVideoControls/lib/FgLowerVideoController";

const BabylonPostProcessEffectsButton = React.lazy(
  () => import("./lib/BabylonPostProcessEffectsButton")
);
const GlassesButton = React.lazy(() => import("./lib/GlassesButton"));
const BeardsButton = React.lazy(() => import("./lib/BeardsButton"));
const MustachesButton = React.lazy(() => import("./lib/MustachesButton"));
const MasksButton = React.lazy(() => import("./lib/MasksButton"));
const HatsButton = React.lazy(() => import("./lib/HatsButton"));
const PetsButton = React.lazy(() => import("./lib/PetsButton"));

const EffectSectionVar: Variants = {
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

const EffectSectionTransition: Transition = {
  transition: {
    opacity: { duration: 0.2, delay: 0.0 },
  },
};

export default function VideoEffectsSection({
  videoId,
  videoContainerRef,
  fgLowerVideoController,
  tintColor,
}: {
  videoId: string;
  videoContainerRef: React.RefObject<HTMLDivElement>;
  fgLowerVideoController: FgLowerVideoController;
  tintColor: React.MutableRefObject<string>;
}) {
  const [effectsWidth, setEffectsWidth] = useState(0);
  const [effectsDisabled, setEffectsDisabled] = useState(false);

  const [overflowingXDirection, setOverflowingXDirection] = useState(false);
  const effectsContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    updateWidth();
  }, [videoContainerRef.current?.clientWidth]);

  const handleWheel = (event: WheelEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (effectsContainerRef.current) {
      effectsContainerRef.current.scrollLeft += event.deltaY;
    }
  };

  useEffect(() => {
    effectsContainerRef.current?.addEventListener("wheel", handleWheel);

    window.addEventListener("resize", updateWidth);

    return () => {
      effectsContainerRef.current?.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  return (
    <motion.div
      ref={effectsContainerRef}
      className={`${
        overflowingXDirection ? "" : "pb-2"
      } tiny-horizontal-scroll-bar left-1/2 h-max overflow-x-auto rounded mb-5 border-2 border-fg-black-45 border-opacity-90 bg-fg-black-10 bg-opacity-90 shadow-xl flex space-x-1 px-2 pt-2 absolute bottom-full items-center`}
      style={{
        width: effectsWidth,
      }}
      variants={EffectSectionVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={EffectSectionTransition}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <BabylonPostProcessEffectsButton
          videoId={videoId}
          fgLowerVideoController={fgLowerVideoController}
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
        />
        <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      </Suspense>
      <BlurButtton
        videoId={videoId}
        fgLowerVideoController={fgLowerVideoController}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <TintSection
        videoId={videoId}
        fgLowerVideoController={fgLowerVideoController}
        tintColor={tintColor}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
        <GlassesButton
          videoId={videoId}
          fgLowerVideoController={fgLowerVideoController}
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
        />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
        <BeardsButton
          videoId={videoId}
          fgLowerVideoController={fgLowerVideoController}
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
        />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
        <MustachesButton
          videoId={videoId}
          fgLowerVideoController={fgLowerVideoController}
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
        />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
        <MasksButton
          videoId={videoId}
          fgLowerVideoController={fgLowerVideoController}
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
        />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
        <HatsButton
          videoId={videoId}
          fgLowerVideoController={fgLowerVideoController}
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
        />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
        <PetsButton
          videoId={videoId}
          fgLowerVideoController={fgLowerVideoController}
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
        />
      </Suspense>
    </motion.div>
  );
}
