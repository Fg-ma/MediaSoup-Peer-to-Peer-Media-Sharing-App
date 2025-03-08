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
import ClearAllButton from "../../../../elements/effectsButtons/ClearAllButton";

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

export default function VideoEffectsSection({
  videoId,
  lowerVideoController,
  tintColor,
  videoMedia,
  videoContainerRef,
}: {
  videoId: string;
  lowerVideoController: lowerVideoController;
  tintColor: React.MutableRefObject<string>;
  videoMedia: VideoMedia;
  videoContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { userEffectsStyles, userStreamEffects } = useEffectsContext();
  const { userMedia } = useMediaContext();

  const [effectsDisabled, setEffectsDisabled] = useState(false);

  const effectsContainerRef = useRef<HTMLDivElement>(null);
  const subEffectsContainerRef = useRef<HTMLDivElement>(null);

  const overflow = useRef(false);

  const faceDetectedCount = useRef(videoMedia.maxFacesDetected);

  const [_, setRerender] = useState(false);

  const handleWheel = (event: WheelEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (effectsContainerRef.current) {
      effectsContainerRef.current.scrollLeft += event.deltaY;
    }
  };

  const handleFaceDetectedCountChange = (facesDetected: number) => {
    if (facesDetected > faceDetectedCount.current) {
      faceDetectedCount.current = facesDetected;

      setRerender((prev) => !prev);
    }
  };

  useEffect(() => {
    if (faceDetectedCount.current === 0) {
      videoMedia.addFaceCountChangeListener(handleFaceDetectedCountChange);
    }
    effectsContainerRef.current?.addEventListener("wheel", handleWheel);

    return () => {
      if (faceDetectedCount.current === 0) {
        videoMedia.removeFaceCountChangeListener(handleFaceDetectedCountChange);
      }
      effectsContainerRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useLayoutEffect(() => {
    if (!videoContainerRef.current) {
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

    observer.observe(videoContainerRef.current);

    if (effectsContainerRef.current && subEffectsContainerRef.current) {
      overflow.current =
        effectsContainerRef.current.clientWidth <
        subEffectsContainerRef.current.clientWidth;
      setRerender((prev) => !prev);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (effectsContainerRef.current && subEffectsContainerRef.current) {
      overflow.current =
        effectsContainerRef.current.clientWidth <
        subEffectsContainerRef.current.clientWidth;
      setRerender((prev) => !prev);
    }
  }, [faceDetectedCount.current]);

  return (
    <motion.div
      ref={effectsContainerRef}
      className='flex small-horizontal-scroll-bar z-30 w-full max-w-full left-1/2 rounded absolute items-center pointer-events-auto'
      style={{
        bottom: overflow.current
          ? "calc(max(2.5rem, min(12% + 1rem, 4rem)))"
          : "calc(max(3rem, min(12% + 1.5rem, 4.5rem)))",
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
        <ClearAllButton
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={async () => {
            await lowerVideoController.handleVideoEffect("clearAll", false);
          }}
        />
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
        {faceDetectedCount.current > 0 && (
          <Suspense fallback={<div>Loading...</div>}>
            <HideBackgroundButton
              effectsDisabled={effectsDisabled}
              setEffectsDisabled={setEffectsDisabled}
              scrollingContainerRef={effectsContainerRef}
              streamEffects={
                userStreamEffects.current.video[videoId].video.hideBackground
              }
              effectsStyles={
                userEffectsStyles.current.video[videoId].video.hideBackground
              }
              clickFunctionCallback={async () => {
                const effectsStyles =
                  userEffectsStyles.current.video[videoId].video.hideBackground;

                userMedia.current.video[
                  videoId
                ].babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
                  effectsStyles.style
                );

                await lowerVideoController.handleVideoEffect(
                  "hideBackground",
                  false
                );
              }}
              holdFunctionCallback={async (effectType) => {
                const effectsStyles =
                  userEffectsStyles.current.video[videoId].video.hideBackground;
                const streamEffects =
                  userStreamEffects.current.video[videoId].video.hideBackground;

                effectsStyles.style = effectType;
                userMedia.current.video[
                  videoId
                ].babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
                  effectType
                );

                await lowerVideoController.handleVideoEffect(
                  "hideBackground",
                  streamEffects
                );
              }}
              acceptColorCallback={async (color) => {
                const effectsStyles =
                  userEffectsStyles.current.video[videoId].video.hideBackground;
                const streamEffects =
                  userStreamEffects.current.video[videoId].video.hideBackground;

                userMedia.current.video[
                  videoId
                ].babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
                  color
                );

                effectsStyles.style = "color";
                effectsStyles.color = color;

                await lowerVideoController.handleVideoEffect(
                  "hideBackground",
                  streamEffects
                );
              }}
            />
          </Suspense>
        )}
        <BlurButton
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          streamEffects={userStreamEffects.current.video[videoId].video.blur}
          clickFunctionCallback={async () => {
            await lowerVideoController.handleVideoEffect("blur", false);
          }}
        />
        <TintSection
          tintColor={tintColor}
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          streamEffects={userStreamEffects.current.video[videoId].video.tint}
          clickFunctionCallback={async () => {
            userEffectsStyles.current.video[videoId].video.tint.color =
              tintColor.current;

            await lowerVideoController.handleVideoEffect("tint", false);
          }}
          acceptColorCallback={async () => {
            userEffectsStyles.current.video[videoId].video.tint.color =
              tintColor.current;

            await lowerVideoController.handleVideoEffect(
              "tint",
              userStreamEffects.current.video[videoId].video.tint
            );
          }}
        />
        {faceDetectedCount.current > 0 && (
          <Suspense fallback={<div>Loading...</div>}>
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
        {faceDetectedCount.current > 0 && (
          <Suspense fallback={<div>Loading...</div>}>
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
        {faceDetectedCount.current > 0 && (
          <Suspense fallback={<div>Loading...</div>}>
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
                await lowerVideoController.handleVideoEffect(
                  "mustaches",
                  false
                );
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
        {faceDetectedCount.current > 0 && (
          <Suspense fallback={<div>Loading...</div>}>
            <MasksButton
              effectsDisabled={effectsDisabled}
              setEffectsDisabled={setEffectsDisabled}
              scrollingContainerRef={effectsContainerRef}
              streamEffects={
                userStreamEffects.current.video[videoId].video.masks
              }
              effectsStyles={
                userEffectsStyles.current.video[videoId].video.masks
              }
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
        {faceDetectedCount.current > 0 && (
          <Suspense fallback={<div>Loading...</div>}>
            <HatsButton
              effectsDisabled={effectsDisabled}
              setEffectsDisabled={setEffectsDisabled}
              scrollingContainerRef={effectsContainerRef}
              streamEffects={
                userStreamEffects.current.video[videoId].video.hats
              }
              effectsStyles={
                userEffectsStyles.current.video[videoId].video.hats
              }
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
        {faceDetectedCount.current > 0 && (
          <Suspense fallback={<div>Loading...</div>}>
            <PetsButton
              effectsDisabled={effectsDisabled}
              setEffectsDisabled={setEffectsDisabled}
              scrollingContainerRef={effectsContainerRef}
              streamEffects={
                userStreamEffects.current.video[videoId].video.pets
              }
              effectsStyles={
                userEffectsStyles.current.video[videoId].video.pets
              }
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
      </div>
    </motion.div>
  );
}
