import React from "react";
import FgSlider, { SliderChangeEvent } from "../../fgSlider/FgSlider";
import { MixEffect } from "./AudioMixEffectsPortal";
import { AudioMixEffectsType } from "../../effects/audioEffects/AudioEffects";

export default function AudioMixEffect({
  effect,
  mixEffect,
  effectLabel,
  labelPlacement,
  updateMixEffectsValues,
}: {
  effect: AudioMixEffectsType;
  mixEffect: MixEffect;
  effectLabel: string;
  labelPlacement: {
    side: string;
    sidePlacement: string;
  };
  updateMixEffectsValues: (event: SliderChangeEvent) => void;
}) {
  return (
    <div
      className={`border-2 border-black p-5 rounded absolute
        ${mixEffect.orientation === "vertical" ? "h-60" : ""}
        ${mixEffect.orientation === "horizontal" ? "w-60" : ""}  
      `}
      style={{
        backgroundColor: mixEffect.backgroundColor,
        left: `${mixEffect.x}px`,
        top: `${mixEffect.y}px`,
        width: `${mixEffect.width}px`,
        height: `${mixEffect.height}px`,
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
          ${mixEffect.orientation === "horizontal" ? "flex-col" : ""}  
        `}
      >
        {Object.entries(mixEffect.options).map(([key, option], index) => (
          <FgSlider
            key={index}
            id={`${effect}_${key}`}
            topLabel={option.topLabel}
            bottomLabel={option.bottomLabel}
            ticks={option.ticks}
            rangeMax={option.rangeMax}
            rangeMin={option.rangeMin}
            precision={option.precision}
            units={option.units}
            snapToWholeNum={option.snapToWholeNum}
            orientation={mixEffect.orientation}
            onValueChange={updateMixEffectsValues}
          />
        ))}
      </div>
    </div>
  );
}
