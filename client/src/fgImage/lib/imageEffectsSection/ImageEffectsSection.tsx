import React, { useState, useEffect, useRef } from "react";
import { Transition, Variants, motion } from "framer-motion";
import LowerImageController from "../lowerImageControls/LowerImageController";
import TintSection from "./lib/TintSection";
import BlurButtton from "./lib/BlurButton";
import BabylonPostProcessEffectsButton from "./lib/BabylonPostProcessEffectsButton";
import GlassesButton from "./lib/GlassesButton";
import BeardsButton from "./lib/BeardsButton";
import MustachesButton from "./lib/MustachesButton";
import MasksButton from "./lib/MasksButton";
import HatsButton from "./lib/HatsButton";
import PetsButton from "./lib/PetsButton";

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

export default function ImageEffectsSection({
  imageId,
  imageContainerRef,
  lowerImageController,
  tintColor,
}: {
  imageId: string;
  imageContainerRef: React.RefObject<HTMLDivElement>;
  lowerImageController: LowerImageController;
  tintColor: React.MutableRefObject<string>;
}) {
  const [effectsWidth, setEffectsWidth] = useState(0);
  const [effectsDisabled, setEffectsDisabled] = useState(false);

  const [overflowingXDirection, setOverflowingXDirection] = useState(false);
  const effectsContainerRef = useRef<HTMLDivElement>(null);

  const updateWidth = () => {
    if (imageContainerRef.current) {
      const newEffectsWidth = imageContainerRef.current.clientWidth * 0.9;

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
  }, [imageContainerRef.current?.clientWidth]);

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
      <BabylonPostProcessEffectsButton
        imageId={imageId}
        lowerImageController={lowerImageController}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <BlurButtton
        imageId={imageId}
        lowerImageController={lowerImageController}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <TintSection
        imageId={imageId}
        lowerImageController={lowerImageController}
        tintColor={tintColor}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <GlassesButton
        imageId={imageId}
        lowerImageController={lowerImageController}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <BeardsButton
        imageId={imageId}
        lowerImageController={lowerImageController}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <MustachesButton
        imageId={imageId}
        lowerImageController={lowerImageController}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <MasksButton
        imageId={imageId}
        lowerImageController={lowerImageController}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <HatsButton
        imageId={imageId}
        lowerImageController={lowerImageController}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <PetsButton
        imageId={imageId}
        lowerImageController={lowerImageController}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
      />
    </motion.div>
  );
}
