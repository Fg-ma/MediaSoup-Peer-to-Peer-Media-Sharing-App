import React from "react";
import FgSlider, { SliderChangeEvent } from "../../fgSlider/FgSlider";
import {
  DynamicMixEffect,
  LabelPlacementType,
  StaticMixEffect,
} from "./AudioMixEffectsPortal";
import { AudioMixEffectsType } from "../../effects/audioEffects/AudioEffects";

export default function AudioMixEffect({
  effect,
  staticMixEffect,
  dynamicMixEffect,
  effectLabel,
  labelPlacement,
  updateMixEffectsValues,
}: {
  effect: AudioMixEffectsType;
  staticMixEffect: StaticMixEffect;
  dynamicMixEffect: DynamicMixEffect;
  effectLabel: string;
  labelPlacement: LabelPlacementType;
  updateMixEffectsValues: (event: SliderChangeEvent) => void;
}) {
  return (
    <div
      className={`border-2 border-black p-5 rounded absolute
        ${dynamicMixEffect.orientation === "vertical" ? "h-60" : ""}
        ${dynamicMixEffect.orientation === "horizontal" ? "w-60" : ""}  
      `}
      style={{
        left: `${dynamicMixEffect.x}px`,
        top: `${dynamicMixEffect.y}px`,
        width: `${dynamicMixEffect.width}px`,
        height: `${dynamicMixEffect.height}px`,
        backgroundColor: staticMixEffect.backgroundColor,
        ...(staticMixEffect.backgroundImage && {
          backgroundImage: `url(${staticMixEffect.backgroundImage})`,
          backgroundSize: "cover",
          backgroundBlendMode: "overlay",
          backgroundRepeat: "no-repeat",
        }),
      }}
    >
      <div
        className={`absolute text-lg bg-white rounded-sm border-2 border-black font-Josefin text-center
        ${
          labelPlacement.side === "top"
            ? "top-0 -translate-y-1/2 px-1 w-max leading-4.5 pt-1.5"
            : ""
        } 
        ${
          labelPlacement.side === "bottom"
            ? "bottom-0 translate-y-1/2 px-1 w-max leading-4.5 pt-1.5"
            : ""
        } 
        ${
          labelPlacement.side === "left"
            ? "whitespace-pre-line leading-4 left-0 -translate-x-1/2 p-1"
            : ""
        }
        ${
          labelPlacement.side === "right"
            ? "whitespace-pre-line leading-4 right-0 translate-x-1/2 p-1"
            : ""
        }

        ${labelPlacement.sidePlacement === "top" ? "top-4" : ""}
        ${
          labelPlacement.sidePlacement === "middle"
            ? "top-1/2 -translate-y-1/2"
            : ""
        }
        ${labelPlacement.sidePlacement === "bottom" ? "bottom-4" : ""}
        ${labelPlacement.sidePlacement === "left" ? "left-4" : ""}
        ${
          labelPlacement.sidePlacement === "center"
            ? "left-1/2 -translate-x-1/2"
            : ""
        }
        ${labelPlacement.sidePlacement === "right" ? "right-4" : ""}
        `}
      >
        {labelPlacement.side === "right" || labelPlacement.side === "left"
          ? effectLabel.split("").join("\n")
          : effectLabel}
      </div>
      <div
        className={`h-full flex items-center justify-center 
          ${dynamicMixEffect.orientation === "horizontal" ? "flex-col" : ""}  
        `}
      >
        {Object.entries(staticMixEffect.options).map(([key, option], index) => (
          <FgSlider
            key={index}
            options={{
              id: `${effect}_${key}`,
              initValue: option.initValue,
              topLabel: option.topLabel,
              bottomLabel: option.bottomLabel,
              ticks: option.ticks,
              rangeMax: option.rangeMax,
              rangeMin: option.rangeMin,
              precision: option.precision,
              units: option.units,
              snapToWholeNum: option.snapToWholeNum,
              snapToNearestTick: option.snapToNearestTick,
              orientation: dynamicMixEffect.orientation,
            }}
            onValueChange={updateMixEffectsValues}
          />
        ))}
      </div>
    </div>
  );
}
