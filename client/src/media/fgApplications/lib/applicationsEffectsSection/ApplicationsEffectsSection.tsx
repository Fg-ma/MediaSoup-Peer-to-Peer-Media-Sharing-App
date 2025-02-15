import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Transition, Variants, motion } from "framer-motion";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import { useMediaContext } from "../../../../context/mediaContext/MediaContext";
import ApplicationsMedia from "../../ApplicationsMedia";
import LowerApplicationsController from "../lowerApplicationsControls/LowerApplicationsController";
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

export default function ApplicationsEffectsSection({
  applicationsId,
  lowerApplicationsController,
  tintColor,
  applicationsMedia,
}: {
  applicationsId: string;
  lowerApplicationsController: LowerApplicationsController;
  tintColor: React.MutableRefObject<string>;
  applicationsMedia: ApplicationsMedia;
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
          userStreamEffects.current.applications[applicationsId].postProcess
        }
        effectsStyles={
          userEffectsStyles.current.applications[applicationsId].postProcess
        }
        clickFunctionCallback={async () => {
          userMedia.current.applications[
            applicationsId
          ].babylonScene?.babylonShaderController.swapPostProcessEffects(
            userEffectsStyles.current.applications[applicationsId].postProcess
              .style
          );

          await lowerApplicationsController.handleApplicationsEffect(
            "postProcess",
            false
          );
        }}
        holdFunctionCallback={async (effectType) => {
          userEffectsStyles.current.applications[
            applicationsId
          ].postProcess.style = effectType;

          userMedia.current.applications[
            applicationsId
          ].babylonScene?.babylonShaderController.swapPostProcessEffects(
            effectType
          );

          await lowerApplicationsController.handleApplicationsEffect(
            "postProcess",
            userStreamEffects.current.applications[applicationsId].postProcess
          );
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <BlurButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={
          userStreamEffects.current.applications[applicationsId].blur
        }
        clickFunctionCallback={async () => {
          await lowerApplicationsController.handleApplicationsEffect(
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
          userStreamEffects.current.applications[applicationsId].tint
        }
        clickFunctionCallback={async () => {
          await lowerApplicationsController.handleApplicationsEffect(
            "tint",
            false
          );
        }}
        acceptColorCallback={async () => {
          await lowerApplicationsController.handleApplicationsEffect(
            "tint",
            userStreamEffects.current.applications[applicationsId].tint
          );
        }}
      />
    </motion.div>
  );
}
