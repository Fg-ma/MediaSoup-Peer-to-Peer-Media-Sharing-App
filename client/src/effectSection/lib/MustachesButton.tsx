import React, { useState } from "react";
import { ReactSVG } from "react-svg";
import FgButton from "../../fgVideo/FgButton";
import {
  useCurrentEffectsStylesContext,
  MustachesEffectTypes,
  mustacheNoseOffsetsMap,
} from "../../context/CurrentEffectsStylesContext";
import mustache1 from "../../../public/2DAssets/mustaches/mustache1.png";
import mustache2 from "../../../public/2DAssets/mustaches/mustache2.png";
import mustache3 from "../../../public/2DAssets/mustaches/mustache3.png";
import mustache4 from "../../../public/2DAssets/mustaches/mustache4.png";
import disguiseMustache from "../../../public/2DAssets/mustaches/disguiseMustache.png";
import mustacheIcon1 from "../../../public/svgs/mustaches/mustacheIcon1.svg";
import mustacheOffIcon1 from "../../../public/svgs/mustaches/mustacheOffIcon1.svg";
import threeDim_mustacheIcon1 from "../../../public/svgs/mustaches/threeDim_mustacheIcon1.svg";
import threeDim_mustacheOffIcon1 from "../../../public/svgs/mustaches/threeDim_mustacheOffIcon1.svg";
import mustacheIcon2 from "../../../public/svgs/mustaches/mustacheIcon2.svg";
import mustacheOffIcon2 from "../../../public/svgs/mustaches/mustacheOffIcon2.svg";
import threeDim_mustacheIcon2 from "../../../public/svgs/mustaches/threeDim_mustacheIcon2.svg";
import threeDim_mustacheOffIcon2 from "../../../public/svgs/mustaches/threeDim_mustacheOffIcon2.svg";
import mustacheIcon3 from "../../../public/svgs/mustaches/mustacheIcon3.svg";
import mustacheOffIcon3 from "../../../public/svgs/mustaches/mustacheOffIcon3.svg";
import threeDim_mustacheIcon3 from "../../../public/svgs/mustaches/threeDim_mustacheIcon3.svg";
import threeDim_mustacheOffIcon3 from "../../../public/svgs/mustaches/threeDim_mustacheOffIcon3.svg";
import mustacheIcon4 from "../../../public/svgs/mustaches/mustacheIcon4.svg";
import mustacheOffIcon4 from "../../../public/svgs/mustaches/mustacheOffIcon4.svg";
import threeDim_mustacheIcon4 from "../../../public/svgs/mustaches/threeDim_mustacheIcon4.svg";
import threeDim_mustacheOffIcon4 from "../../../public/svgs/mustaches/threeDim_mustacheOffIcon4.svg";
import disguiseMustacheIcon from "../../../public/svgs/mustaches/disguiseMustacheIcon.svg";
import disguiseMustacheOffIcon from "../../../public/svgs/mustaches/disguiseMustacheOffIcon.svg";
import threeDim_disguiseMustacheIcon from "../../../public/svgs/mustaches/threeDim_disguiseMustacheIcon.svg";
import threeDim_disguiseMustacheOffIcon from "../../../public/svgs/mustaches/threeDim_disguiseMustacheOffIcon.svg";
import { EffectTypes, useStreamsContext } from "../../context/StreamsContext";

export default function MustachesButton({
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

  const mustachesEffects: {
    [key in MustachesEffectTypes]: {
      image: string;
      icon: string;
      offIcon: string;
      threeDimIcon: string;
      threeDimOffIcon: string;
      flipped: boolean;
      bgColor: "white" | "black";
    };
  } = {
    mustache1: {
      image: mustache1,
      icon: mustacheIcon1,
      offIcon: mustacheOffIcon1,
      threeDimIcon: threeDim_mustacheIcon1,
      threeDimOffIcon: threeDim_mustacheOffIcon1,
      flipped: false,
      bgColor: "white",
    },
    mustache2: {
      image: mustache2,
      icon: mustacheIcon2,
      offIcon: mustacheOffIcon2,
      threeDimIcon: threeDim_mustacheIcon2,
      threeDimOffIcon: threeDim_mustacheOffIcon2,
      flipped: false,
      bgColor: "white",
    },
    mustache3: {
      image: mustache3,
      icon: mustacheIcon3,
      offIcon: mustacheOffIcon3,
      threeDimIcon: threeDim_mustacheIcon3,
      threeDimOffIcon: threeDim_mustacheOffIcon3,
      flipped: false,
      bgColor: "white",
    },
    mustache4: {
      image: mustache4,
      icon: mustacheIcon4,
      offIcon: mustacheOffIcon4,
      threeDimIcon: threeDim_mustacheIcon4,
      threeDimOffIcon: threeDim_mustacheOffIcon4,
      flipped: false,
      bgColor: "white",
    },
    disguiseMustache: {
      image: disguiseMustache,
      icon: disguiseMustacheIcon,
      offIcon: disguiseMustacheOffIcon,
      threeDimIcon: threeDim_disguiseMustacheIcon,
      threeDimOffIcon: threeDim_disguiseMustacheOffIcon,
      flipped: false,
      bgColor: "white",
    },
  };

  return (
    <FgButton
      clickFunction={() => {
        handleEffectChange("mustaches");
        setButtonState(
          currentEffectsStyles.current[videoId].mustaches.threeDim
            ? userStreamEffects.current.mustaches[type]?.[videoId]
              ? "threeDimOffIcon"
              : "threeDimIcon"
            : userStreamEffects.current.mustaches[type]?.[videoId]
            ? "offIcon"
            : "icon"
        );
      }}
      holdFunction={(event: React.MouseEvent<Element, MouseEvent>) => {
        const target = event.target as HTMLElement;
        if (target && target.dataset.value) {
          const effectType = target.dataset.value as MustachesEffectTypes;
          if (
            effectType in mustachesEffects &&
            (currentEffectsStyles.current[videoId].mustaches.style !==
              effectType ||
              !userStreamEffects.current.mustaches[type]?.[videoId])
          ) {
            currentEffectsStyles.current[videoId].mustaches.style = effectType;
            currentEffectsStyles.current[videoId].mustaches.noseOffset =
              mustacheNoseOffsetsMap[effectType];
            handleEffectChange(
              "mustaches",
              userStreamEffects.current.mustaches[type]?.[videoId]
            );
          }
        }
      }}
      contentFunction={() => {
        const iconSrc =
          mustachesEffects[
            currentEffectsStyles.current[videoId].mustaches.style
          ][
            currentEffectsStyles.current[videoId].mustaches.threeDim
              ? userStreamEffects.current.mustaches[type]?.[videoId]
                ? "threeDimOffIcon"
                : "threeDimIcon"
              : userStreamEffects.current.mustaches[type]?.[videoId]
              ? "offIcon"
              : "icon"
          ];

        return (
          <ReactSVG
            src={iconSrc}
            beforeInjection={(svg) => {
              !currentEffectsStyles.current[videoId].mustaches.threeDim &&
                svg.setAttribute("style", "fill: white");
              svg.setAttribute("width", "width: 90%");
              svg.setAttribute("height", "height: 90%");
            }}
            data-value={currentEffectsStyles.current[videoId].mustaches.style}
          />
        );
      }}
      doubleClickFunction={() => {
        currentEffectsStyles.current[videoId].mustaches.threeDim =
          !currentEffectsStyles.current[videoId].mustaches.threeDim;

        handleEffectChange(
          "mustaches",
          userStreamEffects.current.mustaches[type]?.[videoId]
        );

        setButtonState(
          currentEffectsStyles.current[videoId].mustaches.threeDim
            ? userStreamEffects.current.mustaches[type]?.[videoId]
              ? "threeDimOffIcon"
              : "threeDimIcon"
            : userStreamEffects.current.mustaches[type]?.[videoId]
            ? "offIcon"
            : "icon"
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
      hoverContent={
        <div className='mb-4 w-max py-1 px-2 border border-white border-opacity-75 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
          Mustache effects
        </div>
      }
      styles={"flex items-center justify-center w-10 aspect-square"}
      defaultDataValue={currentEffectsStyles.current[videoId].mustaches.style}
    />
  );
}
