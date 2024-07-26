import React, { useState } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import FgImage from "../../fgImage/FgImage";
import {
  useCurrentEffectsStylesContext,
  EarsEffectTypes,
  earsWidthFactorMap,
} from "../../context/CurrentEffectsStylesContext";
import dogEars from "../../../public/2DAssets/ears/dogEars.png";
import loading_dogEars from "../../../public/2DAssets/ears/loading_dogEars.png";
import dogEarsIcon from "../../../public/svgs/ears/dogEarsIcon.svg";
import dogEarsOffIcon from "../../../public/svgs/ears/dogEarsOffIcon.svg";
import threeDim_dogEarsIcon from "../../../public/svgs/ears/threeDim_dogEarsIcon.svg";
import threeDim_dogEarsOffIcon from "../../../public/svgs/ears/threeDim_dogEarsOffIcon.svg";
import { EffectTypes, useStreamsContext } from "../../context/StreamsContext";

export default function EarsButton({
  handleEffectChange,
  type,
  videoId,
}: {
  handleEffectChange: (effect: EffectTypes, blockStateChange?: boolean) => void;
  type: "camera" | "screen";
  videoId: string;
}) {
  const [buttonState, setButtonState] = useState("");
  const { currentEffectsStyles } = useCurrentEffectsStylesContext();
  const { userStreamEffects } = useStreamsContext();

  const earsEffects: {
    [key in EarsEffectTypes]: {
      image: string;
      loading: string;
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
      loading: loading_dogEars,
      icon: dogEarsIcon,
      offIcon: dogEarsOffIcon,
      threeDimIcon: threeDim_dogEarsIcon,
      threeDimOffIcon: threeDim_dogEarsOffIcon,
      flipped: false,
      bgColor: "white",
    },
  };

  return (
    <FgButton
      clickFunction={() => {
        handleEffectChange("ears");
        setButtonState(
          currentEffectsStyles.current[videoId].ears?.threeDim
            ? userStreamEffects.current.ears[type]?.[videoId]
              ? "threeDimOffIcon"
              : "threeDimIcon"
            : userStreamEffects.current.ears[type]?.[videoId]
            ? "offIcon"
            : "icon"
        );
      }}
      holdFunction={(event: React.MouseEvent<Element, MouseEvent>) => {
        const target = event.target as HTMLElement;
        if (
          !currentEffectsStyles.current[videoId].ears ||
          !target ||
          !target.dataset.value
        ) {
          return;
        }

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
          handleEffectChange(
            "ears",
            userStreamEffects.current.ears[type]?.[videoId]
          );
        }
      }}
      contentFunction={() => {
        if (!currentEffectsStyles.current[videoId].ears) {
          return;
        }

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
          <FgSVG
            src={iconSrc}
            attributes={[
              { key: "width", value: "95%" },
              { key: "height", value: "95%" },
            ]}
            data-value={currentEffectsStyles.current[videoId].ears.style}
          />
        );
      }}
      doubleClickFunction={() => {
        if (!currentEffectsStyles.current[videoId].ears) {
          return;
        }

        currentEffectsStyles.current[videoId].ears.threeDim =
          !currentEffectsStyles.current[videoId].ears.threeDim;

        handleEffectChange(
          "ears",
          userStreamEffects.current.ears[type]?.[videoId]
        );

        setButtonState(
          currentEffectsStyles.current[videoId].ears.threeDim
            ? userStreamEffects.current.ears[type]?.[videoId]
              ? "threeDimOffIcon"
              : "threeDimIcon"
            : userStreamEffects.current.ears[type]?.[videoId]
            ? "offIcon"
            : "icon"
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
              <FgImage
                src={effect.image}
                srcLoading={effect.loading}
                alt={ears}
                style={{ width: "90%", height: "90%" }}
                data-value={ears}
              />
            </div>
          ))}
        </div>
      }
      hoverContent={
        <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
          Ears
        </div>
      }
      className='flex items-center justify-center w-10 aspect-square'
      defaultDataValue={currentEffectsStyles.current[videoId].ears?.style}
      hoverTimeoutDuration={750}
    />
  );
}
