import React, { useRef, useState } from "react";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import { useMediaContext } from "../../../../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../../../../context/effectsContext/EffectsContext";
import { PostProcessEffects } from "../../../../../context/effectsContext/typeConstant";
import FgImageElement from "../../../../../fgElements/fgImageElement/FgImageElement";
import FgHoverContentStandard from "../../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import FgLowerVideoController from "../../fgLowerVideoControls/lib/FgLowerVideoController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const prismaColors =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/prismaColors_512x512.jpg";
const prismaColorsSmall =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/prismaColors_32x32.jpg";
const blackAndWhite =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/blackAndWhite_256x256.jpg";
const blackAndWhiteSmall =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/blackAndWhite_32x32.jpg";
const bubbleChromatic =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/bubbleChromatic_850x850.jpg";
const bubbleChromaticSmall =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/bubbleChromatic_32x32.jpg";
const fisheye =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/fisheye_512x512.jpg";
const fisheyeSmall =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/fisheye_32x32.jpg";
const nightVision =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/nightVision_512x512.jpg";
const nightVisionSmall =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/nightVision_32x32.jpg";
const vintageTV =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/vintageTV_512x512.jpg";
const vintageTVSmall =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/vintageTV_32x32.jpg";
const motionblur =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/motionBlur_512x512.jpg";
const motionblurSmall =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/motionBlur_32x32.jpg";
const pixelation =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/pixelation_256x256.png";
const pixelationSmall =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/pixelation_32x32.png";
const old = nginxAssetSeverBaseUrl + "2DAssets/postProcess/old_512x512.jpg";
const oldSmall = nginxAssetSeverBaseUrl + "2DAssets/postProcess/old_32x32.jpg";
const chromaticAberration =
  nginxAssetSeverBaseUrl +
  "2DAssets/postProcess/chromaticAberration_512x512.jpg";
const chromaticAberrationSmall =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/chromaticAberration_32x32.jpg";
const colorSplash =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/colorSplash_850x850.jpg";
const colorSplashSmall =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/colorSplash_32x32.jpg";
const tonemap =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/tonemap_512x512.jpg";
const tonemapSmall =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/tonemap_32x32.jpg";
const rays = nginxAssetSeverBaseUrl + "2DAssets/postProcess/rays_512x512.jpg";
const raysSmall =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/rays_32x32.jpg";
const sharpen =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/sharpen_512x512.jpg";
const sharpenSmall =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/sharpen_32x32.jpg";
const tiltShift =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/tiltShift_512x512.jpg";
const tiltShiftSmall =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/tiltShift_32x32.jpg";
const cartoon =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/cartoon_512x512.png";
const cartoonSmall =
  nginxAssetSeverBaseUrl + "2DAssets/postProcess/cartoon_32x32.png";

export default function BabylonPostProcessEffectsButton({
  videoId,
  fgLowerVideoController,
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
}: {
  videoId: string;
  fgLowerVideoController: FgLowerVideoController;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();
  const { userEffectsStyles, userStreamEffects } = useEffectsContext();

  const [_, setRerender] = useState(0);
  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const postProcessEffectsContainerRef = useRef<HTMLDivElement>(null);

  const streamEffects =
    userStreamEffects.current.video[videoId].video.postProcess;
  const effectsStyles =
    userEffectsStyles.current.video[videoId].video.postProcess;

  const postProcessEffectsChoices: {
    [postProcessEffect in PostProcessEffects]?: {
      label: string;
      image: string;
      imageSmall: string;
    };
  } = {
    prismaColors: {
      label: "Prisma colors",
      image: prismaColors,
      imageSmall: prismaColorsSmall,
    },
    blackAndWhite: {
      label: "Black & white",
      image: blackAndWhite,
      imageSmall: blackAndWhiteSmall,
    },
    bubbleChromatic: {
      label: "Bubbles",
      image: bubbleChromatic,
      imageSmall: bubbleChromaticSmall,
    },
    fisheye: { label: "Fisheye", image: fisheye, imageSmall: fisheyeSmall },
    nightVision: {
      label: "Night vision",
      image: nightVision,
      imageSmall: nightVisionSmall,
    },
    vintageTV: {
      label: "Vintage TV",
      image: vintageTV,
      imageSmall: vintageTVSmall,
    },
    motionblur: {
      label: "Motion blur",
      image: motionblur,
      imageSmall: motionblurSmall,
    },
    pixelation: {
      label: "Pixelation",
      image: pixelation,
      imageSmall: pixelationSmall,
    },
    old: { label: "Old timey", image: old, imageSmall: oldSmall },
    chromaticAberration: {
      label: "Chromatic aberration",
      image: chromaticAberration,
      imageSmall: chromaticAberrationSmall,
    },
    colorSplash: {
      label: "Color splash",
      image: colorSplash,
      imageSmall: colorSplashSmall,
    },
    tonemap: { label: "Tone map", image: tonemap, imageSmall: tonemapSmall },
    rays: { label: "Rays", image: rays, imageSmall: raysSmall },
    sharpen: { label: "Sharpen", image: sharpen, imageSmall: sharpenSmall },
    tiltShift: {
      label: "Tilt shift",
      image: tiltShift,
      imageSmall: tiltShiftSmall,
    },
    cartoon: { label: "Cartoon", image: cartoon, imageSmall: cartoonSmall },
  };

  const clickFunction = async () => {
    setEffectsDisabled(true);
    setRerender((prev) => prev + 1);

    userMedia.current.video[
      videoId
    ].babylonScene.babylonShaderController.swapPostProcessEffects(
      effectsStyles.style
    );

    await fgLowerVideoController.handleVideoEffect(
      "postProcess",
      false,
      undefined,
      undefined,
      effectsStyles.style
    );

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (
      !effectsStyles ||
      !target ||
      !target.dataset.cameraPostProcessEffectsButtonValue
    ) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .cameraPostProcessEffectsButtonValue as PostProcessEffects;

    if (effectsStyles.style !== effectType || !streamEffects) {
      effectsStyles.style = effectType;

      userMedia.current.video[
        videoId
      ].babylonScene.babylonShaderController.swapPostProcessEffects(effectType);

      await fgLowerVideoController.handleVideoEffect(
        "postProcess",
        streamEffects,
        undefined,
        undefined,
        effectType
      );
    }

    setEffectsDisabled(false);
    setCloseHoldToggle(true);
  };

  return (
    <FgButton
      className='flex items-center justify-center min-w-10 w-10 aspect-square'
      clickFunction={clickFunction}
      contentFunction={() => (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 100 100'
          style={{
            width: "95%",
            height: "95%",
            fill: "white",
            transform: streamEffects ? "rotate(30deg)" : "rotate(0deg)",
            transition: "transform 0.2s linear",
          }}
        >
          <path
            d='M 48.69375,35.75 H 14.85 Q 18.05625,27.55625 24.64688,21.67812 31.2375,15.8 39.7875,13.425 l 10.925,18.7625 q 0.7125,1.1875 0,2.375 Q 50,35.75 48.69375,35.75 Z m 17.1,5.9375 q -0.7125,1.1875 -2.01875,1.1875 -1.30625,0 -2.01875,-1.1875 L 44.775,12.475 Q 46.08125,12.2375 47.3875,12.11875 48.69375,12 50,12 57.8375,12 64.60625,14.96875 71.375,17.9375 76.6,22.925 Z M 86.8125,59.5 H 65.08125 q -1.30625,0 -2.07812,-1.1875 -0.77188,-1.1875 -0.0594,-2.375 L 79.92498,26.725 q 3.8,4.86875 5.9375,10.74687 2.1375,5.87813 2.1375,12.52813 0,2.49375 -0.29687,4.80937 Q 87.40623,57.125 86.81248,59.5 Z m -26.6,27.075 -10.80625,-18.7625 q -0.7125,-1.1875 0.0594,-2.375 Q 50.23752,64.25 51.54377,64.25 H 85.15 Q 81.94375,72.44375 75.35313,78.32187 68.7625,84.2 60.2125,86.575 Z M 50,88 Q 42.1625,88 35.39375,85.03125 28.625,82.0625 23.4,77.075 L 34.20625,58.3125 q 0.7125,-1.1875 2.01875,-1.1875 1.30625,0 2.01875,1.1875 L 55.225,87.525 Q 53.91875,87.7625 52.67188,87.88125 51.425,88 50,88 Z M 20.075,73.275 Q 16.275,68.40625 14.1375,62.52812 12,56.65 12,50 12,47.50625 12.29688,45.19062 12.59375,42.875 13.1875,40.5 h 21.73125 q 1.30625,0 2.07813,1.1875 0.77187,1.1875 0.0594,2.375 z M 50,50 Z m 0,47.5 q 9.7375,0 18.40625,-3.74063 Q 77.075,90.01875 83.54688,83.54687 90.01875,77.075 93.75938,68.40625 97.5,59.7375 97.5,50 97.5,40.14375 93.75938,31.53437 90.01875,22.925 83.54688,16.45312 77.075,9.98125 68.40625,6.24062 59.7375,2.5 50,2.5 40.14375,2.5 31.53438,6.24062 22.925,9.98125 16.45313,16.45312 9.98125,22.925 6.24063,31.53437 2.5,40.14375 2.5,50 2.5,59.7375 6.24063,68.40625 9.98125,77.075 16.45313,83.54687 22.925,90.01875 31.53438,93.75937 40.14375,97.5 50,97.5 Z'
            strokeWidth={0.11875}
          />
        </svg>
      )}
      holdFunction={holdFunction}
      holdContent={
        <div
          ref={postProcessEffectsContainerRef}
          className='pl-3 pr-1 overflow-y-auto small-vertical-scroll-bar max-h-60 mb-4 grid grid-cols-3 w-max gap-x-2 gap-y-2 py-3 border-3 border-fg-black-45 border-opacity-90 bg-fg-black-10 bg-opacity-90 shadow-lg rounded-md'
        >
          {Object.entries(postProcessEffectsChoices).map(
            ([postProcessEffect, choice]) => (
              <FgButton
                key={postProcessEffect}
                contentFunction={() => (
                  <div
                    className={`${
                      postProcessEffect === effectsStyles.style
                        ? "border-fg-secondary border-3 border-opacity-100"
                        : ""
                    } border-white flex items-center justify-center w-16 min-w-16 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
                    onClick={(event) => {
                      holdFunction(event as unknown as PointerEvent);
                    }}
                    data-camera-post-process-effects-button-value={
                      postProcessEffect
                    }
                  >
                    <FgImageElement
                      src={choice.image}
                      srcLoading={choice.imageSmall}
                      alt={postProcessEffect}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                      data-camera-post-process-effects-button-value={
                        postProcessEffect
                      }
                    />
                  </div>
                )}
                hoverContent={<FgHoverContentStandard content={choice.label} />}
                scrollingContainerRef={postProcessEffectsContainerRef}
                options={{
                  hoverZValue: 999999999999999,
                  hoverTimeoutDuration: 750,
                }}
              />
            )
          )}
        </div>
      }
      hoverContent={<FgHoverContentStandard content='Camera effects' />}
      closeHoldToggle={closeHoldToggle}
      setCloseHoldToggle={setCloseHoldToggle}
      scrollingContainerRef={scrollingContainerRef}
      options={{
        hoverTimeoutDuration: 750,
        disabled: effectsDisabled,
        holdKind: "toggle",
      }}
    />
  );
}
