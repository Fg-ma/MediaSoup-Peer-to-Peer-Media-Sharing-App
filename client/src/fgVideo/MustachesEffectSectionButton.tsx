import React from "react";
import HoldButton from "./HoldButton";
import {
  useCurrentEffectsStylesContext,
  MustachesEffectTypes,
  mustacheNoseOffsetsMap,
} from "../context/CurrentEffectsStylesContext";
import mustache1 from "../../public/assets/mustaches/mustache1.png";
import mustache2 from "../../public/assets/mustaches/mustache2.png";
import mustache3 from "../../public/assets/mustaches/mustache3.png";
import mustache4 from "../../public/assets/mustaches/mustache4.png";
import disguiseMustache from "../../public/assets/mustaches/disguiseMustache.png";
import mustacheIcon1 from "../../public/svgs/mustaches/mustacheIcon1.svg";
import mustacheOffIcon1 from "../../public/svgs/mustaches/mustacheOffIcon1.svg";
import mustacheIcon2 from "../../public/svgs/mustaches/mustacheIcon2.svg";
import mustacheOffIcon2 from "../../public/svgs/mustaches/mustacheOffIcon2.svg";
import mustacheIcon3 from "../../public/svgs/mustaches/mustacheIcon3.svg";
import mustacheOffIcon3 from "../../public/svgs/mustaches/mustacheOffIcon3.svg";
import mustacheIcon4 from "../../public/svgs/mustaches/mustacheIcon4.svg";
import mustacheOffIcon4 from "../../public/svgs/mustaches/mustacheOffIcon4.svg";
import disguiseMustacheIcon from "../../public/svgs/mustaches/disguiseMustacheIcon.svg";
import disguiseMustacheOffIcon from "../../public/svgs/mustaches/disguiseMustacheOffIcon.svg";
import { EffectTypes, useStreamsContext } from "../context/StreamsContext";

export default function MustachesEffectSectionButton({
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

  const mustachesEffects: {
    [key in MustachesEffectTypes]: {
      image: string;
      icon: string;
      offIcon: string;
      flipped: boolean;
      bgColor: "white" | "black";
    };
  } = {
    mustache1: {
      image: mustache1,
      icon: mustacheIcon1,
      offIcon: mustacheOffIcon1,
      flipped: false,
      bgColor: "white",
    },
    mustache2: {
      image: mustache2,
      icon: mustacheIcon2,
      offIcon: mustacheOffIcon2,
      flipped: false,
      bgColor: "white",
    },
    mustache3: {
      image: mustache3,
      icon: mustacheIcon3,
      offIcon: mustacheOffIcon3,
      flipped: false,
      bgColor: "white",
    },
    mustache4: {
      image: mustache4,
      icon: mustacheIcon4,
      offIcon: mustacheOffIcon4,
      flipped: false,
      bgColor: "white",
    },
    disguiseMustache: {
      image: disguiseMustache,
      icon: disguiseMustacheIcon,
      offIcon: disguiseMustacheOffIcon,
      flipped: false,
      bgColor: "white",
    },
  };

  return (
    <HoldButton
      clickFunction={() => handleEffectChange("mustaches")}
      holdFunction={(event: React.MouseEvent<Element, MouseEvent>) => {
        const target = event.target as HTMLElement;
        if (target && target.dataset.value) {
          const effectType = target.dataset.value as MustachesEffectTypes;
          if (
            effectType in mustachesEffects &&
            (currentEffectsStyles.current.mustaches.style !== effectType ||
              !userStreamEffects.current.mustaches[type]?.[videoId])
          ) {
            currentEffectsStyles.current.mustaches.style = effectType;
            currentEffectsStyles.current.mustaches.noseOffset =
              mustacheNoseOffsetsMap[effectType];
            handleEffectChange(
              "mustaches",
              userStreamEffects.current.mustaches[type]?.[videoId]
                ? true
                : false
            );
          }
        }
      }}
      contentFunction={() => {
        const iconSrc =
          mustachesEffects[currentEffectsStyles.current.mustaches.style][
            userStreamEffects.current.mustaches[type]?.[videoId]
              ? "offIcon"
              : "icon"
          ];

        return (
          <img
            src={iconSrc}
            alt='icon'
            style={{ width: "90%", height: "90%" }}
            data-value={currentEffectsStyles.current.mustaches.style}
          />
        );
      }}
      holdContent={
        <div className='mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'>
          {Object.entries(mustachesEffects).map(([mustaches, effect]) => (
            <div
              key={mustaches}
              className={`${effect.flipped && "scale-x-[-1]"} ${
                effect.bgColor === "white" && "bg-white border-fg-black-35"
              } ${
                effect.bgColor === "black" && "border-white"
              } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
              data-value={mustaches}
            >
              <img
                src={effect.image}
                alt={mustaches}
                style={{ width: "90%" }}
                data-value={mustaches}
              />
            </div>
          ))}
        </div>
      }
      styles={"flex items-center justify-center w-10 aspect-square"}
      defaultDataValue={currentEffectsStyles.current.mustaches.style}
    />
  );
}
