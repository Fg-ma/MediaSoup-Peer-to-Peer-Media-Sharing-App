import React, { useRef, useState } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import FgImage from "../../fgImage/FgImage";
import {
  useCurrentEffectsStylesContext,
  BeardsEffectTypes,
  assetSizePositionMap,
} from "../../context/CurrentEffectsStylesContext";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";

import classicalCurlyBeard_512x512 from "../../../public/2DAssets/beards/classicalCurlyBeard/classicalCurlyBeard_512x512.png";
import classicalCurlyBeard_32x32 from "../../../public/2DAssets/beards/classicalCurlyBeard/classicalCurlyBeard_32x32.png";
import classicalCurlyBeardIcon from "../../../public/svgs/visualEffects/beards/classicalCurlyBeard/classicalCurlyBeardIcon.svg";
import classicalCurlyBeardOffIcon from "../../../public/svgs/visualEffects/beards/classicalCurlyBeard/classicalCurlyBeardOffIcon.svg";
import threeDim_classicalCurlyBeardIcon from "../../../public/svgs/visualEffects/beards/classicalCurlyBeard/threeDim_classicalCurlyBeardIcon.svg";
import threeDim_classicalCurlyBeardOffIcon from "../../../public/svgs/visualEffects/beards/classicalCurlyBeard/threeDim_classicalCurlyBeardOffIcon.svg";
import chinBeard_512x512 from "../../../public/2DAssets/beards/chinBeard/chinBeard_512x512.png";
import chinBeard_32x32 from "../../../public/2DAssets/beards/chinBeard/chinBeard_32x32.png";
import chinBeard_off_512x512 from "../../../public/2DAssets/beards/chinBeard/chinBeard_off_512x512.png";
import chinBeard_off_32x32 from "../../../public/2DAssets/beards/chinBeard/chinBeard_off_32x32.png";
import chinBeard_threeDim_512x512 from "../../../public/2DAssets/beards/chinBeard/chinBeard_threeDim_512x512.png";
import chinBeard_threeDim_32x32 from "../../../public/2DAssets/beards/chinBeard/chinBeard_threeDim_32x32.png";
import fullBeard_512x512 from "../../../public/2DAssets/beards/fullBeard/fullBeard_512x512.png";
import fullBeard_32x32 from "../../../public/2DAssets/beards/fullBeard/fullBeard_32x32.png";
import fullBeard_off_512x512 from "../../../public/2DAssets/beards/fullBeard/fullBeard_off_512x512.png";
import fullBeard_off_32x32 from "../../../public/2DAssets/beards/fullBeard/fullBeard_off_32x32.png";
import fullBeard_threeDim_512x512 from "../../../public/2DAssets/beards/fullBeard/fullBeard_threeDim_512x512.png";
import fullBeard_threeDim_32x32 from "../../../public/2DAssets/beards/fullBeard/fullBeard_threeDim_32x32.png";

const beardsLabels: {
  [beardsEffectType in BeardsEffectTypes]: string;
} = {
  classicalCurlyBeard: "Classical curly",
  chinBeard: "Chin",
  fullBeard: "Full",
};

export default function BeardsButton({
  username,
  instance,
  type,
  videoId,
  isUser,
  handleVisualEffectChange,
  effectsDisabled,
  setEffectsDisabled,
}: {
  username: string;
  instance: string;
  type: "camera";
  videoId: string;
  isUser: boolean;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { currentEffectsStyles, remoteCurrentEffectsStyles } =
    useCurrentEffectsStylesContext();
  const { userStreamEffects, remoteStreamEffects } = useStreamsContext();

  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const [rerender, setRerender] = useState(0);
  const beardsContainerRef = useRef<HTMLDivElement>(null);

  const streamEffects = isUser
    ? userStreamEffects.current[type][videoId].beards
    : remoteStreamEffects.current[username][instance][type][videoId].beards;
  const effectsStyles = isUser
    ? currentEffectsStyles.current[type][videoId].beards
    : remoteCurrentEffectsStyles.current[username][instance][type][videoId]
        .beards;

  const beardsEffects: {
    [key in BeardsEffectTypes]: {
      image: string;
      imageSmall: string;
      icon?: string;
      iconOff?: string;
      imageOff?: string;
      imageOffSmall?: string;
      iconThreeDim?: string;
      imageThreeDim?: string;
      imageThreeDimSmall?: string;
      iconThreeDimOff?: string;
      imageThreeDimOff?: string;
      imageThreeDimOffSmall?: string;
      flipped: boolean;
      bgColor: "white" | "black";
    };
  } = {
    classicalCurlyBeard: {
      image: classicalCurlyBeard_512x512,
      imageSmall: classicalCurlyBeard_32x32,
      icon: classicalCurlyBeardIcon,
      iconOff: classicalCurlyBeardOffIcon,
      iconThreeDim: threeDim_classicalCurlyBeardIcon,
      iconThreeDimOff: threeDim_classicalCurlyBeardOffIcon,
      flipped: true,
      bgColor: "black",
    },
    chinBeard: {
      image: chinBeard_512x512,
      imageSmall: chinBeard_32x32,
      imageOff: chinBeard_off_512x512,
      imageOffSmall: chinBeard_off_32x32,
      imageThreeDim: chinBeard_threeDim_512x512,
      imageThreeDimSmall: chinBeard_threeDim_32x32,
      imageThreeDimOff: chinBeard_512x512,
      imageThreeDimOffSmall: chinBeard_32x32,
      flipped: false,
      bgColor: "black",
    },
    fullBeard: {
      image: fullBeard_512x512,
      imageSmall: fullBeard_32x32,
      imageOff: fullBeard_off_512x512,
      imageOffSmall: fullBeard_off_32x32,
      imageThreeDim: fullBeard_threeDim_512x512,
      imageThreeDimSmall: fullBeard_threeDim_32x32,
      imageThreeDimOff: fullBeard_512x512,
      imageThreeDimOffSmall: fullBeard_32x32,
      flipped: false,
      bgColor: "white",
    },
  };

  const clickFunction = async () => {
    setEffectsDisabled(true);
    setRerender((prev) => prev + 1);

    await handleVisualEffectChange("beards");

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: React.MouseEvent<Element, MouseEvent>) => {
    const target = event.target as HTMLElement;
    if (!effectsStyles || !target || !target.dataset.visualEffectsButtonValue) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .visualEffectsButtonValue as BeardsEffectTypes;
    if (
      effectType in beardsEffects &&
      (effectsStyles.style !== effectType || !streamEffects)
    ) {
      if (isUser) {
        if (currentEffectsStyles.current[type][videoId].beards) {
          currentEffectsStyles.current[type][videoId].beards.style = effectType;
          currentEffectsStyles.current[type][videoId].beards.transforms =
            assetSizePositionMap.beards[effectType];
        }
      } else {
        if (
          remoteCurrentEffectsStyles.current[username][instance][type][videoId]
            .beards
        ) {
          remoteCurrentEffectsStyles.current[username][instance][type][
            videoId
          ].beards.style = effectType;
          remoteCurrentEffectsStyles.current[username][instance][type][
            videoId
          ].beards.transforms = assetSizePositionMap.beards[effectType];
        }
      }

      await handleVisualEffectChange(
        "beards",
        isUser
          ? userStreamEffects.current[type][videoId].beards
          : remoteStreamEffects.current[username][instance][type][videoId]
              .beards
      );
    }

    setEffectsDisabled(false);
    setCloseHoldToggle(true);
  };

  const doubleClickFunction = async () => {
    if (!effectsStyles) {
      return;
    }

    setEffectsDisabled(true);

    effectsStyles.threeDim = !effectsStyles.threeDim;

    setRerender((prev) => prev + 1);

    await handleVisualEffectChange("beards", streamEffects);

    setEffectsDisabled(false);
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
              effectsStyles.threeDim
                ? streamEffects
                  ? "iconThreeDimOff"
                  : "iconThreeDim"
                : streamEffects
                ? "iconOff"
                : "icon"
            ];

          if (iconSrc) {
            return (
              <FgSVG
                src={iconSrc}
                attributes={[
                  { key: "width", value: "95%" },
                  { key: "height", value: "95%" },
                ]}
                data-visual-effects-button-value={effectsStyles.style}
              />
            );
          }
        } else {
          const imageSrc =
            beardsEffects[effectsStyles.style][
              effectsStyles.threeDim
                ? streamEffects
                  ? "imageThreeDimOff"
                  : "imageThreeDim"
                : streamEffects
                ? "imageOff"
                : "image"
            ];

          const imageLoadingSrc =
            beardsEffects[effectsStyles.style][
              effectsStyles?.threeDim
                ? streamEffects
                  ? "imageThreeDimOffSmall"
                  : "imageThreeDimSmall"
                : streamEffects
                ? "imageOffSmall"
                : "imageSmall"
            ];

          if (imageSrc) {
            return (
              <FgImage
                src={imageSrc}
                srcLoading={imageLoadingSrc}
                alt={effectsStyles.style}
                style={{ width: "90%", height: "90%" }}
                data-visual-effects-button-value={effectsStyles.style}
              />
            );
          }
        }
      }}
      doubleClickFunction={doubleClickFunction}
      holdContent={
        <div
          ref={beardsContainerRef}
          className='overflow-y-auto smallScrollbar max-h-48 mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'
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
                  onClick={holdFunction}
                  data-visual-effects-button-value={beard}
                >
                  <FgImage
                    src={effect.image}
                    srcLoading={effect.imageSmall}
                    alt={beard}
                    style={{ width: "2.75rem", height: "2.75rem" }}
                    data-visual-effects-button-value={beard}
                  />
                </div>
              )}
              hoverContent={
                <div className='mb-2 w-max py-1 px-2 text-black font-K2D text-sm bg-white shadow-lg rounded-md relative bottom-0'>
                  {beardsLabels[beard as BeardsEffectTypes]}
                </div>
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
      hoverContent={
        <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
          Beards
        </div>
      }
      closeHoldToggle={closeHoldToggle}
      setCloseHoldToggle={setCloseHoldToggle}
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
