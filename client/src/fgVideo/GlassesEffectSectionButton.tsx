import React from "react";
import HoldButton from "./HoldButton";
import {
  useCurrentEffectsStylesContext,
  GlassesEffectTypes,
} from "../context/CurrentEffectsStylesContext";
import defaultGlasses from "../../public/assets/glasses/defaultGlasses.png";
import memeGlasses from "../../public/assets/glasses/memeGlasses.png";
import americaGlasses from "../../public/assets/glasses/americaGlasses.png";
import threeDGlasses from "../../public/assets/glasses/threeDGlasses.png";
import shades from "../../public/assets/glasses/shades.png";
import defaultGlassesIcon from "../../public/svgs/glasses/defaultGlassesIcon.svg";
import defaultGlassesOffIcon from "../../public/svgs/glasses/defaultGlassesOffIcon.svg";
import memeGlassesIcon from "../../public/svgs/glasses/memeGlassesIcon.svg";
import memeGlassesOffIcon from "../../public/svgs/glasses/memeGlassesOffIcon.svg";
import americaGlassesIcon from "../../public/svgs/glasses/americaGlassesIcon.svg";
import americaGlassesOffIcon from "../../public/svgs/glasses/americaGlassesOffIcon.svg";
import threeDGlassesIcon from "../../public/svgs/glasses/threeDGlassesIcon.svg";
import threeDGlassesOffIcon from "../../public/svgs/glasses/threeDGlassesOffIcon.svg";
import shadesIcon from "../../public/svgs/glasses/shadesIcon.svg";
import shadesOffIcon from "../../public/svgs/glasses/shadesOffIcon.svg";
import { EffectTypes, useStreamsContext } from "../context/StreamsContext";

export default function GlassesEffectSectionButton({
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

  const glassesEffects: {
    [key in GlassesEffectTypes]: {
      image: string;
      icon: string;
      offIcon: string;
      flipped: boolean;
      bgColor: "white" | "black";
    };
  } = {
    defaultGlasses: {
      image: defaultGlasses,
      icon: defaultGlassesIcon,
      offIcon: defaultGlassesOffIcon,
      flipped: false,
      bgColor: "white",
    },
    memeGlasses: {
      image: memeGlasses,
      icon: memeGlassesIcon,
      offIcon: memeGlassesOffIcon,
      flipped: true,
      bgColor: "white",
    },
    americaGlasses: {
      image: americaGlasses,
      icon: americaGlassesIcon,
      offIcon: americaGlassesOffIcon,
      flipped: true,
      bgColor: "white",
    },
    threeDGlasses: {
      image: threeDGlasses,
      icon: threeDGlassesIcon,
      offIcon: threeDGlassesOffIcon,
      flipped: false,
      bgColor: "black",
    },
    shades: {
      image: shades,
      flipped: false,
      icon: shadesIcon,
      offIcon: shadesOffIcon,
      bgColor: "white",
    },
  };

  return (
    <HoldButton
      clickFunction={() => handleEffectChange("glasses")}
      holdFunction={(event: React.MouseEvent<Element, MouseEvent>) => {
        const target = event.target as HTMLElement;
        if (target && target.dataset.value) {
          const effectType = target.dataset.value as GlassesEffectTypes;
          if (
            effectType in glassesEffects &&
            (currentEffectsStyles.current.glasses !== effectType ||
              !userStreamEffects.current.glasses[type]?.[videoId])
          ) {
            currentEffectsStyles.current.glasses = effectType;
            handleEffectChange(
              "glasses",
              userStreamEffects.current.glasses[type]?.[videoId] ? true : false
            );
          }
        }
      }}
      contentFunction={() => {
        const iconSrc =
          glassesEffects[currentEffectsStyles.current.glasses][
            userStreamEffects.current.glasses[type]?.[videoId]
              ? "offIcon"
              : "icon"
          ];

        return (
          <img
            src={iconSrc}
            alt='icon'
            style={{ width: "90%", height: "90%" }}
            data-value={currentEffectsStyles.current.glasses}
          />
        );
      }}
      holdContent={
        <div className='mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'>
          {Object.entries(glassesEffects).map(([glasses, effect]) => (
            <div
              key={glasses}
              className={`${effect.flipped && "scale-x-[-1]"} ${
                effect.bgColor === "white" && "bg-white border-fg-black-35"
              } ${
                effect.bgColor === "black" && "border-white"
              } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
              data-value={glasses}
            >
              <img
                src={effect.image}
                alt={glasses}
                style={{ width: "90%" }}
                data-value={glasses}
              />
            </div>
          ))}
        </div>
      }
      styles={"flex items-center justify-center w-10 aspect-square"}
      defaultDataValue={currentEffectsStyles.current.glasses}
    />
  );
}
