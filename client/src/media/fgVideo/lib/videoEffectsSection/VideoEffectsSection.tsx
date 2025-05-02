import React, {
  useState,
  useEffect,
  useRef,
  Suspense,
  useLayoutEffect,
} from "react";
import { Transition, Variants, motion } from "framer-motion";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import LowerVideoController from "../lowerVideoControls/LowerVideoController";
import BabylonPostProcessEffectsButton from "../../../../elements/effectsButtons/BabylonPostProcessEffectsButton";
import BlurButton from "../../../../elements/effectsButtons/BlurButton";
import TintSection from "../../../../elements/effectsButtons/TintSection";
import ClearAllButton from "../../../../elements/effectsButtons/ClearAllButton";
import VideoMediaInstance from "../../VideoMediaInstance";

const HideBackgroundButton = React.lazy(
  () => import("../../../../elements/effectsButtons/HideBackgroundButton"),
);
const GlassesButton = React.lazy(
  () => import("../../../../elements/effectsButtons/GlassesButton"),
);
const BeardsButton = React.lazy(
  () => import("../../../../elements/effectsButtons/BeardsButton"),
);
const MustachesButton = React.lazy(
  () => import("../../../../elements/effectsButtons/MustachesButton"),
);
const MasksButton = React.lazy(
  () => import("../../../../elements/effectsButtons/MasksButton"),
);
const HatsButton = React.lazy(
  () => import("../../../../elements/effectsButtons/HatsButton"),
);
const PetsButton = React.lazy(
  () => import("../../../../elements/effectsButtons/PetsButton"),
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
  videoInstanceId,
  lowerVideoController,
  tintColor,
  videoMediaInstance,
  videoContainerRef,
}: {
  videoInstanceId: string;
  lowerVideoController: React.MutableRefObject<LowerVideoController>;
  tintColor: React.MutableRefObject<string>;
  videoMediaInstance: VideoMediaInstance;
  videoContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { userEffectsStyles, userEffects } = useEffectsContext();

  const [effectsDisabled, setEffectsDisabled] = useState(false);

  const effectsContainerRef = useRef<HTMLDivElement>(null);
  const subEffectsContainerRef = useRef<HTMLDivElement>(null);

  const overflow = useRef(false);

  const faceDetectedCount = useRef(
    videoMediaInstance.videoMedia.maxFacesDetected,
  );

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
      videoMediaInstance.videoMedia.addFaceCountChangeListener(
        handleFaceDetectedCountChange,
      );
    }
    effectsContainerRef.current?.addEventListener("wheel", handleWheel);

    return () => {
      if (faceDetectedCount.current === 0) {
        videoMediaInstance.videoMedia.removeFaceCountChangeListener(
          handleFaceDetectedCountChange,
        );
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
      className="small-horizontal-scroll-bar pointer-events-auto absolute left-1/2 z-30 flex w-full max-w-full items-center rounded"
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
      initial="init"
      animate="animate"
      exit="init"
      transition={EffectSectionTransition}
    >
      <div
        ref={subEffectsContainerRef}
        className="flex h-full w-max items-center justify-center space-x-2 px-4"
      >
        <ClearAllButton
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={async () => {
            await lowerVideoController.current.handleVideoEffect(
              "clearAll",
              false,
            );
          }}
        />
        <BabylonPostProcessEffectsButton
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          streamEffects={
            userEffects.current.video[videoInstanceId].video.postProcess
          }
          effectsStyles={
            userEffectsStyles.current.video[videoInstanceId].video.postProcess
          }
          clickFunctionCallback={async () => {
            videoMediaInstance.babylonScene?.babylonShaderController.swapPostProcessEffects(
              userEffectsStyles.current.video[videoInstanceId].video.postProcess
                .style,
            );

            await lowerVideoController.current.handleVideoEffect(
              "postProcess",
              false,
            );
          }}
          holdFunctionCallback={async (effectType) => {
            userEffectsStyles.current.video[
              videoInstanceId
            ].video.postProcess.style = effectType;

            videoMediaInstance.babylonScene?.babylonShaderController.swapPostProcessEffects(
              userEffectsStyles.current.video[videoInstanceId].video.postProcess
                .style,
            );

            await lowerVideoController.current.handleVideoEffect(
              "postProcess",
              userEffects.current.video[videoInstanceId].video.postProcess,
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
                userEffects.current.video[videoInstanceId].video.hideBackground
              }
              effectsStyles={
                userEffectsStyles.current.video[videoInstanceId].video
                  .hideBackground
              }
              clickFunctionCallback={async () => {
                const effectsStyles =
                  userEffectsStyles.current.video[videoInstanceId].video
                    .hideBackground;

                videoMediaInstance.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
                  effectsStyles.style,
                );

                await lowerVideoController.current.handleVideoEffect(
                  "hideBackground",
                  false,
                );
              }}
              holdFunctionCallback={async (effectType) => {
                const effectsStyles =
                  userEffectsStyles.current.video[videoInstanceId].video
                    .hideBackground;
                const streamEffects =
                  userEffects.current.video[videoInstanceId].video
                    .hideBackground;

                effectsStyles.style = effectType;
                videoMediaInstance.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
                  effectType,
                );

                await lowerVideoController.current.handleVideoEffect(
                  "hideBackground",
                  streamEffects,
                );
              }}
              acceptColorCallback={async (color) => {
                const effectsStyles =
                  userEffectsStyles.current.video[videoInstanceId].video
                    .hideBackground;
                const streamEffects =
                  userEffects.current.video[videoInstanceId].video
                    .hideBackground;

                videoMediaInstance.babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
                  color,
                );

                effectsStyles.style = "color";
                effectsStyles.color = color;

                await lowerVideoController.current.handleVideoEffect(
                  "hideBackground",
                  streamEffects,
                );
              }}
            />
          </Suspense>
        )}
        <BlurButton
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          streamEffects={userEffects.current.video[videoInstanceId].video.blur}
          clickFunctionCallback={async () => {
            await lowerVideoController.current.handleVideoEffect("blur", false);
          }}
        />
        <TintSection
          tintColor={tintColor}
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          streamEffects={userEffects.current.video[videoInstanceId].video.tint}
          clickFunctionCallback={async () => {
            userEffectsStyles.current.video[videoInstanceId].video.tint.color =
              tintColor.current;

            await lowerVideoController.current.handleVideoEffect("tint", false);
          }}
          acceptColorCallback={async () => {
            userEffectsStyles.current.video[videoInstanceId].video.tint.color =
              tintColor.current;

            await lowerVideoController.current.handleVideoEffect(
              "tint",
              userEffects.current.video[videoInstanceId].video.tint,
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
                userEffects.current.video[videoInstanceId].video.glasses
              }
              effectsStyles={
                userEffectsStyles.current.video[videoInstanceId].video.glasses
              }
              clickFunctionCallback={async () => {
                await lowerVideoController.current.handleVideoEffect(
                  "glasses",
                  false,
                );
              }}
              holdFunctionCallback={async (effectType) => {
                userEffectsStyles.current.video[
                  videoInstanceId
                ].video.glasses.style = effectType;

                await lowerVideoController.current.handleVideoEffect(
                  "glasses",
                  userEffects.current.video[videoInstanceId].video.glasses,
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
                userEffects.current.video[videoInstanceId].video.beards
              }
              effectsStyles={
                userEffectsStyles.current.video[videoInstanceId].video.beards
              }
              clickFunctionCallback={async () => {
                await lowerVideoController.current.handleVideoEffect(
                  "beards",
                  false,
                );
              }}
              holdFunctionCallback={async (effectType) => {
                userEffectsStyles.current.video[
                  videoInstanceId
                ].video.beards.style = effectType;

                await lowerVideoController.current.handleVideoEffect(
                  "beards",
                  userEffects.current.video[videoInstanceId].video.beards,
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
                userEffects.current.video[videoInstanceId].video.mustaches
              }
              effectsStyles={
                userEffectsStyles.current.video[videoInstanceId].video.mustaches
              }
              clickFunctionCallback={async () => {
                await lowerVideoController.current.handleVideoEffect(
                  "mustaches",
                  false,
                );
              }}
              holdFunctionCallback={async (effectType) => {
                userEffectsStyles.current.video[
                  videoInstanceId
                ].video.mustaches.style = effectType;

                await lowerVideoController.current.handleVideoEffect(
                  "mustaches",
                  userEffects.current.video[videoInstanceId].video.mustaches,
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
                userEffects.current.video[videoInstanceId].video.masks
              }
              effectsStyles={
                userEffectsStyles.current.video[videoInstanceId].video.masks
              }
              clickFunctionCallback={async () => {
                await lowerVideoController.current.handleVideoEffect(
                  "masks",
                  false,
                );
              }}
              holdFunctionCallback={async (effectType) => {
                userEffectsStyles.current.video[
                  videoInstanceId
                ].video.masks.style = effectType;

                await lowerVideoController.current.handleVideoEffect(
                  "masks",
                  userEffects.current.video[videoInstanceId].video.masks,
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
                userEffects.current.video[videoInstanceId].video.hats
              }
              effectsStyles={
                userEffectsStyles.current.video[videoInstanceId].video.hats
              }
              clickFunctionCallback={async () => {
                await lowerVideoController.current.handleVideoEffect(
                  "hats",
                  false,
                );
              }}
              holdFunctionCallback={async (effectType) => {
                userEffectsStyles.current.video[
                  videoInstanceId
                ].video.hats.style = effectType;

                await lowerVideoController.current.handleVideoEffect(
                  "hats",
                  userEffects.current.video[videoInstanceId].video.hats,
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
                userEffects.current.video[videoInstanceId].video.pets
              }
              effectsStyles={
                userEffectsStyles.current.video[videoInstanceId].video.pets
              }
              clickFunctionCallback={async () => {
                await lowerVideoController.current.handleVideoEffect(
                  "pets",
                  false,
                );
              }}
              holdFunctionCallback={async (effectType) => {
                userEffectsStyles.current.video[
                  videoInstanceId
                ].video.pets.style = effectType;

                await lowerVideoController.current.handleVideoEffect(
                  "pets",
                  userEffects.current.video[videoInstanceId].video.pets,
                );
              }}
            />
          </Suspense>
        )}
      </div>
    </motion.div>
  );
}
