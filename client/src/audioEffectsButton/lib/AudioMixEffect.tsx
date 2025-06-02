import React from "react";
import FgSVGElement from "../../elements/fgSVGElement/FgSVGElement";
import FgSlider, { SliderChangeEvent } from "../../elements/fgSlider/FgSlider";
import FgHoverContentStandard from "../../elements/fgHoverContentStandard/FgHoverContentStandard";
import {
  AudioMixEffectsType,
  MixEffectsOptionsType,
} from "../../audioEffects/typeConstant";
import {
  DynamicMixEffect,
  LabelPlacementType,
  StaticMixEffect,
} from "./typeConstant";

export default function AudioMixEffect({
  effect,
  staticMixEffect,
  dynamicMixEffect,
  effectLabel,
  labelPlacement,
  sliderValues,
  mixEffectValueChange,
}: {
  effect: AudioMixEffectsType;
  staticMixEffect: StaticMixEffect;
  dynamicMixEffect: DynamicMixEffect;
  effectLabel: string;
  labelPlacement: LabelPlacementType;
  sliderValues: {
    [mixEffect in AudioMixEffectsType]: {
      [option in MixEffectsOptionsType]?: number;
    };
  };
  mixEffectValueChange: (event: SliderChangeEvent) => void;
}) {
  return (
    <div
      className={`absolute rounded border-2 border-fg-tone-black-1 p-5 ${dynamicMixEffect.orientation === "vertical" ? "h-60" : ""} ${dynamicMixEffect.orientation === "horizontal" ? "w-60" : ""} `}
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
        className={`absolute items-center justify-center rounded-sm border-2 border-fg-tone-black-1 bg-fg-white text-center font-Josefin text-lg ${
          labelPlacement.side === "top"
            ? "top-0 flex w-max -translate-y-1/2 space-x-2 px-1 py-0.5 leading-4.5"
            : ""
        } ${
          labelPlacement.side === "bottom"
            ? "bottom-0 flex w-max translate-y-1/2 space-x-2 px-1 py-0.5 leading-4.5"
            : ""
        } ${
          labelPlacement.side === "left"
            ? `left-0 flex -translate-x-1/2 flex-col space-y-2 whitespace-pre-line py-1 leading-4 ${
                staticMixEffect.labelIcon ? "px-0.5" : "px-1"
              }`
            : ""
        } ${
          labelPlacement.side === "right"
            ? `right-0 flex translate-x-1/2 flex-col space-y-2 whitespace-pre-line py-1 leading-4 ${
                staticMixEffect.labelIcon ? "px-0.5" : "px-1"
              }`
            : ""
        } ${labelPlacement.sidePlacement === "top" ? "top-4" : ""} ${
          labelPlacement.sidePlacement === "middle"
            ? "top-1/2 -translate-y-1/2"
            : ""
        } ${labelPlacement.sidePlacement === "bottom" ? "bottom-4" : ""} ${labelPlacement.sidePlacement === "left" ? "left-4" : ""} ${
          labelPlacement.sidePlacement === "center"
            ? "left-1/2 -translate-x-1/2"
            : ""
        } ${labelPlacement.sidePlacement === "right" ? "right-4" : ""} `}
      >
        {staticMixEffect.labelIcon && (
          <FgSVGElement
            src={staticMixEffect.labelIcon}
            attributes={[
              { key: "width", value: "1.25rem" },
              { key: "height", value: "1.25rem" },
            ]}
            hoverContent={
              <FgHoverContentStandard content={staticMixEffect.effectLabel} />
            }
            options={{ hoverTimeoutDuration: 1500 }}
          />
        )}
        <div
          className={`select-none ${
            labelPlacement.side === "top" || labelPlacement.side === "bottom"
              ? "pt-1.25"
              : ""
          }`}
        >
          {labelPlacement.side === "right" || labelPlacement.side === "left"
            ? effectLabel.split("").join("\n")
            : effectLabel}
        </div>
      </div>
      <div
        className={`flex h-full items-center justify-center ${dynamicMixEffect.orientation === "horizontal" ? "flex-col" : ""} `}
      >
        {Object.entries(staticMixEffect.options).map(([key, option], index) => (
          <FgSlider
            key={index}
            style={{
              height: `${
                dynamicMixEffect.orientation === "horizontal" ? "3.5rem" : ""
              }`,
              width: `${
                dynamicMixEffect.orientation === "horizontal" ? "" : "3.5rem"
              }`,
            }}
            externalValue={sliderValues[effect][key as MixEffectsOptionsType]}
            externalStyleValue={
              sliderValues[effect][key as MixEffectsOptionsType]
            }
            options={{
              id: `${effect}_${key}`,
              initValue: option?.initValue,
              topLabel: option?.topLabel,
              bottomLabel: option?.bottomLabel,
              ticks: option?.ticks,
              rangeMax: option?.rangeMax,
              rangeMin: option?.rangeMin,
              precision: option?.precision,
              units: option?.units,
              snapToWholeNum: option?.snapToWholeNum,
              snapToNearestTick: option?.snapToNearestTick,
              orientation: dynamicMixEffect.orientation,
            }}
            onValueChange={mixEffectValueChange}
          />
        ))}
      </div>
    </div>
  );
}
