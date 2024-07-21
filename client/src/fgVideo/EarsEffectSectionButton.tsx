import React from "react";
import HoldButton from "./FgButton";
import {
  useCurrentEffectsStylesContext,
  EarsEffectTypes,
  earsWidthFactorMap,
} from "../context/CurrentEffectsStylesContext";
import dogEars from "../../public/2DAssets/ears/dogEars.png";
import dogEarsIcon from "../../public/svgs/ears/dogEarsIcon.svg";
import dogEarsOffIcon from "../../public/svgs/ears/dogEarsOffIcon.svg";
import threeDim_dogEarsIcon from "../../public/svgs/ears/threeDim_dogEarsIcon.svg";
import threeDim_dogEarsOffIcon from "../../public/svgs/ears/threeDim_dogEarsOffIcon.svg";
import { EffectTypes, useStreamsContext } from "../context/StreamsContext";

export default function EarsEffectSectionButton({
  handleEffectChange,
  type,
  videoId,
}: {
  handleEffectChange: (effect: EffectTypes) => void;
  type: "camera" | "screen";
  videoId: string;
}) {
  const { currentEffectsStyles } = useCurrentEffectsStylesContext();
  const { userStreamEffects } = useStreamsContext();

  const earsEffects: {
    [key in EarsEffectTypes]: {
      image: string;
      icon: string;
      offIcon: string;
      threeDimIcon: string;
      threeDimOffIcon: string;
      flipped: boolean;
      bgColor: "white" | "black";
    };
  } = {
    dogEars: {
      image: dogEars,
      icon: dogEarsIcon,
      offIcon: dogEarsOffIcon,
      threeDimIcon: threeDim_dogEarsIcon,
      threeDimOffIcon: threeDim_dogEarsOffIcon,
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
            (currentEffectsStyles.current[videoId].ears.style !== effectType ||
              !userStreamEffects.current.ears[type]?.[videoId])
          ) {
            currentEffectsStyles.current[videoId].ears.style = effectType;
            currentEffectsStyles.current[videoId].ears.leftEarWidthFactor =
              earsWidthFactorMap[effectType].leftEarWidthFactor;
            currentEffectsStyles.current[videoId].ears.rightEarWidthFactor =
              earsWidthFactorMap[effectType].rightEarWidthFactor;
            handleEffectChange("ears");
          }
        }
      }}
      contentFunction={() => {
        const iconSrc =
          earsEffects[currentEffectsStyles.current[videoId].ears.style][
            currentEffectsStyles.current[videoId].ears.threeDim
              ? userStreamEffects.current.ears[type]?.[videoId]
                ? "threeDimOffIcon"
                : "threeDimIcon"
              : userStreamEffects.current.ears[type]?.[videoId]
              ? "offIcon"
              : "icon"
          ];

        return (
          <img
            src={iconSrc}
            alt='icon'
            style={{ width: "90%", height: "90%" }}
            data-value={currentEffectsStyles.current[videoId].ears.style}
          />
        );
      }}
      doubleClickFunction={() => {
        currentEffectsStyles.current[videoId].ears.threeDim =
          !currentEffectsStyles.current[videoId].ears.threeDim;
        handleEffectChange("ears");
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
      defaultDataValue={currentEffectsStyles.current[videoId].ears.style}
    />
  );
}
