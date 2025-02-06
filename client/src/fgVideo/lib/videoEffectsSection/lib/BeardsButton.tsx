import React, { useRef, useState } from "react";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import { BeardsEffectTypes } from "../../../../context/effectsContext/typeConstant";
import FgButton from "../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../fgElements/fgSVG/FgSVG";
import FgImageElement from "../../../../fgElements/fgImageElement/FgImageElement";
import FgHoverContentStandard from "../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import FgLowerVideoController from "../../fgLowerVideoControls/lib/FgLowerVideoController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const classicalCurlyBeard_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/beards/classicalCurlyBeard/classicalCurlyBeard_512x512.png";
const classicalCurlyBeard_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/beards/classicalCurlyBeard/classicalCurlyBeard_32x32.png";
const classicalCurlyBeardIcon =
  nginxAssetSeverBaseUrl +
  "svgs/visualEffects/beards/classicalCurlyBeard/classicalCurlyBeardIcon.svg";
const classicalCurlyBeardOffIcon =
  nginxAssetSeverBaseUrl +
  "svgs/visualEffects/beards/classicalCurlyBeard/classicalCurlyBeardOffIcon.svg";
const chinBeard_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/beards/chinBeard/chinBeard_512x512.png";
const chinBeard_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/beards/chinBeard/chinBeard_32x32.png";
const chinBeard_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/beards/chinBeard/chinBeard_off_512x512.png";
const chinBeard_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/beards/chinBeard/chinBeard_off_32x32.png";
const fullBeard_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/beards/fullBeard/fullBeard_512x512.png";
const fullBeard_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/beards/fullBeard/fullBeard_32x32.png";
const fullBeard_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/beards/fullBeard/fullBeard_off_512x512.png";
const fullBeard_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/beards/fullBeard/fullBeard_off_32x32.png";

const beardsLabels: {
  [beardsEffectType in BeardsEffectTypes]: string;
} = {
  classicalCurlyBeard: "Classical curly",
  chinBeard: "Chin",
  fullBeard: "Full",
};

export default function BeardsButton({
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
  const { userEffectsStyles, userStreamEffects } = useEffectsContext();

  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const [_, setRerender] = useState(0);
  const beardsContainerRef = useRef<HTMLDivElement>(null);

  const streamEffects = userStreamEffects.current.video[videoId].video.beards;
  const effectsStyles = userEffectsStyles.current.video[videoId].video.beards;

  const beardsEffects: {
    [key in BeardsEffectTypes]: {
      image: string;
      imageSmall: string;
      icon?: string;
      iconOff?: string;
      imageOff?: string;
      imageOffSmall?: string;
      flipped: boolean;
      bgColor: "white" | "black";
    };
  } = {
    classicalCurlyBeard: {
      image: classicalCurlyBeard_512x512,
      imageSmall: classicalCurlyBeard_32x32,
      icon: classicalCurlyBeardIcon,
      iconOff: classicalCurlyBeardOffIcon,
      flipped: true,
      bgColor: "black",
    },
    chinBeard: {
      image: chinBeard_512x512,
      imageSmall: chinBeard_32x32,
      imageOff: chinBeard_off_512x512,
      imageOffSmall: chinBeard_off_32x32,
      flipped: false,
      bgColor: "black",
    },
    fullBeard: {
      image: fullBeard_512x512,
      imageSmall: fullBeard_32x32,
      imageOff: fullBeard_off_512x512,
      imageOffSmall: fullBeard_off_32x32,
      flipped: false,
      bgColor: "white",
    },
  };

  const clickFunction = async () => {
    setEffectsDisabled(true);
    setRerender((prev) => prev + 1);

    await fgLowerVideoController.handleVideoEffect("beards", false);

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (!effectsStyles || !target || !target.dataset.videoEffectsButtonValue) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .videoEffectsButtonValue as BeardsEffectTypes;
    if (
      effectType in beardsEffects &&
      (effectsStyles.style !== effectType || !streamEffects)
    ) {
      effectsStyles.style = effectType;

      await fgLowerVideoController.handleVideoEffect("beards", streamEffects);
    }

    setEffectsDisabled(false);
    setCloseHoldToggle(true);
  };

  return (
    <FgButton
      clickFunction={clickFunction}
      holdFunction={holdFunction}
      contentFunction={() => {
        if (!effectsStyles) {
          return;
        }

        if (beardsEffects[effectsStyles.style].icon) {
          const iconSrc =
            beardsEffects[effectsStyles.style][
              streamEffects ? "iconOff" : "icon"
            ];

          if (iconSrc) {
            return (
              <FgSVG
                src={iconSrc}
                attributes={[
                  { key: "width", value: "95%" },
                  { key: "height", value: "95%" },
                ]}
                data-video-effects-button-value={effectsStyles.style}
              />
            );
          }
        } else {
          const imageSrc =
            beardsEffects[effectsStyles.style][
              streamEffects ? "imageOff" : "image"
            ];

          const imageLoadingSrc =
            beardsEffects[effectsStyles.style][
              streamEffects ? "imageOffSmall" : "imageSmall"
            ];

          if (imageSrc) {
            return (
              <FgImageElement
                src={imageSrc}
                srcLoading={imageLoadingSrc}
                alt={effectsStyles.style}
                style={{ width: "90%", height: "90%" }}
                data-video-effects-button-value={effectsStyles.style}
              />
            );
          }
        }
      }}
      holdContent={
        <div
          ref={beardsContainerRef}
          className='grid border overflow-y-auto small-vertical-scroll-bar max-h-48 mb-4 grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'
        >
          {Object.entries(beardsEffects).map(([beard, effect]) => (
            <FgButton
              key={beard}
              contentFunction={() => (
                <div
                  className={`${
                    beard === effectsStyles.style
                      ? "border-fg-secondary border-3 border-opacity-100"
                      : ""
                  } ${effect.flipped && "scale-x-[-1]"} ${
                    effect.bgColor === "white" && "bg-white border-fg-black-35"
                  } ${
                    effect.bgColor === "black" && "border-white"
                  } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
                  onClick={(event) => {
                    holdFunction(event as unknown as PointerEvent);
                  }}
                  data-video-effects-button-value={beard}
                >
                  <FgImageElement
                    src={effect.image}
                    srcLoading={effect.imageSmall}
                    alt={beard}
                    style={{ width: "2.75rem", height: "2.75rem" }}
                    data-video-effects-button-value={beard}
                  />
                </div>
              )}
              hoverContent={
                <FgHoverContentStandard
                  content={beardsLabels[beard as BeardsEffectTypes]}
                />
              }
              scrollingContainerRef={beardsContainerRef}
              options={{
                hoverZValue: 999999999999999,
                hoverTimeoutDuration: 750,
              }}
            />
          ))}
        </div>
      }
      hoverContent={<FgHoverContentStandard content='Beards' />}
      closeHoldToggle={closeHoldToggle}
      setCloseHoldToggle={setCloseHoldToggle}
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center min-w-10 w-10 aspect-square'
      options={{
        defaultDataValue: effectsStyles?.style,
        hoverTimeoutDuration: 750,
        disabled: effectsDisabled,
        holdKind: "toggle",
      }}
    />
  );
}
