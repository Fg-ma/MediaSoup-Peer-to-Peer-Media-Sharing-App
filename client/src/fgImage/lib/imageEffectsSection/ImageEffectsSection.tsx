import React, { useState, useEffect, useRef, Suspense } from "react";
import { Transition, Variants, motion } from "framer-motion";
import { useEffectsContext } from "../../../context/effectsContext/EffectsContext";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import ImageMedia from "../../../lib/ImageMedia";
import LowerImageController from "../lowerImageControls/LowerImageController";
import BabylonPostProcessEffectsButton from "../../../fgElements/effectsButtons/BabylonPostProcessEffectsButton";
import BlurButton from "../../../fgElements/effectsButtons/BlurButton";
import TintSection from "../../../fgElements/effectsButtons/TintSection";

const HideBackgroundButton = React.lazy(
  () => import("../../../fgElements/effectsButtons/HideBackgroundButton")
);
const GlassesButton = React.lazy(
  () => import("../../../fgElements/effectsButtons/GlassesButton")
);
const BeardsButton = React.lazy(
  () => import("../../../fgElements/effectsButtons/BeardsButton")
);
const MustachesButton = React.lazy(
  () => import("../../../fgElements/effectsButtons/MustachesButton")
);
const MasksButton = React.lazy(
  () => import("../../../fgElements/effectsButtons/MasksButton")
);
const HatsButton = React.lazy(
  () => import("../../../fgElements/effectsButtons/HatsButton")
);
const PetsButton = React.lazy(
  () => import("../../../fgElements/effectsButtons/PetsButton")
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

export default function ImageEffectsSection({
  imageId,
  imageContainerRef,
  lowerImageController,
  tintColor,
  imageMedia,
}: {
  imageId: string;
  imageContainerRef: React.RefObject<HTMLDivElement>;
  lowerImageController: LowerImageController;
  tintColor: React.MutableRefObject<string>;
  imageMedia: ImageMedia;
}) {
  const { userEffectsStyles, userStreamEffects } = useEffectsContext();
  const { userMedia } = useMediaContext();

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
      } tiny-horizontal-scroll-bar left-1/2 h-max overflow-x-auto rounded mb-5 border-2 border-fg-black-45 border-opacity-90 bg-fg-black-10 bg-opacity-90 shadow-xl flex space-x-1 px-2 pt-2 absolute bottom-full items-center pointer-events-auto`}
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
        streamEffects={userStreamEffects.current.image[imageId].postProcess}
        effectsStyles={userEffectsStyles.current.image[imageId].postProcess}
        clickFunctionCallback={async () => {
          userMedia.current.image[
            imageId
          ].babylonScene?.babylonShaderController.swapPostProcessEffects(
            userEffectsStyles.current.image[imageId].postProcess.style
          );

          await lowerImageController.handleImageEffect("postProcess", false);
        }}
        holdFunctionCallback={async (effectType) => {
          userEffectsStyles.current.image[imageId].postProcess.style =
            effectType;

          userMedia.current.image[
            imageId
          ].babylonScene?.babylonShaderController.swapPostProcessEffects(
            effectType
          );

          await lowerImageController.handleImageEffect(
            "postProcess",
            userStreamEffects.current.image[imageId].postProcess
          );
        }}
      />
      {imageMedia.detectedFaces > 0 && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <HideBackgroundButton
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
            streamEffects={
              userStreamEffects.current.image[imageId].hideBackground
            }
            effectsStyles={
              userEffectsStyles.current.image[imageId].hideBackground
            }
            clickFunctionCallback={async () => {
              const effectsStyles =
                userEffectsStyles.current.image[imageId].hideBackground;

              userMedia.current.image[
                imageId
              ].babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
                effectsStyles.style
              );

              await lowerImageController.handleImageEffect(
                "hideBackground",
                false
              );
            }}
            holdFunctionCallback={async (effectType) => {
              const effectsStyles =
                userEffectsStyles.current.image[imageId].hideBackground;
              const streamEffects =
                userStreamEffects.current.image[imageId].hideBackground;

              effectsStyles.style = effectType;
              userMedia.current.image[
                imageId
              ].babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
                effectType
              );

              await lowerImageController.handleImageEffect(
                "hideBackground",
                streamEffects
              );
            }}
            acceptColorCallback={async (color) => {
              const effectsStyles =
                userEffectsStyles.current.image[imageId].hideBackground;
              const streamEffects =
                userStreamEffects.current.image[imageId].hideBackground;

              userMedia.current.image[
                imageId
              ].babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
                color
              );

              if (effectsStyles.style !== "color" || !streamEffects) {
                effectsStyles.style = "color";
                effectsStyles.color = color;

                await lowerImageController.handleImageEffect(
                  "hideBackground",
                  streamEffects
                );
              }
            }}
          />
        </Suspense>
      )}
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <BlurButton
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={userStreamEffects.current.image[imageId].blur}
        clickFunctionCallback={async () => {
          await lowerImageController.handleImageEffect("blur", false);
        }}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <TintSection
        tintColor={tintColor}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
        streamEffects={userStreamEffects.current.image[imageId].tint}
        clickFunctionCallback={async () => {
          await lowerImageController.handleImageEffect("tint", false);
        }}
        acceptColorCallback={async () => {
          await lowerImageController.handleImageEffect(
            "tint",
            userStreamEffects.current.image[imageId].tint
          );
        }}
      />
      {imageMedia.detectedFaces > 0 && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <GlassesButton
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
            streamEffects={userStreamEffects.current.image[imageId].glasses}
            effectsStyles={userEffectsStyles.current.image[imageId].glasses}
            clickFunctionCallback={async () => {
              await lowerImageController.handleImageEffect("glasses", false);
            }}
            holdFunctionCallback={async (effectType) => {
              userEffectsStyles.current.image[imageId].glasses.style =
                effectType;

              await lowerImageController.handleImageEffect(
                "glasses",
                userStreamEffects.current.image[imageId].glasses
              );
            }}
          />
        </Suspense>
      )}
      {imageMedia.detectedFaces > 0 && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <BeardsButton
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
            streamEffects={userStreamEffects.current.image[imageId].beards}
            effectsStyles={userEffectsStyles.current.image[imageId].beards}
            clickFunctionCallback={async () => {
              await lowerImageController.handleImageEffect("beards", false);
            }}
            holdFunctionCallback={async (effectType) => {
              userEffectsStyles.current.image[imageId].beards.style =
                effectType;

              await lowerImageController.handleImageEffect(
                "beards",
                userStreamEffects.current.image[imageId].beards
              );
            }}
          />
        </Suspense>
      )}
      {imageMedia.detectedFaces > 0 && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <MustachesButton
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
            streamEffects={userStreamEffects.current.image[imageId].mustaches}
            effectsStyles={userEffectsStyles.current.image[imageId].mustaches}
            clickFunctionCallback={async () => {
              await lowerImageController.handleImageEffect("mustaches", false);
            }}
            holdFunctionCallback={async (effectType) => {
              userEffectsStyles.current.image[imageId].mustaches.style =
                effectType;

              await lowerImageController.handleImageEffect(
                "mustaches",
                userStreamEffects.current.image[imageId].mustaches
              );
            }}
          />
        </Suspense>
      )}
      {imageMedia.detectedFaces > 0 && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <MasksButton
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
            streamEffects={userStreamEffects.current.image[imageId].masks}
            effectsStyles={userEffectsStyles.current.image[imageId].masks}
            clickFunctionCallback={async () => {
              await lowerImageController.handleImageEffect("masks", false);
            }}
            holdFunctionCallback={async (effectType) => {
              userEffectsStyles.current.image[imageId].masks.style = effectType;

              await lowerImageController.handleImageEffect(
                "masks",
                userStreamEffects.current.image[imageId].masks
              );
            }}
          />
        </Suspense>
      )}
      {imageMedia.detectedFaces > 0 && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <HatsButton
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
            streamEffects={userStreamEffects.current.image[imageId].hats}
            effectsStyles={userEffectsStyles.current.image[imageId].hats}
            clickFunctionCallback={async () => {
              await lowerImageController.handleImageEffect("hats", false);
            }}
            holdFunctionCallback={async (effectType) => {
              userEffectsStyles.current.image[imageId].hats.style = effectType;

              await lowerImageController.handleImageEffect(
                "hats",
                userStreamEffects.current.image[imageId].hats
              );
            }}
          />
        </Suspense>
      )}
      {imageMedia.detectedFaces > 0 && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <PetsButton
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
            streamEffects={userStreamEffects.current.image[imageId].pets}
            effectsStyles={userEffectsStyles.current.image[imageId].pets}
            clickFunctionCallback={async () => {
              await lowerImageController.handleImageEffect("pets", false);
            }}
            holdFunctionCallback={async (effectType) => {
              userEffectsStyles.current.image[imageId].pets.style = effectType;

              await lowerImageController.handleImageEffect(
                "pets",
                userStreamEffects.current.image[imageId].pets
              );
            }}
          />
        </Suspense>
      )}
    </motion.div>
  );
}
