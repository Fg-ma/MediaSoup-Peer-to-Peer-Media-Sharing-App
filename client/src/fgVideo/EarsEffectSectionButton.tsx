import React from "react";
import HoldButton from "./HoldButton";
import {
  useCurrentEffectsStylesContext,
  EarsEffectTypes,
  earsWidthFactorMap,
} from "../context/CurrentEffectsStylesContext";
import dogEars from "../../public/2DAssets/ears/dogEars.png";
import dogEarsIcon from "../../public/svgs/ears/dogEarsIcon.svg";
import dogEarsOffIcon from "../../public/svgs/ears/dogEarsOffIcon.svg";
import { EffectTypes, useStreamsContext } from "../context/StreamsContext";

export default function EarsEffectSectionButton({
  handleEffectChange,
  type,
  videoId,
}: {
  handleEffectChange: (effect: EffectTypes, blockStateChange?: boolean) => void;
  type: "webcam" | "screen";
  videoId: string;
}) {
  const { currentEffectsStyles } = useCurrentEffectsStylesContext();
  const { userStreamEffects } = useStreamsContext();

  const earsEffects: {
    [key in EarsEffectTypes]: {
      image: string;
      icon: string;
      offIcon: string;
      flipped: boolean;
      bgColor: "white" | "black";
    };
  } = {
    dogEars: {
      image: dogEars,
      icon: dogEarsIcon,
      offIcon: dogEarsOffIcon,
      flipped: false,
      bgColor: "white",
    },
  };

  return (
    <HoldButton
      clickFunction={() => handleEffectChange("ears")}
      holdFunction={(event: React.MouseEvent<Element, MouseEvent>) => {
        const target = event.target as HTMLElement;
        if (target && target.dataset.value) {
          const effectType = target.dataset.value as EarsEffectTypes;
          if (
            effectType in earsEffects &&
            (currentEffectsStyles.current.ears.style !== effectType ||
              !userStreamEffects.current.ears[type]?.[videoId])
          ) {
            currentEffectsStyles.current.ears.style = effectType;
            currentEffectsStyles.current.ears.leftEarWidthFactor =
              earsWidthFactorMap[effectType].leftEarWidthFactor;
            currentEffectsStyles.current.ears.rightEarWidthFactor =
              earsWidthFactorMap[effectType].rightEarWidthFactor;
            handleEffectChange(
              "ears",
              userStreamEffects.current.ears[type]?.[videoId] ? true : false
            );
          }
        }
      }}
      contentFunction={() => {
        const iconSrc =
          earsEffects[currentEffectsStyles.current.ears.style][
            userStreamEffects.current.ears[type]?.[videoId] ? "offIcon" : "icon"
          ];

        return (
          <img
            src={iconSrc}
            alt='icon'
            style={{ width: "90%", height: "90%" }}
            data-value={currentEffectsStyles.current.ears.style}
          />
        );
      }}
      holdContent={
        <div className='mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'>
          {Object.entries(earsEffects).map(([ears, effect]) => (
            <div
              key={ears}
              className={`${effect.flipped && "scale-x-[-1]"} ${
                effect.bgColor === "white" && "bg-white border-fg-black-35"
              } ${
                effect.bgColor === "black" && "border-white"
              } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
              data-value={ears}
            >
              <img
                src={effect.image}
                alt={ears}
                style={{ width: "90%" }}
                data-value={ears}
              />
            </div>
          ))}
        </div>
      }
      styles={"flex items-center justify-center w-10 aspect-square"}
      defaultDataValue={currentEffectsStyles.current.ears.style}
    />
  );
}
