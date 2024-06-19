import React from "react";
import HoldButton from "./HoldButton";
import {
  useCurrentEffectsStylesContext,
  BeardsEffectTypes,
  beardChinOffsets,
} from "../context/CurrentEffectsStylesContext";
import classicalCurlyBeard from "../../public/assets/beards/classicalCurlyBeard.png";
import classicalCurlyBeardIcon from "../../public/svgs/beards/classicalCurlyBeardIcon.svg";
import classicalCurlyBeardOffIcon from "../../public/svgs/beards/classicalCurlyBeardOffIcon.svg";
import { EffectTypes, useStreamsContext } from "../context/StreamsContext";

export default function BeardsEffectSectionButton({
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

  const beardsEffects: {
    [key in BeardsEffectTypes]: {
      image: string;
      icon: string;
      offIcon: string;
      flipped: boolean;
      bgColor: "white" | "black";
    };
  } = {
    classicalCurlyBeard: {
      image: classicalCurlyBeard,
      icon: classicalCurlyBeardIcon,
      offIcon: classicalCurlyBeardOffIcon,
      flipped: true,
      bgColor: "black",
    },
  };

  return (
    <HoldButton
      clickFunction={() => handleEffectChange("beards")}
      holdFunction={(event: React.MouseEvent<Element, MouseEvent>) => {
        const target = event.target as HTMLElement;
        if (target && target.dataset.value) {
          const effectType = target.dataset.value as BeardsEffectTypes;
          if (
            effectType in beardsEffects &&
            (currentEffectsStyles.current.beards.style !== effectType ||
              !userStreamEffects.current.beards[type]?.[videoId])
          ) {
            currentEffectsStyles.current.beards.style = effectType;
            currentEffectsStyles.current.beards.chinOffset =
              beardChinOffsets[effectType];
            handleEffectChange(
              "beards",
              userStreamEffects.current.beards[type]?.[videoId] ? true : false
            );
          }
        }
      }}
      contentFunction={() => {
        const iconSrc =
          beardsEffects[currentEffectsStyles.current.beards.style][
            userStreamEffects.current.beards[type]?.[videoId]
              ? "offIcon"
              : "icon"
          ];

        return (
          <img
            src={iconSrc}
            alt='icon'
            style={{ width: "90%", height: "90%" }}
            data-value={currentEffectsStyles.current.beards.style}
          />
        );
      }}
      holdContent={
        <div className='mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'>
          {Object.entries(beardsEffects).map(([beards, effect]) => (
            <div
              key={beards}
              className={`${effect.flipped && "scale-x-[-1]"} ${
                effect.bgColor === "white" && "bg-white border-fg-black-35"
              } ${
                effect.bgColor === "black" && "border-white"
              } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
              data-value={beards}
            >
              <img
                src={effect.image}
                alt={beards}
                style={{ width: "90%" }}
                data-value={beards}
              />
            </div>
          ))}
        </div>
      }
      styles={"flex items-center justify-center w-10 aspect-square"}
      defaultDataValue={currentEffectsStyles.current.beards.style}
    />
  );
}
