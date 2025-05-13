import React, { useState, useEffect, useRef, Suspense } from "react";
import { useEffectsContext } from "../../../../../../../../context/effectsContext/EffectsContext";
import { useSocketContext } from "../../../../../../../../context/socketContext/SocketContext";
import BabylonPostProcessEffectsButton from "../../../../../../../../elements/effectsButtons/BabylonPostProcessEffectsButton";
import BlurButton from "../../../../../../../../elements/effectsButtons/BlurButton";
import TintSection from "../../../../../../../../elements/effectsButtons/TintSection";
import ClearAllButton from "../../../../../../../../elements/effectsButtons/ClearAllButton";
import { VideoEffectTypes } from "../../../../../../../../../../universal/effectsTypeConstant";
import TableVideoMediaInstance from "../../../../../../../../media/fgTableVideo/TableVideoMediaInstance";

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

export default function VideoEffectsSection({
  videoInstanceId,
  videoMediaInstance,
}: {
  videoInstanceId: string;
  videoMediaInstance: TableVideoMediaInstance;
}) {
  const { userEffectsStyles, userEffects } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const [effectsDisabled, setEffectsDisabled] = useState(false);

  const effectsContainerRef = useRef<HTMLDivElement>(null);

  const tintColor = useRef(
    userEffectsStyles.current.video[videoInstanceId].video.tint.color,
  );

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

  const handleVideoEffect = async (
    effect: VideoEffectTypes | "clearAll",
    blockStateChange: boolean,
  ) => {
    if (effect !== "clearAll") {
      if (!blockStateChange) {
        userEffects.current.video[videoInstanceId].video[effect] =
          !userEffects.current.video[videoInstanceId].video[effect];
      }

      videoMediaInstance.changeEffects(
        effect,
        tintColor.current,
        blockStateChange,
      );

      tableStaticContentSocket.current?.updateContentEffects(
        "video",
        videoMediaInstance.videoMedia.videoId,
        videoInstanceId,
        userEffects.current.video[videoInstanceId].video,
        userEffectsStyles.current.video[videoInstanceId].video,
      );
    } else {
      videoMediaInstance.clearAllEffects();

      tableStaticContentSocket.current?.updateContentEffects(
        "video",
        videoMediaInstance.videoMedia.videoId,
        videoInstanceId,
        userEffects.current.video[videoInstanceId].video,
        userEffectsStyles.current.video[videoInstanceId].video,
      );
    }
  };

  return (
    <div
      ref={effectsContainerRef}
      className="hide-scroll-bar z-30 flex h-12 w-full max-w-full items-center overflow-auto rounded"
    >
      <div className="flex h-full w-max items-center justify-center space-x-2 px-4">
        <ClearAllButton
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={async () => {
            await handleVideoEffect("clearAll", false);
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

            await handleVideoEffect("postProcess", false);
          }}
          holdFunctionCallback={async (effectType) => {
            userEffectsStyles.current.video[
              videoInstanceId
            ].video.postProcess.style = effectType;

            videoMediaInstance.babylonScene?.babylonShaderController.swapPostProcessEffects(
              userEffectsStyles.current.video[videoInstanceId].video.postProcess
                .style,
            );

            await handleVideoEffect(
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

                await handleVideoEffect("hideBackground", false);
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

                await handleVideoEffect("hideBackground", streamEffects);
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

                await handleVideoEffect("hideBackground", streamEffects);
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
            await handleVideoEffect("blur", false);
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

            await handleVideoEffect("tint", false);
          }}
          acceptColorCallback={async () => {
            userEffectsStyles.current.video[videoInstanceId].video.tint.color =
              tintColor.current;

            await handleVideoEffect(
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
                await handleVideoEffect("glasses", false);
              }}
              holdFunctionCallback={async (effectType) => {
                userEffectsStyles.current.video[
                  videoInstanceId
                ].video.glasses.style = effectType;

                await handleVideoEffect(
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
                await handleVideoEffect("beards", false);
              }}
              holdFunctionCallback={async (effectType) => {
                userEffectsStyles.current.video[
                  videoInstanceId
                ].video.beards.style = effectType;

                await handleVideoEffect(
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
                await handleVideoEffect("mustaches", false);
              }}
              holdFunctionCallback={async (effectType) => {
                userEffectsStyles.current.video[
                  videoInstanceId
                ].video.mustaches.style = effectType;

                await handleVideoEffect(
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
                await handleVideoEffect("masks", false);
              }}
              holdFunctionCallback={async (effectType) => {
                userEffectsStyles.current.video[
                  videoInstanceId
                ].video.masks.style = effectType;

                await handleVideoEffect(
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
                await handleVideoEffect("hats", false);
              }}
              holdFunctionCallback={async (effectType) => {
                userEffectsStyles.current.video[
                  videoInstanceId
                ].video.hats.style = effectType;

                await handleVideoEffect(
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
                await handleVideoEffect("pets", false);
              }}
              holdFunctionCallback={async (effectType) => {
                userEffectsStyles.current.video[
                  videoInstanceId
                ].video.pets.style = effectType;

                await handleVideoEffect(
                  "pets",
                  userEffects.current.video[videoInstanceId].video.pets,
                );
              }}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
