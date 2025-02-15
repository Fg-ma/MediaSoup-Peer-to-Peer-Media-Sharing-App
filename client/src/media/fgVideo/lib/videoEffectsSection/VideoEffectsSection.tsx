import React, {
  useState,
  useEffect,
  useRef,
  Suspense,
  useLayoutEffect,
} from "react";
import { Transition, Variants, motion } from "framer-motion";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import { useMediaContext } from "../../../../context/mediaContext/MediaContext";
import VideoMedia from "../../VideoMedia";
import lowerVideoController from "../lowerVideoControls/LowerVideoController";
import BabylonPostProcessEffectsButton from "../../../../elements/effectsButtons/BabylonPostProcessEffectsButton";
import BlurButton from "../../../../elements/effectsButtons/BlurButton";
import TintSection from "../../../../elements/effectsButtons/TintSection";

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

export default function VideoEffectsSection({
  videoId,
  lowerVideoController,
  tintColor,
  videoMedia,
}: {
  videoId: string;
  lowerVideoController: lowerVideoController;
  tintColor: React.MutableRefObject<string>;
  videoMedia: VideoMedia;
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
          userStreamEffects.current.video[videoId].video.postProcess
        }
        effectsStyles={
          userEffectsStyles.current.video[videoId].video.postProcess
        }
        clickFunctionCallback={async () => {
          userMedia.current.video[
            videoId
          ].babylonScene?.babylonShaderController.swapPostProcessEffects(
            userEffectsStyles.current.video[videoId].video.postProcess.style
          );

          await lowerVideoController.handleVideoEffect("postProcess", false);
        }}
        holdFunctionCallback={async (effectType) => {
          userEffectsStyles.current.video[videoId].video.postProcess.style =
            effectType;

          userMedia.current.video[
            videoId
          ].babylonScene?.babylonShaderController.swapPostProcessEffects(
            userEffectsStyles.current.video[videoId].video.postProcess.style
          );

          await lowerVideoController.handleVideoEffect(
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
          await lowerVideoController.handleVideoEffect("blur", false);
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
          await lowerVideoController.handleVideoEffect("tint", false);
        }}
        acceptColorCallback={async () => {
          await lowerVideoController.handleVideoEffect(
            "tint",
            userStreamEffects.current.video[videoId].video.tint
          );
        }}
      />
      {videoMedia.maxFacesDetected > 0 && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <GlassesButton
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
            streamEffects={
              userStreamEffects.current.video[videoId].video.glasses
            }
            effectsStyles={
              userEffectsStyles.current.video[videoId].video.glasses
            }
            clickFunctionCallback={async () => {
              await lowerVideoController.handleVideoEffect("glasses", false);
            }}
            holdFunctionCallback={async (effectType) => {
              userEffectsStyles.current.video[videoId].video.glasses.style =
                effectType;

              await lowerVideoController.handleVideoEffect(
                "glasses",
                userStreamEffects.current.video[videoId].video.glasses
              );
            }}
          />
        </Suspense>
      )}
      {videoMedia.maxFacesDetected > 0 && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <BeardsButton
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
            streamEffects={
              userStreamEffects.current.video[videoId].video.beards
            }
            effectsStyles={
              userEffectsStyles.current.video[videoId].video.beards
            }
            clickFunctionCallback={async () => {
              await lowerVideoController.handleVideoEffect("beards", false);
            }}
            holdFunctionCallback={async (effectType) => {
              userEffectsStyles.current.video[videoId].video.beards.style =
                effectType;

              await lowerVideoController.handleVideoEffect(
                "beards",
                userStreamEffects.current.video[videoId].video.beards
              );
            }}
          />
        </Suspense>
      )}
      {videoMedia.maxFacesDetected > 0 && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <MustachesButton
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
            streamEffects={
              userStreamEffects.current.video[videoId].video.mustaches
            }
            effectsStyles={
              userEffectsStyles.current.video[videoId].video.mustaches
            }
            clickFunctionCallback={async () => {
              await lowerVideoController.handleVideoEffect("mustaches", false);
            }}
            holdFunctionCallback={async (effectType) => {
              userEffectsStyles.current.video[videoId].video.mustaches.style =
                effectType;

              await lowerVideoController.handleVideoEffect(
                "mustaches",
                userStreamEffects.current.video[videoId].video.mustaches
              );
            }}
          />
        </Suspense>
      )}
      {videoMedia.maxFacesDetected > 0 && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <MasksButton
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
            streamEffects={userStreamEffects.current.video[videoId].video.masks}
            effectsStyles={userEffectsStyles.current.video[videoId].video.masks}
            clickFunctionCallback={async () => {
              await lowerVideoController.handleVideoEffect("masks", false);
            }}
            holdFunctionCallback={async (effectType) => {
              userEffectsStyles.current.video[videoId].video.masks.style =
                effectType;

              await lowerVideoController.handleVideoEffect(
                "masks",
                userStreamEffects.current.video[videoId].video.masks
              );
            }}
          />
        </Suspense>
      )}
      {videoMedia.maxFacesDetected > 0 && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <HatsButton
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
            streamEffects={userStreamEffects.current.video[videoId].video.hats}
            effectsStyles={userEffectsStyles.current.video[videoId].video.hats}
            clickFunctionCallback={async () => {
              await lowerVideoController.handleVideoEffect("hats", false);
            }}
            holdFunctionCallback={async (effectType) => {
              userEffectsStyles.current.video[videoId].video.hats.style =
                effectType;

              await lowerVideoController.handleVideoEffect(
                "hats",
                userStreamEffects.current.video[videoId].video.hats
              );
            }}
          />
        </Suspense>
      )}
      {videoMedia.maxFacesDetected > 0 && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <PetsButton
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
            streamEffects={userStreamEffects.current.video[videoId].video.pets}
            effectsStyles={userEffectsStyles.current.video[videoId].video.pets}
            clickFunctionCallback={async () => {
              await lowerVideoController.handleVideoEffect("pets", false);
            }}
            holdFunctionCallback={async (effectType) => {
              userEffectsStyles.current.video[videoId].video.pets.style =
                effectType;

              await lowerVideoController.handleVideoEffect(
                "pets",
                userStreamEffects.current.video[videoId].video.pets
              );
            }}
          />
        </Suspense>
      )}
    </motion.div>
  );
}
