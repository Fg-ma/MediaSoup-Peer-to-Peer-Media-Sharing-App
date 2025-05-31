import React, {
  useState,
  useEffect,
  useRef,
  Suspense,
  useLayoutEffect,
} from "react";
import { Transition, Variants, motion } from "framer-motion";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import LowerImageController from "../lowerImageControls/LowerImageController";
import BabylonPostProcessEffectsButton from "../../../../elements/effectsButtons/BabylonPostProcessEffectsButton";
import BlurButton from "../../../../elements/effectsButtons/BlurButton";
import TintSection from "../../../../elements/effectsButtons/TintSection";
import ClearAllButton from "../../../../elements/effectsButtons/ClearAllButton";
import TableImageMediaInstance from "../../TableImageMediaInstance";

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
const FaceCountButton = React.lazy(
  () => import("../../../../elements/effectsButtons/FaceCountButton"),
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
  imageInstanceId,
  lowerImageController,
  tintColor,
  imageMediaInstance,
  imageContainerRef,
}: {
  imageInstanceId: string;
  lowerImageController: React.MutableRefObject<LowerImageController>;
  tintColor: React.MutableRefObject<string>;
  imageMediaInstance: TableImageMediaInstance;
  imageContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { staticContentEffectsStyles, staticContentEffects } =
    useEffectsContext();

  const [effectsDisabled, setEffectsDisabled] = useState(true);

  const effectsContainerRef = useRef<HTMLDivElement>(null);
  const subEffectsContainerRef = useRef<HTMLDivElement>(null);

  const overflow = useRef(false);

  const [_, setRerender] = useState(false);

  const faceDetectedCount = useRef(
    imageMediaInstance.imageMedia.detectedFaces[0],
  );
  const [noFacesDetectedWarning, setNoFacesDetectedWarning] = useState(false);
  const forceDetectingFaces = useRef(false);
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
    if (forceDetectingFaces.current && faceDetectedCount.current === 0) {
      forceDetectingFaces.current = false;

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
    if (faceDetectedCount.current === 0)
      imageMediaInstance.forceRedetectFaces();

    imageMediaInstance.imageMedia.addFaceCountChangeListener(
      handleFaceDetectedCountChange,
    );
    imageMediaInstance.babylonScene?.addForceFaceDetectEndListener(
      handleForceFaceDetectEnd,
    );
    effectsContainerRef.current?.addEventListener("wheel", handleWheel);

    return () => {
      imageMediaInstance.imageMedia.removeFaceCountChangeListener(
        handleFaceDetectedCountChange,
      );
      imageMediaInstance.babylonScene?.removeForceFaceDetectEndListener(
        handleForceFaceDetectEnd,
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
  }, [imageMediaInstance.imageMedia.detectedFaces]);

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
              pointerEvents: "auto",
            }}
            clickFunctionCallback={() => {
              forceDetectingFaces.current = true;

              setRerender((prev) => !prev);

              imageMediaInstance.forceRedetectFaces();
            }}
            forceDetectingFaces={forceDetectingFaces}
            noFacesDetectedWarning={noFacesDetectedWarning}
          />
        </Suspense>
      )}
      <motion.div
        ref={effectsContainerRef}
        className="small-horizontal-scroll-bar pointer-events-auto absolute left-1/2 z-30 flex w-full max-w-full items-center rounded"
        style={{
          bottom: "calc(max(2rem, min(12% + 0.5rem, 3.5rem)))",
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
              await lowerImageController.current.handleImageEffect(
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
              staticContentEffects.current.image[imageInstanceId].postProcess
            }
            effectsStyles={
              staticContentEffectsStyles.current.image[imageInstanceId]
                .postProcess
            }
            clickFunctionCallback={async () => {
              imageMediaInstance.babylonScene?.babylonShaderController.swapPostProcessEffects(
                staticContentEffectsStyles.current.image[imageInstanceId]
                  .postProcess.style,
              );

              await lowerImageController.current.handleImageEffect(
                "postProcess",
                false,
              );
            }}
            holdFunctionCallback={async (effectType) => {
              staticContentEffectsStyles.current.image[
                imageInstanceId
              ].postProcess.style = effectType;

              imageMediaInstance.babylonScene?.babylonShaderController.swapPostProcessEffects(
                effectType,
              );

              await lowerImageController.current.handleImageEffect(
                "postProcess",
                staticContentEffects.current.image[imageInstanceId].postProcess,
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
                  staticContentEffects.current.image[imageInstanceId]
                    .hideBackground
                }
                effectsStyles={
                  staticContentEffectsStyles.current.image[imageInstanceId]
                    .hideBackground
                }
                clickFunctionCallback={async () => {
                  const effectsStyles =
                    staticContentEffectsStyles.current.image[imageInstanceId]
                      .hideBackground;

                  imageMediaInstance.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
                    effectsStyles.style,
                  );

                  await lowerImageController.current.handleImageEffect(
                    "hideBackground",
                    false,
                  );
                }}
                holdFunctionCallback={async (effectType) => {
                  const effectsStyles =
                    staticContentEffectsStyles.current.image[imageInstanceId]
                      .hideBackground;
                  const streamEffects =
                    staticContentEffects.current.image[imageInstanceId]
                      .hideBackground;

                  staticContentEffectsStyles.current.image[
                    imageInstanceId
                  ].hideBackground.style = effectType;

                  if (effectType !== "color") {
                    imageMediaInstance.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
                      effectType,
                    );
                  } else {
                    imageMediaInstance.babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
                      effectsStyles.color,
                    );
                  }

                  await lowerImageController.current.handleImageEffect(
                    "hideBackground",
                    streamEffects,
                  );
                }}
                acceptColorCallback={async (color) => {
                  const effectsStyles =
                    staticContentEffectsStyles.current.image[imageInstanceId]
                      .hideBackground;
                  const streamEffects =
                    staticContentEffects.current.image[imageInstanceId]
                      .hideBackground;

                  imageMediaInstance.babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
                    color,
                  );

                  effectsStyles.style = "color";
                  effectsStyles.color = color;

                  await lowerImageController.current.handleImageEffect(
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
            streamEffects={
              staticContentEffects.current.image[imageInstanceId].blur
            }
            clickFunctionCallback={async () => {
              await lowerImageController.current.handleImageEffect(
                "blur",
                false,
              );
            }}
          />
          <TintSection
            tintColor={tintColor}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
            streamEffects={
              staticContentEffects.current.image[imageInstanceId].tint
            }
            clickFunctionCallback={async () => {
              staticContentEffectsStyles.current.image[
                imageInstanceId
              ].tint.color = tintColor.current;

              await lowerImageController.current.handleImageEffect(
                "tint",
                false,
              );
            }}
            acceptColorCallback={async () => {
              staticContentEffectsStyles.current.image[
                imageInstanceId
              ].tint.color = tintColor.current;

              await lowerImageController.current.handleImageEffect(
                "tint",
                staticContentEffects.current.image[imageInstanceId].tint,
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
                  staticContentEffects.current.image[imageInstanceId].glasses
                }
                effectsStyles={
                  staticContentEffectsStyles.current.image[imageInstanceId]
                    .glasses
                }
                clickFunctionCallback={async () => {
                  await lowerImageController.current.handleImageEffect(
                    "glasses",
                    false,
                  );
                }}
                holdFunctionCallback={async (effectType) => {
                  staticContentEffectsStyles.current.image[
                    imageInstanceId
                  ].glasses.style = effectType;

                  await lowerImageController.current.handleImageEffect(
                    "glasses",
                    staticContentEffects.current.image[imageInstanceId].glasses,
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
                  staticContentEffects.current.image[imageInstanceId].beards
                }
                effectsStyles={
                  staticContentEffectsStyles.current.image[imageInstanceId]
                    .beards
                }
                clickFunctionCallback={async () => {
                  await lowerImageController.current.handleImageEffect(
                    "beards",
                    false,
                  );
                }}
                holdFunctionCallback={async (effectType) => {
                  staticContentEffectsStyles.current.image[
                    imageInstanceId
                  ].beards.style = effectType;

                  await lowerImageController.current.handleImageEffect(
                    "beards",
                    staticContentEffects.current.image[imageInstanceId].beards,
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
                  staticContentEffects.current.image[imageInstanceId].mustaches
                }
                effectsStyles={
                  staticContentEffectsStyles.current.image[imageInstanceId]
                    .mustaches
                }
                clickFunctionCallback={async () => {
                  await lowerImageController.current.handleImageEffect(
                    "mustaches",
                    false,
                  );
                }}
                holdFunctionCallback={async (effectType) => {
                  staticContentEffectsStyles.current.image[
                    imageInstanceId
                  ].mustaches.style = effectType;

                  await lowerImageController.current.handleImageEffect(
                    "mustaches",
                    staticContentEffects.current.image[imageInstanceId]
                      .mustaches,
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
                  staticContentEffects.current.image[imageInstanceId].masks
                }
                effectsStyles={
                  staticContentEffectsStyles.current.image[imageInstanceId]
                    .masks
                }
                clickFunctionCallback={async () => {
                  await lowerImageController.current.handleImageEffect(
                    "masks",
                    false,
                  );
                }}
                holdFunctionCallback={async (effectType) => {
                  staticContentEffectsStyles.current.image[
                    imageInstanceId
                  ].masks.style = effectType;

                  await lowerImageController.current.handleImageEffect(
                    "masks",
                    staticContentEffects.current.image[imageInstanceId].masks,
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
                  staticContentEffects.current.image[imageInstanceId].hats
                }
                effectsStyles={
                  staticContentEffectsStyles.current.image[imageInstanceId].hats
                }
                clickFunctionCallback={async () => {
                  await lowerImageController.current.handleImageEffect(
                    "hats",
                    false,
                  );
                }}
                holdFunctionCallback={async (effectType) => {
                  staticContentEffectsStyles.current.image[
                    imageInstanceId
                  ].hats.style = effectType;

                  await lowerImageController.current.handleImageEffect(
                    "hats",
                    staticContentEffects.current.image[imageInstanceId].hats,
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
                  staticContentEffects.current.image[imageInstanceId].pets
                }
                effectsStyles={
                  staticContentEffectsStyles.current.image[imageInstanceId].pets
                }
                clickFunctionCallback={async () => {
                  await lowerImageController.current.handleImageEffect(
                    "pets",
                    false,
                  );
                }}
                holdFunctionCallback={async (effectType) => {
                  staticContentEffectsStyles.current.image[
                    imageInstanceId
                  ].pets.style = effectType;

                  await lowerImageController.current.handleImageEffect(
                    "pets",
                    staticContentEffects.current.image[imageInstanceId].pets,
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
