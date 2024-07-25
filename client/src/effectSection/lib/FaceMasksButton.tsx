import React from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import {
  useCurrentEffectsStylesContext,
  FaceMasksEffectTypes,
} from "../../context/CurrentEffectsStylesContext";
import faceMask1 from "../../../public/2DAssets/faceMasks/faceMask1.png";
import faceMaskIcon1 from "../../../public/svgs/faceMasks/faceMaskIcon1.svg";
import faceMaskOffIcon1 from "../../../public/svgs/faceMasks/faceMaskOffIcon1.svg";
import threeDim_faceMaskIcon1 from "../../../public/svgs/faceMasks/threeDim_faceMaskIcon1.svg";
import threeDim_faceMaskOffIcon1 from "../../../public/svgs/faceMasks/threeDim_faceMaskOffIcon1.svg";
import { EffectTypes, useStreamsContext } from "../../context/StreamsContext";

export default function FaceMasksButton({
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

  const faceMasksEffects: {
    [key in FaceMasksEffectTypes]: {
      image: string;
      icon: string;
      offIcon: string;
      threeDimIcon: string;
      threeDimOffIcon: string;
      flipped: boolean;
      bgColor: "white" | "black";
    };
  } = {
    faceMask1: {
      image: faceMask1,
      icon: faceMaskIcon1,
      offIcon: faceMaskOffIcon1,
      threeDimIcon: threeDim_faceMaskIcon1,
      threeDimOffIcon: threeDim_faceMaskOffIcon1,
      flipped: false,
      bgColor: "white",
    },
  };

  return (
    <FgButton
      clickFunction={() => handleEffectChange("faceMasks")}
      holdFunction={(event: React.MouseEvent<Element, MouseEvent>) => {
        const target = event.target as HTMLElement;
        if (target && target.dataset.value) {
          const effectType = target.dataset.value as FaceMasksEffectTypes;
          if (
            effectType in faceMasksEffects &&
            (currentEffectsStyles.current[videoId].faceMasks.style !==
              effectType ||
              !userStreamEffects.current.faceMasks[type]?.[videoId])
          ) {
            currentEffectsStyles.current[videoId].faceMasks.style = effectType;
            handleEffectChange("faceMasks");
          }
        }
      }}
      contentFunction={() => {
        const iconSrc =
          faceMasksEffects[
            currentEffectsStyles.current[videoId].faceMasks.style
          ][
            currentEffectsStyles.current[videoId].faceMasks.threeDim
              ? userStreamEffects.current.faceMasks[type]?.[videoId]
                ? "threeDimOffIcon"
                : "threeDimIcon"
              : userStreamEffects.current.faceMasks[type]?.[videoId]
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
          />
        );
      }}
      doubleClickFunction={() => {
        handleEffectChange("faceMasks");
      }}
      holdContent={
        <div className='mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'>
          {Object.entries(faceMasksEffects).map(([faceMasks, effect]) => (
            <div
              key={faceMasks}
              className={`${effect.flipped && "scale-x-[-1]"} ${
                effect.bgColor === "white" && "bg-white border-fg-black-35"
              } ${
                effect.bgColor === "black" && "border-white"
              } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
              data-value={faceMasks}
            >
              <img
                src={effect.image}
                alt={faceMasks}
                style={{ width: "90%" }}
                data-value={faceMasks}
              />
            </div>
          ))}
        </div>
      }
      hoverContent={
        <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
          Face mask
        </div>
      }
      className='flex items-center justify-center w-10 aspect-square'
      defaultDataValue={currentEffectsStyles.current[videoId].faceMasks.style}
      hoverTimeoutDuration={750}
    />
  );
}
