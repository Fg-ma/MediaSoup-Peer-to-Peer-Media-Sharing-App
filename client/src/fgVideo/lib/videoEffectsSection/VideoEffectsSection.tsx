import React, { useState, useEffect, useRef } from "react";
import { Transition, Variants, motion } from "framer-motion";
import { useEffectsContext } from "../../../context/effectsContext/EffectsContext";
import FgLowerVideoController from "../fgLowerVideoControls/lib/FgLowerVideoController";
import BabylonPostProcessEffectsButton from "../../../fgElements/effectsButtons/BabylonPostProcessEffectsButton";
import BlurButton from "../../../fgElements/effectsButtons/BlurButton";
import TintSection from "../../../fgElements/effectsButtons/TintSection";
import GlassesButton from "../../../fgElements/effectsButtons/GlassesButton";
import BeardsButton from "../../../fgElements/effectsButtons/BeardsButton";
import MustachesButton from "../../../fgElements/effectsButtons/MustachesButton";
import MasksButton from "../../../fgElements/effectsButtons/MasksButton";
import HatsButton from "../../../fgElements/effectsButtons/HatsButton";
import PetsButton from "../../../fgElements/effectsButtons/PetsButton";

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
  const { userEffectsStyles, userStreamEffects } = useEffectsContext();

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
      <BabylonPostProcessEffectsButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={
          userStreamEffects.current.video[videoId].video.postProcess
        }
        effectsStyles={
          userEffectsStyles.current.video[videoId].video.postProcess
        }
        clickFunctionCallback={async () => {
          await fgLowerVideoController.handleVideoEffect("postProcess", false);
        }}
        holdFunctionCallback={async (effectType) => {
          userEffectsStyles.current.video[videoId].video.postProcess.style =
            effectType;

          await fgLowerVideoController.handleVideoEffect(
            "postProcess",
            userStreamEffects.current.video[videoId].video.postProcess
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <BlurButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={userStreamEffects.current.video[videoId].video.blur}
        clickFunctionCallback={async () => {
          await fgLowerVideoController.handleVideoEffect("blur", false);
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <TintSection
        tintColor={tintColor}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={userStreamEffects.current.video[videoId].video.tint}
        clickFunctionCallback={async () => {
          await fgLowerVideoController.handleVideoEffect("beards", false);
        }}
        acceptColorCallback={() => {
          fgLowerVideoController.handleVideoEffect(
            "tint",
            userStreamEffects.current.video[videoId].video.tint
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <GlassesButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={userStreamEffects.current.video[videoId].video.glasses}
        effectsStyles={userEffectsStyles.current.video[videoId].video.glasses}
        clickFunctionCallback={async () => {
          await fgLowerVideoController.handleVideoEffect("glasses", false);
        }}
        holdFunctionCallback={async (effectType) => {
          userEffectsStyles.current.video[videoId].video.glasses.style =
            effectType;

          await fgLowerVideoController.handleVideoEffect(
            "glasses",
            userStreamEffects.current.video[videoId].video.glasses
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <BeardsButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={userStreamEffects.current.video[videoId].video.beards}
        effectsStyles={userEffectsStyles.current.video[videoId].video.beards}
        clickFunctionCallback={async () => {
          await fgLowerVideoController.handleVideoEffect("beards", false);
        }}
        holdFunctionCallback={async (effectType) => {
          userEffectsStyles.current.video[videoId].video.beards.style =
            effectType;

          await fgLowerVideoController.handleVideoEffect(
            "beards",
            userStreamEffects.current.video[videoId].video.beards
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <MustachesButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={userStreamEffects.current.video[videoId].video.mustaches}
        effectsStyles={userEffectsStyles.current.video[videoId].video.mustaches}
        clickFunctionCallback={async () => {
          await fgLowerVideoController.handleVideoEffect("mustaches", false);
        }}
        holdFunctionCallback={async (effectType) => {
          userEffectsStyles.current.video[videoId].video.mustaches.style =
            effectType;

          await fgLowerVideoController.handleVideoEffect(
            "mustaches",
            userStreamEffects.current.video[videoId].video.mustaches
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <MasksButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={userStreamEffects.current.video[videoId].video.masks}
        effectsStyles={userEffectsStyles.current.video[videoId].video.masks}
        clickFunctionCallback={async () => {
          await fgLowerVideoController.handleVideoEffect("masks", false);
        }}
        holdFunctionCallback={async (effectType) => {
          userEffectsStyles.current.video[videoId].video.masks.style =
            effectType;

          await fgLowerVideoController.handleVideoEffect(
            "masks",
            userStreamEffects.current.video[videoId].video.masks
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <HatsButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={userStreamEffects.current.video[videoId].video.hats}
        effectsStyles={userEffectsStyles.current.video[videoId].video.hats}
        clickFunctionCallback={async () => {
          await fgLowerVideoController.handleVideoEffect("hats", false);
        }}
        holdFunctionCallback={async (effectType) => {
          userEffectsStyles.current.video[videoId].video.hats.style =
            effectType;

          await fgLowerVideoController.handleVideoEffect(
            "hats",
            userStreamEffects.current.video[videoId].video.hats
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <PetsButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={userStreamEffects.current.video[videoId].video.pets}
        effectsStyles={userEffectsStyles.current.video[videoId].video.pets}
        clickFunctionCallback={async () => {
          await fgLowerVideoController.handleVideoEffect("pets", false);
        }}
        holdFunctionCallback={async (effectType) => {
          userEffectsStyles.current.video[videoId].video.pets.style =
            effectType;

          await fgLowerVideoController.handleVideoEffect(
            "pets",
            userStreamEffects.current.video[videoId].video.pets
          );
        }}
      />
    </motion.div>
  );
}
