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
import ImageMedia from "../../ImageMedia";
import LowerImageController from "../lowerImageControls/LowerImageController";
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
const FaceCountButton = React.lazy(
  () => import("../../../../elements/effectsButtons/FaceCountButton")
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
  lowerImageController,
  tintColor,
  imageMedia,
  imageContainerRef,
}: {
  imageId: string;
  lowerImageController: LowerImageController;
  tintColor: React.MutableRefObject<string>;
  imageMedia: ImageMedia;
  imageContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { userEffectsStyles, userStreamEffects } = useEffectsContext();
  const { userMedia } = useMediaContext();

  const [effectsDisabled, setEffectsDisabled] = useState(true);

  const effectsContainerRef = useRef<HTMLDivElement>(null);
  const subEffectsContainerRef = useRef<HTMLDivElement>(null);

  const overflow = useRef(false);

  const [_, setRerender] = useState(false);

  const faceDetectedCount = useRef(imageMedia.detectedFaces);
  const [forceDetectingFaces, setForceDetectingFaces] = useState(false);
  const [noFacesDetectedWarning, setNoFacesDetectedWarning] = useState(false);
  const noFacesDetectedTimeout = useRef<NodeJS.Timeout>(undefined);

  const handleWheel = (event: WheelEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (effectsContainerRef.current) {
      effectsContainerRef.current.scrollLeft += event.deltaY;
    }
  };

  const handleFaceDetectedCountChange = (facesDetected: number) => {
    faceDetectedCount.current = facesDetected;

    setRerender((prev) => !prev);
  };

  const handleForceFaceDetectEnd = () => {
    setForceDetectingFaces(false);

    if (faceDetectedCount.current === 0) {
      setNoFacesDetectedWarning(true);

      clearTimeout(noFacesDetectedTimeout.current);
      noFacesDetectedTimeout.current = undefined;

      noFacesDetectedTimeout.current = setTimeout(() => {
        setNoFacesDetectedWarning(false);

        clearTimeout(noFacesDetectedTimeout.current);
        noFacesDetectedTimeout.current = undefined;
      }, 2500);
    }
  };

  useEffect(() => {
    imageMedia.addFaceCountChangeListener(handleFaceDetectedCountChange);
    imageMedia.babylonScene?.addForceFaceDetectEndListener(
      handleForceFaceDetectEnd
    );
    effectsContainerRef.current?.addEventListener("wheel", handleWheel);

    return () => {
      imageMedia.removeFaceCountChangeListener(handleFaceDetectedCountChange);
      imageMedia.babylonScene?.removeForceFaceDetectEndListener(
        handleForceFaceDetectEnd
      );
      effectsContainerRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useLayoutEffect(() => {
    if (!imageContainerRef.current) {
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

    observer.observe(imageContainerRef.current);

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
  }, [imageMedia.detectedFaces]);

  return (
    <>
      {faceDetectedCount.current === 0 && (
        <Suspense fallback={<div>Loading...</div>}>
          <FaceCountButton
            style={{
              bottom: overflow.current
                ? "calc(max(2rem, min(12% + 0.5rem, 3.5rem)) + max(4.75rem, min(6.75rem, 1.75rem + 10%)) + 0.75rem)"
                : "calc(max(2rem, min(12% + 0.5rem, 3.5rem)) + max(3rem, min(5rem, 10%)) + 0.75rem)",
              height: "min(max(0.75rem, 4%), 1rem)",
            }}
            clickFunctionCallback={() => {
              setForceDetectingFaces(true);

              imageMedia.forceRedetectFaces();
            }}
            forceDetectingFaces={forceDetectingFaces}
            noFacesDetectedWarning={noFacesDetectedWarning}
          />
        </Suspense>
      )}
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
          <ClearAllButton
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
            clickFunctionCallback={async () => {
              await lowerImageController.handleImageEffect("clearAll", false);
            }}
          />
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

              await lowerImageController.handleImageEffect(
                "postProcess",
                false
              );
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
          {faceDetectedCount.current > 0 && (
            <Suspense fallback={<div>Loading...</div>}>
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

                  userEffectsStyles.current.image[
                    imageId
                  ].hideBackground.style = effectType;

                  if (effectType !== "color") {
                    imageMedia.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
                      effectType
                    );
                  } else {
                    imageMedia.babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
                      effectsStyles.color
                    );
                  }

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

                  imageMedia.babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
                    color
                  );

                  effectsStyles.style = "color";
                  effectsStyles.color = color;

                  await lowerImageController.handleImageEffect(
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
            streamEffects={userStreamEffects.current.image[imageId].blur}
            clickFunctionCallback={async () => {
              await lowerImageController.handleImageEffect("blur", false);
            }}
          />
          <TintSection
            tintColor={tintColor}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
            streamEffects={userStreamEffects.current.image[imageId].tint}
            clickFunctionCallback={async () => {
              userEffectsStyles.current.image[imageId].tint.color =
                tintColor.current;

              await lowerImageController.handleImageEffect("tint", false);
            }}
            acceptColorCallback={async () => {
              userEffectsStyles.current.image[imageId].tint.color =
                tintColor.current;

              await lowerImageController.handleImageEffect(
                "tint",
                userStreamEffects.current.image[imageId].tint
              );
            }}
          />
          {faceDetectedCount.current > 0 && (
            <Suspense fallback={<div>Loading...</div>}>
              <GlassesButton
                effectsDisabled={effectsDisabled}
                setEffectsDisabled={setEffectsDisabled}
                scrollingContainerRef={effectsContainerRef}
                streamEffects={userStreamEffects.current.image[imageId].glasses}
                effectsStyles={userEffectsStyles.current.image[imageId].glasses}
                clickFunctionCallback={async () => {
                  await lowerImageController.handleImageEffect(
                    "glasses",
                    false
                  );
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
          {faceDetectedCount.current > 0 && (
            <Suspense fallback={<div>Loading...</div>}>
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
          {faceDetectedCount.current > 0 && (
            <Suspense fallback={<div>Loading...</div>}>
              <MustachesButton
                effectsDisabled={effectsDisabled}
                setEffectsDisabled={setEffectsDisabled}
                scrollingContainerRef={effectsContainerRef}
                streamEffects={
                  userStreamEffects.current.image[imageId].mustaches
                }
                effectsStyles={
                  userEffectsStyles.current.image[imageId].mustaches
                }
                clickFunctionCallback={async () => {
                  await lowerImageController.handleImageEffect(
                    "mustaches",
                    false
                  );
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
          {faceDetectedCount.current > 0 && (
            <Suspense fallback={<div>Loading...</div>}>
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
                  userEffectsStyles.current.image[imageId].masks.style =
                    effectType;

                  await lowerImageController.handleImageEffect(
                    "masks",
                    userStreamEffects.current.image[imageId].masks
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
                streamEffects={userStreamEffects.current.image[imageId].hats}
                effectsStyles={userEffectsStyles.current.image[imageId].hats}
                clickFunctionCallback={async () => {
                  await lowerImageController.handleImageEffect("hats", false);
                }}
                holdFunctionCallback={async (effectType) => {
                  userEffectsStyles.current.image[imageId].hats.style =
                    effectType;

                  await lowerImageController.handleImageEffect(
                    "hats",
                    userStreamEffects.current.image[imageId].hats
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
                streamEffects={userStreamEffects.current.image[imageId].pets}
                effectsStyles={userEffectsStyles.current.image[imageId].pets}
                clickFunctionCallback={async () => {
                  await lowerImageController.handleImageEffect("pets", false);
                }}
                holdFunctionCallback={async (effectType) => {
                  userEffectsStyles.current.image[imageId].pets.style =
                    effectType;

                  await lowerImageController.handleImageEffect(
                    "pets",
                    userStreamEffects.current.image[imageId].pets
                  );
                }}
              />
            </Suspense>
          )}
        </div>
      </motion.div>
    </>
  );
}
