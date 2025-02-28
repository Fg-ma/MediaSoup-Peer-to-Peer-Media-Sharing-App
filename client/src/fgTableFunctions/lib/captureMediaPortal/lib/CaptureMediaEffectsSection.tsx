import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Transition, Variants, motion } from "framer-motion";
import BabylonPostProcessEffectsButton from "../../../../elements/effectsButtons/BabylonPostProcessEffectsButton";
import {
  CameraEffectStylesType,
  CameraEffectTypes,
} from "../../../../context/effectsContext/typeConstant";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import CaptureMedia from "../../../../media/capture/CaptureMedia";
import BlurButton from "../../../../elements/effectsButtons/BlurButton";
import TintSection from "../../../../elements/effectsButtons/TintSection";
import CaptureMediaController from "./CaptureMediaController";
import HideBackgroundButton from "../../../../elements/effectsButtons/HideBackgroundButton";
import GlassesButton from "../../../../elements/effectsButtons/GlassesButton";
import BeardsButton from "../../../../elements/effectsButtons/BeardsButton";
import MustachesButton from "../../../../elements/effectsButtons/MustachesButton";
import MasksButton from "../../../../elements/effectsButtons/MasksButton";
import HatsButton from "../../../../elements/effectsButtons/HatsButton";
import PetsButton from "../../../../elements/effectsButtons/PetsButton";

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
  captureMedia,
  captureMediaController,
}: {
  tintColor: React.MutableRefObject<string>;
  captureMedia: React.RefObject<CaptureMedia | undefined>;
  captureMediaController: CaptureMediaController;
}) {
  const { captureStreamEffects, captureEffectsStyles } = useEffectsContext();

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
      } small-horizontal-scroll-bar left-1/2 h-[12%] w-max max-w-full overflow-x-auto rounded mb-2 flex space-x-2 px-[1%] pt-2 absolute bottom-[9%] items-center pointer-events-auto`}
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
        streamEffects={captureStreamEffects.current.postProcess}
        effectsStyles={captureEffectsStyles.current.postProcess}
        clickFunctionCallback={async () => {
          captureMedia.current?.babylonScene?.babylonShaderController.swapPostProcessEffects(
            captureEffectsStyles.current.postProcess.style
          );

          await captureMediaController.handleCaptureEffect(
            "postProcess",
            false
          );
        }}
        holdFunctionCallback={async (effectType) => {
          captureEffectsStyles.current.postProcess.style = effectType;

          captureMedia.current?.babylonScene?.babylonShaderController.swapPostProcessEffects(
            effectType
          );

          await captureMediaController.handleCaptureEffect(
            "postProcess",
            captureStreamEffects.current.postProcess
          );
        }}
      />
      <HideBackgroundButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={captureStreamEffects.current.hideBackground}
        effectsStyles={captureEffectsStyles.current.hideBackground}
        clickFunctionCallback={async () => {
          captureMedia.current?.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
            captureEffectsStyles.current.hideBackground.style
          );

          await captureMediaController.handleCaptureEffect(
            "hideBackground",
            false
          );
        }}
        holdFunctionCallback={async (effectType) => {
          captureEffectsStyles.current.hideBackground.style = effectType;

          captureMedia.current?.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
            effectType
          );

          await captureMediaController.handleCaptureEffect(
            "hideBackground",
            captureStreamEffects.current.hideBackground
          );
        }}
        acceptColorCallback={async (color) => {
          const styles = captureEffectsStyles.current.hideBackground;
          const effects = captureStreamEffects.current.hideBackground;

          captureMedia.current?.babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
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
      <BlurButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={captureStreamEffects.current.blur}
        clickFunctionCallback={async () => {
          await captureMediaController.handleCaptureEffect("blur", false);
        }}
      />
      <TintSection
        tintColor={tintColor}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={captureStreamEffects.current.tint}
        clickFunctionCallback={async () => {
          captureEffectsStyles.current.tint.color = tintColor.current;

          await captureMediaController.handleCaptureEffect("tint", false);
        }}
        acceptColorCallback={async () => {
          captureEffectsStyles.current.tint.color = tintColor.current;

          await captureMediaController.handleCaptureEffect(
            "tint",
            captureStreamEffects.current.tint
          );
        }}
      />
      <GlassesButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={captureStreamEffects.current.glasses}
        effectsStyles={captureEffectsStyles.current.glasses}
        clickFunctionCallback={async () => {
          await captureMediaController.handleCaptureEffect("glasses", false);
        }}
        holdFunctionCallback={async (effectType) => {
          captureEffectsStyles.current.glasses.style = effectType;

          await captureMediaController.handleCaptureEffect(
            "glasses",
            captureStreamEffects.current.glasses
          );
        }}
      />
      <BeardsButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={captureStreamEffects.current.beards}
        effectsStyles={captureEffectsStyles.current.beards}
        clickFunctionCallback={async () => {
          await captureMediaController.handleCaptureEffect("beards", false);
        }}
        holdFunctionCallback={async (effectType) => {
          captureEffectsStyles.current.beards.style = effectType;

          await captureMediaController.handleCaptureEffect(
            "beards",
            captureStreamEffects.current.beards
          );
        }}
      />
      <MustachesButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={captureStreamEffects.current.mustaches}
        effectsStyles={captureEffectsStyles.current.mustaches}
        clickFunctionCallback={async () => {
          await captureMediaController.handleCaptureEffect("mustaches", false);
        }}
        holdFunctionCallback={async (effectType) => {
          captureEffectsStyles.current.mustaches.style = effectType;

          await captureMediaController.handleCaptureEffect(
            "mustaches",
            captureStreamEffects.current.mustaches
          );
        }}
      />
      <MasksButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={captureStreamEffects.current.masks}
        effectsStyles={captureEffectsStyles.current.masks}
        clickFunctionCallback={async () => {
          await captureMediaController.handleCaptureEffect("masks", false);
        }}
        holdFunctionCallback={async (effectType) => {
          captureEffectsStyles.current.masks.style = effectType;

          await captureMediaController.handleCaptureEffect(
            "masks",
            captureStreamEffects.current.masks
          );
        }}
      />
      <HatsButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={captureStreamEffects.current.hats}
        effectsStyles={captureEffectsStyles.current.hats}
        clickFunctionCallback={async () => {
          await captureMediaController.handleCaptureEffect("hats", false);
        }}
        holdFunctionCallback={async (effectType) => {
          captureEffectsStyles.current.hats.style = effectType;

          await captureMediaController.handleCaptureEffect(
            "hats",
            captureStreamEffects.current.hats
          );
        }}
      />
      <PetsButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={captureStreamEffects.current.pets}
        effectsStyles={captureEffectsStyles.current.pets}
        clickFunctionCallback={async () => {
          await captureMediaController.handleCaptureEffect("pets", false);
        }}
        holdFunctionCallback={async (effectType) => {
          captureEffectsStyles.current.pets.style = effectType;

          await captureMediaController.handleCaptureEffect(
            "pets",
            captureStreamEffects.current.pets
          );
        }}
      />
    </motion.div>
  );
}
