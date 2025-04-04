import React from "react";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import { SamplerEffectType } from "./SamplerEffectsToolbar";
import FgKnobButton from "../../../elements/fgKnobButton/FgKnobButton";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import {
  AudioMixEffectsType,
  MixEffectsOptionsType,
} from "../../../audioEffects/typeConstant";

export default function SamplerEffect({
  samplerEffectsToolbarRef,
  effectValue,
  effect,
  effects,
  setEffects,
}: {
  samplerEffectsToolbarRef: React.RefObject<HTMLDivElement>;
  effectValue: AudioMixEffectsType;
  effect: SamplerEffectType;
  effects: {
    [mixEffect in AudioMixEffectsType]: {
      active: boolean;
      values: {
        [option in MixEffectsOptionsType]?: number;
      };
    };
  };
  setEffects: React.Dispatch<
    React.SetStateAction<{
      [mixEffect in AudioMixEffectsType]: {
        active: boolean;
        values: {
          [option in MixEffectsOptionsType]?: number;
        };
      };
    }>
  >;
}) {
  const { userMedia } = useMediaContext();

  const handleValueChange = (value: number, id: string | undefined) => {
    if (id === undefined) {
      return;
    }

    const category = id.split("_")[1];

    setEffects((prev) => ({
      ...prev,
      [effectValue]: {
        active: prev[effectValue].active,
        values: { ...prev[effectValue].values, [category]: value },
      },
    }));

    if (effects[effectValue].active) {
      userMedia.current.audio?.samplerEffectsChange([
        {
          type: effectValue,
          updates: [{ option: category as MixEffectsOptionsType, value }],
        },
      ]);
    }
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (
      event.target instanceof SVGPathElement ||
      event.target instanceof SVGElement
    ) {
      if (!effects[effectValue].active) {
        setEffects((prev) => ({
          ...prev,
          [effectValue]: { active: true, values: prev[effectValue].values },
        }));
      }
    } else {
      if (effects[effectValue].active) {
        userMedia.current.audio?.removeSamplerEffects([
          effectValue as AudioMixEffectsType,
        ]);
      } else {
        const updates: { option: MixEffectsOptionsType; value: number }[] =
          Object.entries(effects[effectValue].values).map((update) => ({
            option: update[0] as MixEffectsOptionsType,
            value: update[1],
          }));

        userMedia.current.audio?.samplerEffectsChange([
          {
            type: effectValue,
            updates,
          },
        ]);
      }

      setEffects((prev) => ({
        ...prev,
        [effectValue]: {
          active: !prev[effectValue].active,
          values: prev[effectValue].values,
        },
      }));
    }
  };

  return (
    <div
      className={`w-max h-full flex overflow-hidden space-y-1 ${
        effect.labelPlacement === "top" ? "flex-col" : "flex-col-reverse"
      }`}
      onPointerDown={handlePointerDown}
    >
      <div className='flex space-x-2 items-center justify-center'>
        {Object.keys(effect.options).length > 1 && (
          <div
            className={`w-2 h-0.5 rounded-full ${
              effects[effectValue].active
                ? "bg-fg-primary-desaturated"
                : "bg-fg-white-80"
            }`}
          ></div>
        )}
        {Object.keys(effect.options).length > 1 && effect.labelIcon && (
          <FgSVGElement
            src={effect.labelIcon}
            attributes={[
              { key: "width", value: "1rem" },
              { key: "height", value: "1rem" },
              {
                key: "fill",
                value: effects[effectValue].active
                  ? "black"
                  : "rgb(204 204 204)",
              },
              {
                key: "stroke",
                value: effects[effectValue].active
                  ? "black"
                  : "rgb(204 204 204)",
              },
            ]}
          />
        )}
        <FgButton
          scrollingContainerRef={samplerEffectsToolbarRef}
          contentFunction={() => (
            <div
              className={`h-5 text-base leading-4 font-K2D ${
                effects[effectValue].active ? "text-black" : "text-fg-white-80"
              }`}
            >
              {effect.effectLabel}
            </div>
          )}
          hoverContent={
            <FgHoverContentStandard
              content={
                effects[effectValue].active
                  ? `Remove ${effect.effectLabel.toLowerCase()}`
                  : `Add ${effect.effectLabel.toLowerCase()}`
              }
            />
          }
          options={{
            hoverTimeoutDuration: 1500,
            hoverType: effect.labelPlacement === "top" ? "above" : "below",
          }}
        />
        {Object.keys(effect.options).length > 1 && (
          <div
            className={`grow h-0.5 rounded-full ${
              effects[effectValue].active
                ? "bg-fg-primary-desaturated"
                : "bg-fg-white-80"
            }`}
          ></div>
        )}
      </div>
      <div className='flex w-max h-max space-x-3'>
        {Object.entries(effect.options).map(([key, option]) => (
          <FgKnobButton
            key={key}
            height={5.75}
            options={{
              id: option?.id,
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
            }}
            onValueChange={handleValueChange}
          />
        ))}
      </div>
    </div>
  );
}
