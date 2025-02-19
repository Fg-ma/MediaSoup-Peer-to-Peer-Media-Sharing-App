import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Transition, Variants, motion } from "framer-motion";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import { useMediaContext } from "../../../../context/mediaContext/MediaContext";
import ApplicationMedia from "../../ApplicationMedia";
import LowerApplicationController from "../lowerApplicationControls/LowerApplicationController";
import BabylonPostProcessEffectsButton from "../../../../elements/effectsButtons/BabylonPostProcessEffectsButton";
import BlurButton from "../../../../elements/effectsButtons/BlurButton";
import TintSection from "../../../../elements/effectsButtons/TintSection";

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

export default function ApplicationEffectsSection({
  applicationId,
  lowerApplicationController,
  tintColor,
  applicationMedia,
}: {
  applicationId: string;
  lowerApplicationController: LowerApplicationController;
  tintColor: React.MutableRefObject<string>;
  applicationMedia: ApplicationMedia;
}) {
  const { userEffectsStyles, userStreamEffects } = useEffectsContext();
  const { userMedia } = useMediaContext();

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
      } tiny-horizontal-scroll-bar left-1/2 h-max w-max max-w-[90%] overflow-x-auto rounded mb-5 border-2 border-fg-black-45 border-opacity-90 bg-fg-black-10 bg-opacity-90 shadow-xl flex space-x-1 px-2 pt-2 absolute bottom-full items-center pointer-events-auto`}
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
          userStreamEffects.current.application[applicationId].postProcess
        }
        effectsStyles={
          userEffectsStyles.current.application[applicationId].postProcess
        }
        clickFunctionCallback={async () => {
          userMedia.current.application[
            applicationId
          ].babylonScene?.babylonShaderController.swapPostProcessEffects(
            userEffectsStyles.current.application[applicationId].postProcess
              .style
          );

          await lowerApplicationController.handleApplicationEffect(
            "postProcess",
            false
          );
        }}
        holdFunctionCallback={async (effectType) => {
          userEffectsStyles.current.application[
            applicationId
          ].postProcess.style = effectType;

          userMedia.current.application[
            applicationId
          ].babylonScene?.babylonShaderController.swapPostProcessEffects(
            effectType
          );

          await lowerApplicationController.handleApplicationEffect(
            "postProcess",
            userStreamEffects.current.application[applicationId].postProcess
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <BlurButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={
          userStreamEffects.current.application[applicationId].blur
        }
        clickFunctionCallback={async () => {
          await lowerApplicationController.handleApplicationEffect(
            "blur",
            false
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <TintSection
        tintColor={tintColor}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={
          userStreamEffects.current.application[applicationId].tint
        }
        clickFunctionCallback={async () => {
          userEffectsStyles.current.application[applicationId].tint.color =
            tintColor.current;

          await lowerApplicationController.handleApplicationEffect(
            "tint",
            false
          );
        }}
        acceptColorCallback={async () => {
          userEffectsStyles.current.application[applicationId].tint.color =
            tintColor.current;

          await lowerApplicationController.handleApplicationEffect(
            "tint",
            userStreamEffects.current.application[applicationId].tint
          );
        }}
      />
    </motion.div>
  );
}
