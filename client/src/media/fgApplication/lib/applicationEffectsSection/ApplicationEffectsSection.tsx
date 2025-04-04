import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Transition, Variants, motion } from "framer-motion";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
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
  applicationInstanceId,
  lowerApplicationController,
  tintColor,
  applicationMedia,
  applicationContainerRef,
}: {
  applicationInstanceId: string;
  lowerApplicationController: LowerApplicationController;
  tintColor: React.MutableRefObject<string>;
  applicationMedia: ApplicationMedia;
  applicationContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { userEffectsStyles, userEffects } = useEffectsContext();

  const [effectsDisabled, setEffectsDisabled] = useState(false);

  const effectsContainerRef = useRef<HTMLDivElement>(null);
  const subEffectsContainerRef = useRef<HTMLDivElement>(null);

  const overflow = useRef(false);

  const [_, setRerender] = useState(false);

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
    if (!applicationContainerRef.current) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (effectsContainerRef.current && subEffectsContainerRef.current) {
        overflow.current =
          effectsContainerRef.current.clientWidth <
          subEffectsContainerRef.current.clientWidth;
        setRerender((prev) => !prev);
      }
    });

    observer.observe(applicationContainerRef.current);

    if (effectsContainerRef.current && subEffectsContainerRef.current) {
      overflow.current =
        effectsContainerRef.current.clientWidth <
        subEffectsContainerRef.current.clientWidth;
      setRerender((prev) => !prev);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={effectsContainerRef}
      className='flex small-horizontal-scroll-bar z-30 w-full max-w-full left-1/2 rounded absolute items-center pointer-events-auto'
      style={{
        bottom: "calc(max(2rem, min(12% + 0.5rem, 3.5rem)))",
        height: overflow.current ? "calc(1.75rem + 10%)" : "10%",
        maxHeight: overflow.current ? "6.75rem" : "5rem",
        minHeight: overflow.current ? "4.75rem" : "3rem",
        overflowX: overflow.current ? "auto" : "hidden",
        justifyContent: overflow.current ? "flex-start" : "center",
      }}
      variants={EffectSectionVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={EffectSectionTransition}
    >
      <div
        ref={subEffectsContainerRef}
        className='flex h-full w-max items-center justify-center px-4 space-x-2'
      >
        <BabylonPostProcessEffectsButton
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          streamEffects={
            userEffects.current.application[applicationInstanceId].postProcess
          }
          effectsStyles={
            userEffectsStyles.current.application[applicationInstanceId]
              .postProcess
          }
          clickFunctionCallback={async () => {
            applicationMedia.babylonScene?.babylonShaderController.swapPostProcessEffects(
              userEffectsStyles.current.application[applicationInstanceId]
                .postProcess.style
            );

            await lowerApplicationController.handleApplicationEffect(
              "postProcess",
              false
            );
          }}
          holdFunctionCallback={async (effectType) => {
            userEffectsStyles.current.application[
              applicationInstanceId
            ].postProcess.style = effectType;

            applicationMedia.babylonScene?.babylonShaderController.swapPostProcessEffects(
              effectType
            );

            await lowerApplicationController.handleApplicationEffect(
              "postProcess",
              userEffects.current.application[applicationInstanceId].postProcess
            );
          }}
        />
        <BlurButton
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          streamEffects={
            userEffects.current.application[applicationInstanceId].blur
          }
          clickFunctionCallback={async () => {
            await lowerApplicationController.handleApplicationEffect(
              "blur",
              false
            );
          }}
        />
        <TintSection
          tintColor={tintColor}
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          streamEffects={
            userEffects.current.application[applicationInstanceId].tint
          }
          clickFunctionCallback={async () => {
            userEffectsStyles.current.application[
              applicationInstanceId
            ].tint.color = tintColor.current;

            await lowerApplicationController.handleApplicationEffect(
              "tint",
              false
            );
          }}
          acceptColorCallback={async () => {
            userEffectsStyles.current.application[
              applicationInstanceId
            ].tint.color = tintColor.current;

            await lowerApplicationController.handleApplicationEffect(
              "tint",
              userEffects.current.application[applicationInstanceId].tint
            );
          }}
        />
      </div>
    </motion.div>
  );
}
