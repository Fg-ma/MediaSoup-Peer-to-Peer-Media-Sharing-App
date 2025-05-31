import React, { useState, useEffect, useRef, Suspense } from "react";
import { useEffectsContext } from "../../../../../../../../context/effectsContext/EffectsContext";
import { useSocketContext } from "../../../../../../../../context/socketContext/SocketContext";
import BabylonPostProcessEffectsButton from "../../../../../../../../elements/effectsButtons/BabylonPostProcessEffectsButton";
import BlurButton from "../../../../../../../../elements/effectsButtons/BlurButton";
import TintSection from "../../../../../../../../elements/effectsButtons/TintSection";
import ClearAllButton from "../../../../../../../../elements/effectsButtons/ClearAllButton";
import TableImageMediaInstance from "../../../../../../../../media/fgTableImage/TableImageMediaInstance";
import { ImageEffectTypes } from "../../../../../../../../../../universal/effectsTypeConstant";

const HideBackgroundButton = React.lazy(
  () =>
    import(
      "../../../../../../../../elements/effectsButtons/HideBackgroundButton"
    ),
);
const GlassesButton = React.lazy(
  () => import("../../../../../../../../elements/effectsButtons/GlassesButton"),
);
const BeardsButton = React.lazy(
  () => import("../../../../../../../../elements/effectsButtons/BeardsButton"),
);
const MustachesButton = React.lazy(
  () =>
    import("../../../../../../../../elements/effectsButtons/MustachesButton"),
);
const MasksButton = React.lazy(
  () => import("../../../../../../../../elements/effectsButtons/MasksButton"),
);
const HatsButton = React.lazy(
  () => import("../../../../../../../../elements/effectsButtons/HatsButton"),
);
const PetsButton = React.lazy(
  () => import("../../../../../../../../elements/effectsButtons/PetsButton"),
);

export default function ImageEffectsSection({
  imageInstanceId,
  imageMediaInstance,
}: {
  imageInstanceId: string;
  imageMediaInstance: TableImageMediaInstance;
}) {
  const { staticContentEffectsStyles, staticContentEffects } =
    useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const [effectsDisabled, setEffectsDisabled] = useState(true);

  const [_, setRerender] = useState(false);

  const faceDetectedCount = useRef(
    imageMediaInstance.imageMedia.detectedFaces[0],
  );

  const tintColor = useRef(
    staticContentEffectsStyles.current.image[imageInstanceId].tint.color,
  );

  const effectsContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (faceDetectedCount.current === 0)
      imageMediaInstance.forceRedetectFaces();

    effectsContainerRef.current?.addEventListener("wheel", handleWheel);
    imageMediaInstance.imageMedia.addFaceCountChangeListener(
      handleFaceDetectedCountChange,
    );

    return () => {
      effectsContainerRef.current?.removeEventListener("wheel", handleWheel);
      imageMediaInstance.imageMedia.removeFaceCountChangeListener(
        handleFaceDetectedCountChange,
      );
    };
  }, []);

  const handleImageEffect = async (
    effect: ImageEffectTypes | "clearAll",
    blockStateChange: boolean,
  ) => {
    if (effect !== "clearAll") {
      if (!blockStateChange) {
        staticContentEffects.current.image[imageInstanceId][effect] =
          !staticContentEffects.current.image[imageInstanceId][effect];
      }

      imageMediaInstance.changeEffects(
        effect,
        tintColor.current,
        blockStateChange,
      );

      tableStaticContentSocket.current?.updateContentEffects(
        "image",
        imageMediaInstance.imageMedia.imageId,
        imageInstanceId,
        staticContentEffects.current.image[imageInstanceId],
        staticContentEffectsStyles.current.image[imageInstanceId],
      );
    } else {
      imageMediaInstance.clearAllEffects();

      tableStaticContentSocket.current?.updateContentEffects(
        "image",
        imageMediaInstance.imageMedia.imageId,
        imageInstanceId,
        staticContentEffects.current.image[imageInstanceId],
        staticContentEffectsStyles.current.image[imageInstanceId],
      );
    }
  };

  return (
    <div
      ref={effectsContainerRef}
      className="hide-scroll-bar flex h-12 w-full max-w-full items-center justify-start overflow-x-auto rounded"
    >
      <div className="flex h-full w-max items-center justify-center space-x-2 px-2">
        <ClearAllButton
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={async () => {
            await handleImageEffect("clearAll", false);
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

            await handleImageEffect("postProcess", false);
          }}
          holdFunctionCallback={async (effectType) => {
            staticContentEffectsStyles.current.image[
              imageInstanceId
            ].postProcess.style = effectType;

            imageMediaInstance.babylonScene?.babylonShaderController.swapPostProcessEffects(
              effectType,
            );

            await handleImageEffect(
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

                await handleImageEffect("hideBackground", false);
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

                await handleImageEffect("hideBackground", streamEffects);
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

                await handleImageEffect("hideBackground", streamEffects);
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
            await handleImageEffect("blur", false);
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

            await handleImageEffect("tint", false);
          }}
          acceptColorCallback={async () => {
            staticContentEffectsStyles.current.image[
              imageInstanceId
            ].tint.color = tintColor.current;

            await handleImageEffect(
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
                await handleImageEffect("glasses", false);
              }}
              holdFunctionCallback={async (effectType) => {
                staticContentEffectsStyles.current.image[
                  imageInstanceId
                ].glasses.style = effectType;

                await handleImageEffect(
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
                staticContentEffectsStyles.current.image[imageInstanceId].beards
              }
              clickFunctionCallback={async () => {
                await handleImageEffect("beards", false);
              }}
              holdFunctionCallback={async (effectType) => {
                staticContentEffectsStyles.current.image[
                  imageInstanceId
                ].beards.style = effectType;

                await handleImageEffect(
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
                await handleImageEffect("mustaches", false);
              }}
              holdFunctionCallback={async (effectType) => {
                staticContentEffectsStyles.current.image[
                  imageInstanceId
                ].mustaches.style = effectType;

                await handleImageEffect(
                  "mustaches",
                  staticContentEffects.current.image[imageInstanceId].mustaches,
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
                staticContentEffectsStyles.current.image[imageInstanceId].masks
              }
              clickFunctionCallback={async () => {
                await handleImageEffect("masks", false);
              }}
              holdFunctionCallback={async (effectType) => {
                staticContentEffectsStyles.current.image[
                  imageInstanceId
                ].masks.style = effectType;

                await handleImageEffect(
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
                await handleImageEffect("hats", false);
              }}
              holdFunctionCallback={async (effectType) => {
                staticContentEffectsStyles.current.image[
                  imageInstanceId
                ].hats.style = effectType;

                await handleImageEffect(
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
                await handleImageEffect("pets", false);
              }}
              holdFunctionCallback={async (effectType) => {
                staticContentEffectsStyles.current.image[
                  imageInstanceId
                ].pets.style = effectType;

                await handleImageEffect(
                  "pets",
                  staticContentEffects.current.image[imageInstanceId].pets,
                );
              }}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
