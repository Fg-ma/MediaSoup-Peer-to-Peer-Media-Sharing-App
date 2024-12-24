import React, { useRef, useState } from "react";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import {
  HatsEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../../context/effectsContext/typeConstant";
import FgButton from "../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../fgElements/fgSVG/FgSVG";
import FgImage from "../../../../fgElements/fgImage/FgImage";
import FgHoverContentStandard from "../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";

import AsianConicalHat_512x512 from "../../../../../public/2DAssets/hats/AsianConicalHat/AsianConicalHat_512x512.png";
import AsianConicalHat_32x32 from "../../../../../public/2DAssets/hats/AsianConicalHat/AsianConicalHat_32x32.png";
import AsianConicalHat_off_512x512 from "../../../../../public/2DAssets/hats/AsianConicalHat/AsianConicalHat_off_512x512.png";
import AsianConicalHat_off_32x32 from "../../../../../public/2DAssets/hats/AsianConicalHat/AsianConicalHat_off_32x32.png";
import aviatorHelmet_512x512 from "../../../../../public/2DAssets/hats/aviatorHelmet/aviatorHelmet_512x512.png";
import aviatorHelmet_32x32 from "../../../../../public/2DAssets/hats/aviatorHelmet/aviatorHelmet_32x32.png";
import aviatorHelmet_off_512x512 from "../../../../../public/2DAssets/hats/aviatorHelmet/aviatorHelmet_off_512x512.png";
import aviatorHelmet_off_32x32 from "../../../../../public/2DAssets/hats/aviatorHelmet/aviatorHelmet_off_32x32.png";
import bicornHat_512x512 from "../../../../../public/2DAssets/hats/bicornHat/bicornHat_512x512.png";
import bicornHat_32x32 from "../../../../../public/2DAssets/hats/bicornHat/bicornHat_32x32.png";
import bicornHat_off_512x512 from "../../../../../public/2DAssets/hats/bicornHat/bicornHat_off_512x512.png";
import bicornHat_off_32x32 from "../../../../../public/2DAssets/hats/bicornHat/bicornHat_off_32x32.png";
import bicycleHelmet_512x512 from "../../../../../public/2DAssets/hats/bicycleHelmet/bicycleHelmet_512x512.png";
import bicycleHelmet_32x32 from "../../../../../public/2DAssets/hats/bicycleHelmet/bicycleHelmet_32x32.png";
import bicycleHelmet_off_512x512 from "../../../../../public/2DAssets/hats/bicycleHelmet/bicycleHelmet_off_512x512.png";
import bicycleHelmet_off_32x32 from "../../../../../public/2DAssets/hats/bicycleHelmet/bicycleHelmet_off_32x32.png";
import captainsHat_512x512 from "../../../../../public/2DAssets/hats/captainsHat/captainsHat_512x512.png";
import captainsHat_32x32 from "../../../../../public/2DAssets/hats/captainsHat/captainsHat_32x32.png";
import captainsHat_off_512x512 from "../../../../../public/2DAssets/hats/captainsHat/captainsHat_off_512x512.png";
import captainsHat_off_32x32 from "../../../../../public/2DAssets/hats/captainsHat/captainsHat_off_32x32.png";
import chefHat_512x512 from "../../../../../public/2DAssets/hats/chefHat/chefHat_512x512.png";
import chefHat_32x32 from "../../../../../public/2DAssets/hats/chefHat/chefHat_32x32.png";
import chefHat_off_512x512 from "../../../../../public/2DAssets/hats/chefHat/chefHat_off_512x512.png";
import chefHat_off_32x32 from "../../../../../public/2DAssets/hats/chefHat/chefHat_off_32x32.png";
import chickenHat_512x512 from "../../../../../public/2DAssets/hats/chickenHat/chickenHat_512x512.png";
import chickenHat_32x32 from "../../../../../public/2DAssets/hats/chickenHat/chickenHat_32x32.png";
import chickenHat_off_512x512 from "../../../../../public/2DAssets/hats/chickenHat/chickenHat_off_512x512.png";
import chickenHat_off_32x32 from "../../../../../public/2DAssets/hats/chickenHat/chickenHat_off_32x32.png";
import deadManHat_512x512 from "../../../../../public/2DAssets/hats/deadManHat/deadManHat_512x512.png";
import deadManHat_32x32 from "../../../../../public/2DAssets/hats/deadManHat/deadManHat_32x32.png";
import deadManHat_off_512x512 from "../../../../../public/2DAssets/hats/deadManHat/deadManHat_off_512x512.png";
import deadManHat_off_32x32 from "../../../../../public/2DAssets/hats/deadManHat/deadManHat_off_32x32.png";
import dogEars_512x512 from "../../../../../public/2DAssets/hats/dogEars/dogEars_512x512.png";
import dogEars_32x32 from "../../../../../public/2DAssets/hats/dogEars/dogEars_32x32.png";
import dogEarsIcon from "../../../../../public/svgs/visualEffects/hats/dogEars/dogEarsIcon.svg";
import dogEarsOffIcon from "../../../../../public/svgs/visualEffects/hats/dogEars/dogEarsOffIcon.svg";
import flatCap_512x512 from "../../../../../public/2DAssets/hats/flatCap/flatCap_512x512.png";
import flatCap_32x32 from "../../../../../public/2DAssets/hats/flatCap/flatCap_32x32.png";
import flatCap_off_512x512 from "../../../../../public/2DAssets/hats/flatCap/flatCap_off_512x512.png";
import flatCap_off_32x32 from "../../../../../public/2DAssets/hats/flatCap/flatCap_off_32x32.png";
import hardHat_512x512 from "../../../../../public/2DAssets/hats/hardHat/hardHat_512x512.png";
import hardHat_32x32 from "../../../../../public/2DAssets/hats/hardHat/hardHat_32x32.png";
import hardHat_off_512x512 from "../../../../../public/2DAssets/hats/hardHat/hardHat_off_512x512.png";
import hardHat_off_32x32 from "../../../../../public/2DAssets/hats/hardHat/hardHat_off_32x32.png";
import hopliteHelmet_512x512 from "../../../../../public/2DAssets/hats/hopliteHelmet/hopliteHelmet_512x512.png";
import hopliteHelmet_32x32 from "../../../../../public/2DAssets/hats/hopliteHelmet/hopliteHelmet_32x32.png";
import hopliteHelmet_off_512x512 from "../../../../../public/2DAssets/hats/hopliteHelmet/hopliteHelmet_off_512x512.png";
import hopliteHelmet_off_32x32 from "../../../../../public/2DAssets/hats/hopliteHelmet/hopliteHelmet_off_32x32.png";
import militaryHat_512x512 from "../../../../../public/2DAssets/hats/militaryHat/militaryHat_512x512.png";
import militaryHat_32x32 from "../../../../../public/2DAssets/hats/militaryHat/militaryHat_32x32.png";
import militaryHat_off_512x512 from "../../../../../public/2DAssets/hats/militaryHat/militaryHat_off_512x512.png";
import militaryHat_off_32x32 from "../../../../../public/2DAssets/hats/militaryHat/militaryHat_off_32x32.png";
import rabbitEars_512x512 from "../../../../../public/2DAssets/hats/rabbitEars/rabbitEars_512x512.png";
import rabbitEars_32x32 from "../../../../../public/2DAssets/hats/rabbitEars/rabbitEars_32x32.png";
import rabbitEars_off_512x512 from "../../../../../public/2DAssets/hats/rabbitEars/rabbitEars_off_512x512.png";
import rabbitEars_off_32x32 from "../../../../../public/2DAssets/hats/rabbitEars/rabbitEars_off_32x32.png";
import santaHat_512x512 from "../../../../../public/2DAssets/hats/santaHat/santaHat_512x512.png";
import santaHat_32x32 from "../../../../../public/2DAssets/hats/santaHat/santaHat_32x32.png";
import santaHat_off_512x512 from "../../../../../public/2DAssets/hats/santaHat/santaHat_off_512x512.png";
import santaHat_off_32x32 from "../../../../../public/2DAssets/hats/santaHat/santaHat_off_32x32.png";
import seamanHat_512x512 from "../../../../../public/2DAssets/hats/seamanHat/seamanHat_512x512.png";
import seamanHat_32x32 from "../../../../../public/2DAssets/hats/seamanHat/seamanHat_32x32.png";
import seamanHat_off_512x512 from "../../../../../public/2DAssets/hats/seamanHat/seamanHat_off_512x512.png";
import seamanHat_off_32x32 from "../../../../../public/2DAssets/hats/seamanHat/seamanHat_off_32x32.png";
import stylishHat_512x512 from "../../../../../public/2DAssets/hats/stylishHat/stylishHat_512x512.png";
import stylishHat_32x32 from "../../../../../public/2DAssets/hats/stylishHat/stylishHat_32x32.png";
import stylishHat_off_512x512 from "../../../../../public/2DAssets/hats/stylishHat/stylishHat_off_512x512.png";
import stylishHat_off_32x32 from "../../../../../public/2DAssets/hats/stylishHat/stylishHat_off_32x32.png";
import ushankaHat_512x512 from "../../../../../public/2DAssets/hats/ushankaHat/ushankaHat_512x512.png";
import ushankaHat_32x32 from "../../../../../public/2DAssets/hats/ushankaHat/ushankaHat_32x32.png";
import ushankaHat_off_512x512 from "../../../../../public/2DAssets/hats/ushankaHat/ushankaHat_off_512x512.png";
import ushankaHat_off_32x32 from "../../../../../public/2DAssets/hats/ushankaHat/ushankaHat_off_32x32.png";
import vikingHelmet_512x512 from "../../../../../public/2DAssets/hats/vikingHelmet/vikingHelmet_512x512.png";
import vikingHelmet_32x32 from "../../../../../public/2DAssets/hats/vikingHelmet/vikingHelmet_32x32.png";
import vikingHelmet_off_512x512 from "../../../../../public/2DAssets/hats/vikingHelmet/vikingHelmet_off_512x512.png";
import vikingHelmet_off_32x32 from "../../../../../public/2DAssets/hats/vikingHelmet/vikingHelmet_off_32x32.png";

const hatsLabels: {
  [hatsEffectType in HatsEffectTypes]: string;
} = {
  AsianConicalHat: "Asian conical",
  aviatorHelmet: "Aviator helmet",
  bicornHat: "Bicorn",
  bicycleHelmet: "Bicycle helmet",
  captainsHat: "Captain",
  chefHat: "Chef",
  chickenHat: "Chicken",
  deadManHat: "Dead man",
  dogEars: "Dog ears",
  flatCap: "Flat cap",
  hardHat: "Hard hat",
  hopliteHelmet: "Hoplite helmet",
  militaryHat: "Military",
  rabbitEars: "Rabbit ears",
  santaHat: "Santa",
  seamanHat: "Seaman",
  stylishHat: "Stylish",
  ushankaHat: "Ushanka",
  vikingHelmet: "Viking Helmet",
};

export default function HatsButton({
  username,
  instance,
  type,
  visualMediaId,
  isUser,
  handleVisualEffectChange,
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
}: {
  username: string;
  instance: string;
  type: "camera";
  visualMediaId: string;
  isUser: boolean;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const {
    userEffectsStyles,
    remoteEffectsStyles,
    userStreamEffects,
    remoteStreamEffects,
  } = useEffectsContext();

  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const [_, setRerender] = useState(0);
  const hatsContainerRef = useRef<HTMLDivElement>(null);

  const streamEffects = isUser
    ? userStreamEffects.current[type][visualMediaId].hats
    : remoteStreamEffects.current[username][instance][type][visualMediaId].hats;
  const effectsStyles = isUser
    ? userEffectsStyles.current[type][visualMediaId].hats
    : remoteEffectsStyles.current[username][instance][type][visualMediaId].hats;

  const hatsEffects: {
    [key in HatsEffectTypes]: {
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
    AsianConicalHat: {
      image: AsianConicalHat_512x512,
      imageSmall: AsianConicalHat_32x32,
      imageOff: AsianConicalHat_off_512x512,
      imageOffSmall: AsianConicalHat_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    aviatorHelmet: {
      image: aviatorHelmet_512x512,
      imageSmall: aviatorHelmet_32x32,
      imageOff: aviatorHelmet_off_512x512,
      imageOffSmall: aviatorHelmet_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    bicornHat: {
      image: bicornHat_512x512,
      imageSmall: bicornHat_32x32,
      imageOff: bicornHat_off_512x512,
      imageOffSmall: bicornHat_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    bicycleHelmet: {
      image: bicycleHelmet_512x512,
      imageSmall: bicycleHelmet_32x32,
      imageOff: bicycleHelmet_off_512x512,
      imageOffSmall: bicycleHelmet_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    captainsHat: {
      image: captainsHat_512x512,
      imageSmall: captainsHat_32x32,
      imageOff: captainsHat_off_512x512,
      imageOffSmall: captainsHat_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    chefHat: {
      image: chefHat_512x512,
      imageSmall: chefHat_32x32,
      imageOff: chefHat_off_512x512,
      imageOffSmall: chefHat_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    chickenHat: {
      image: chickenHat_512x512,
      imageSmall: chickenHat_32x32,
      imageOff: chickenHat_off_512x512,
      imageOffSmall: chickenHat_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    deadManHat: {
      image: deadManHat_512x512,
      imageSmall: deadManHat_32x32,
      imageOff: deadManHat_off_512x512,
      imageOffSmall: deadManHat_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    dogEars: {
      image: dogEars_512x512,
      imageSmall: dogEars_32x32,
      icon: dogEarsIcon,
      iconOff: dogEarsOffIcon,
      flipped: true,
      bgColor: "white",
    },
    flatCap: {
      image: flatCap_512x512,
      imageSmall: flatCap_32x32,
      imageOff: flatCap_off_512x512,
      imageOffSmall: flatCap_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    hardHat: {
      image: hardHat_512x512,
      imageSmall: hardHat_32x32,
      imageOff: hardHat_off_512x512,
      imageOffSmall: hardHat_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    hopliteHelmet: {
      image: hopliteHelmet_512x512,
      imageSmall: hopliteHelmet_32x32,
      imageOff: hopliteHelmet_off_512x512,
      imageOffSmall: hopliteHelmet_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    militaryHat: {
      image: militaryHat_512x512,
      imageSmall: militaryHat_32x32,
      imageOff: militaryHat_off_512x512,
      imageOffSmall: militaryHat_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    rabbitEars: {
      image: rabbitEars_512x512,
      imageSmall: rabbitEars_32x32,
      imageOff: rabbitEars_off_512x512,
      imageOffSmall: rabbitEars_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    santaHat: {
      image: santaHat_512x512,
      imageSmall: santaHat_32x32,
      imageOff: santaHat_off_512x512,
      imageOffSmall: santaHat_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    seamanHat: {
      image: seamanHat_512x512,
      imageSmall: seamanHat_32x32,
      imageOff: seamanHat_off_512x512,
      imageOffSmall: seamanHat_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    stylishHat: {
      image: stylishHat_512x512,
      imageSmall: stylishHat_32x32,
      imageOff: stylishHat_off_512x512,
      imageOffSmall: stylishHat_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    ushankaHat: {
      image: ushankaHat_512x512,
      imageSmall: ushankaHat_32x32,
      imageOff: ushankaHat_off_512x512,
      imageOffSmall: ushankaHat_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    vikingHelmet: {
      image: vikingHelmet_512x512,
      imageSmall: vikingHelmet_32x32,
      imageOff: vikingHelmet_off_512x512,
      imageOffSmall: vikingHelmet_off_32x32,
      flipped: false,
      bgColor: "white",
    },
  };

  const clickFunction = async () => {
    setEffectsDisabled(true);
    setRerender((prev) => prev + 1);

    await handleVisualEffectChange("hats");

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (!effectsStyles || !target || !target.dataset.visualEffectsButtonValue) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .visualEffectsButtonValue as HatsEffectTypes;
    if (
      effectType in hatsEffects &&
      (effectsStyles.style !== effectType || !streamEffects)
    ) {
      if (isUser) {
        if (userEffectsStyles.current[type][visualMediaId].hats) {
          userEffectsStyles.current[type][visualMediaId].hats.style =
            effectType;
        }
      } else {
        if (
          remoteEffectsStyles.current[username][instance][type][visualMediaId]
            .hats
        ) {
          remoteEffectsStyles.current[username][instance][type][
            visualMediaId
          ].hats.style = effectType;
        }
      }

      await handleVisualEffectChange("hats", streamEffects);
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

        if (hatsEffects[effectsStyles.style].icon) {
          const iconSrc =
            hatsEffects[effectsStyles.style][
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
                data-visual-effects-button-value={effectsStyles.style}
              />
            );
          }
        } else {
          const imageSrc =
            hatsEffects[effectsStyles.style][
              streamEffects ? "imageOff" : "image"
            ];

          const imageLoadingSrc =
            hatsEffects[effectsStyles.style][
              streamEffects ? "imageOffSmall" : "imageSmall"
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
      holdContent={
        <div
          ref={hatsContainerRef}
          className='overflow-y-auto small-vertical-scroll-bar max-h-48 mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'
        >
          {Object.entries(hatsEffects).map(([hat, effect]) => (
            <FgButton
              key={hat}
              contentFunction={() => (
                <div
                  className={`${
                    hat === effectsStyles.style
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
                  data-visual-effects-button-value={hat}
                >
                  <FgImage
                    src={effect.image}
                    srcLoading={effect.imageSmall}
                    alt={hat}
                    style={{ width: "2.75rem", height: "2.75rem" }}
                    data-visual-effects-button-value={hat}
                  />
                </div>
              )}
              hoverContent={
                <FgHoverContentStandard
                  content={hatsLabels[hat as HatsEffectTypes]}
                />
              }
              scrollingContainerRef={hatsContainerRef}
              options={{
                hoverZValue: 999999999999999,
                hoverTimeoutDuration: 750,
              }}
            />
          ))}
        </div>
      }
      hoverContent={<FgHoverContentStandard content='Hats' />}
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
