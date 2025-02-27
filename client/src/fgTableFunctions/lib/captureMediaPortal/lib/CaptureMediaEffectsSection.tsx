import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Transition, Variants, motion } from "framer-motion";
import BabylonPostProcessEffectsButton from "../../../../elements/effectsButtons/BabylonPostProcessEffectsButton";
import BlurButton from "../../../../elements/effectsButtons/BlurButton";
import TintSection from "../../../../elements/effectsButtons/TintSection";
import {
  VideoEffectStylesType,
  VideoEffectTypes,
} from "../../../../context/effectsContext/typeConstant";
import CaptureMedia from "../../../../media/capture/CaptureMedia";
import CaptureMediaController from "./CaptureMediaController";

const HideBackgroundButton = React.lazy(
  () => import("../../../../elements/effectsButtons/HideBackgroundButton")
);
const GlassesButton = React.lazy(
  () => import("../../../../elements/effectsButtons/GlassesButton")
);
const BeardsButton = React.lazy(
  () => import("../../../../elements/effectsButtons/BeardsButton")
);
const MustachesButton = React.lazy(
  () => import("../../../../elements/effectsButtons/MustachesButton")
);
const MasksButton = React.lazy(
  () => import("../../../../elements/effectsButtons/MasksButton")
);
const HatsButton = React.lazy(
  () => import("../../../../elements/effectsButtons/HatsButton")
);
const PetsButton = React.lazy(
  () => import("../../../../elements/effectsButtons/PetsButton")
);

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

export default function CaptureMediaEffectsSection({
  tintColor,
  streamEffects,
  effectsStyles,
  captureMedia,
  captureMediaController,
}: {
  tintColor: React.MutableRefObject<string>;
  streamEffects: React.MutableRefObject<{
    [effectType in VideoEffectTypes]: boolean;
  }>;
  effectsStyles: React.MutableRefObject<VideoEffectStylesType>;
  captureMedia: CaptureMedia;
  captureMediaController: CaptureMediaController;
}) {
  const [effectsDisabled, setEffectsDisabled] = useState(false);
  const [overflow, setOverflow] = useState(false);

  const effectsContainerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (event: WheelEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (effectsContainerRef.current) {
      effectsContainerRef.current.scrollLeft += event.deltaY;
    }
  };

  useEffect(() => {
    effectsContainerRef.current?.addEventListener("wheel", handleWheel);

    return () => {
      effectsContainerRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useLayoutEffect(() => {
    if (!effectsContainerRef.current) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const el = effectsContainerRef.current;
      if (el) {
        setOverflow(el.clientWidth < el.scrollWidth);
      }
    });

    observer.observe(effectsContainerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={effectsContainerRef}
      className={`${
        overflow ? "pb-1" : "pb-2"
      } tiny-horizontal-scroll-bar left-1/2 h-max w-max max-w-[90%] overflow-x-auto rounded mb-2 border-2 border-fg-black-45 border-opacity-90 bg-fg-black-10 bg-opacity-90 shadow-xl flex space-x-1 px-2 pt-2 absolute bottom-full items-center pointer-events-auto`}
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
        streamEffects={streamEffects.current.postProcess}
        effectsStyles={effectsStyles.current.postProcess}
        clickFunctionCallback={async () => {
          captureMedia.babylonScene?.babylonShaderController.swapPostProcessEffects(
            effectsStyles.current.postProcess.style
          );

          await captureMediaController.handleCaptureEffect(
            "postProcess",
            false
          );
        }}
        holdFunctionCallback={async (effectType) => {
          effectsStyles.current.postProcess.style = effectType;

          captureMedia.babylonScene?.babylonShaderController.swapPostProcessEffects(
            effectType
          );

          await captureMediaController.handleCaptureEffect(
            "postProcess",
            streamEffects.current.postProcess
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <HideBackgroundButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={streamEffects.current.hideBackground}
        effectsStyles={effectsStyles.current.hideBackground}
        clickFunctionCallback={async () => {
          captureMedia.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
            effectsStyles.current.hideBackground.style
          );

          await captureMediaController.handleCaptureEffect(
            "hideBackground",
            false
          );
        }}
        holdFunctionCallback={async (effectType) => {
          effectsStyles.current.hideBackground.style = effectType;

          captureMedia.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
            effectType
          );

          await captureMediaController.handleCaptureEffect(
            "hideBackground",
            streamEffects.current.hideBackground
          );
        }}
        acceptColorCallback={async (color) => {
          const styles = effectsStyles.current.hideBackground;
          const effects = streamEffects.current.hideBackground;

          captureMedia.babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
            color
          );

          if (styles.style !== "color" || !effects) {
            styles.style = "color";
            styles.color = color;

            await captureMediaController.handleCaptureEffect(
              "hideBackground",
              effects
            );
          }
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <BlurButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={streamEffects.current.blur}
        clickFunctionCallback={async () => {
          await captureMediaController.handleCaptureEffect("blur", false);
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <TintSection
        tintColor={tintColor}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={streamEffects.current.tint}
        clickFunctionCallback={async () => {
          effectsStyles.current.tint.color = tintColor.current;

          await captureMediaController.handleCaptureEffect("tint", false);
        }}
        acceptColorCallback={async () => {
          effectsStyles.current.tint.color = tintColor.current;

          await captureMediaController.handleCaptureEffect(
            "tint",
            streamEffects.current.tint
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <GlassesButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={streamEffects.current.glasses}
        effectsStyles={effectsStyles.current.glasses}
        clickFunctionCallback={async () => {
          await captureMediaController.handleCaptureEffect("glasses", false);
        }}
        holdFunctionCallback={async (effectType) => {
          effectsStyles.current.glasses.style = effectType;

          await captureMediaController.handleCaptureEffect(
            "glasses",
            streamEffects.current.glasses
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <BeardsButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={streamEffects.current.beards}
        effectsStyles={effectsStyles.current.beards}
        clickFunctionCallback={async () => {
          await captureMediaController.handleCaptureEffect("beards", false);
        }}
        holdFunctionCallback={async (effectType) => {
          effectsStyles.current.beards.style = effectType;

          await captureMediaController.handleCaptureEffect(
            "beards",
            streamEffects.current.beards
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <MustachesButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={streamEffects.current.mustaches}
        effectsStyles={effectsStyles.current.mustaches}
        clickFunctionCallback={async () => {
          await captureMediaController.handleCaptureEffect("mustaches", false);
        }}
        holdFunctionCallback={async (effectType) => {
          effectsStyles.current.mustaches.style = effectType;

          await captureMediaController.handleCaptureEffect(
            "mustaches",
            streamEffects.current.mustaches
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <MasksButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={streamEffects.current.masks}
        effectsStyles={effectsStyles.current.masks}
        clickFunctionCallback={async () => {
          await captureMediaController.handleCaptureEffect("masks", false);
        }}
        holdFunctionCallback={async (effectType) => {
          effectsStyles.current.masks.style = effectType;

          await captureMediaController.handleCaptureEffect(
            "masks",
            streamEffects.current.masks
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <HatsButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={streamEffects.current.hats}
        effectsStyles={effectsStyles.current.hats}
        clickFunctionCallback={async () => {
          await captureMediaController.handleCaptureEffect("hats", false);
        }}
        holdFunctionCallback={async (effectType) => {
          effectsStyles.current.hats.style = effectType;

          await captureMediaController.handleCaptureEffect(
            "hats",
            streamEffects.current.hats
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <PetsButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={streamEffects.current.pets}
        effectsStyles={effectsStyles.current.pets}
        clickFunctionCallback={async () => {
          await captureMediaController.handleCaptureEffect("pets", false);
        }}
        holdFunctionCallback={async (effectType) => {
          effectsStyles.current.pets.style = effectType;

          await captureMediaController.handleCaptureEffect(
            "pets",
            streamEffects.current.pets
          );
        }}
      />
    </motion.div>
  );
}
