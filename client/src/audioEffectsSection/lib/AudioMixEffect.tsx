import React, { useEffect, useRef, useState } from "react";
import AudioEffectSlider from "./AudioEffectSlider";

export default function AudioMixEffect({
  effectLabel,
  labelPlacement,
  orientation = "vertical",
  effectOptions,
  style,
}: {
  effectLabel: string;
  labelPlacement:
    | { side: "left" | "right"; sidePlacement: "top" | "middle" | "bottom" }
    | { side: "top" | "bottom"; sidePlacement: "left" | "center" | "right" };
  orientation?: "vertical" | "horizontal";
  effectOptions: {
    topLabel?: string;
    bottomLabel?: string;
    ticks: number;
    rangeMax: number;
    rangeMin: number;
    precision?: number;
    units?: string;
    snapToWholeNum?: boolean;
  }[];
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`border-2 border-black p-5 relative rounded
        ${orientation === "vertical" ? "h-60" : ""}
        ${orientation === "horizontal" ? "w-60" : ""}  
      `}
      style={style}
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
          ${orientation === "horizontal" ? "flex-col" : ""}  
        `}
      >
        {effectOptions.map((effectOption, index) => (
          <AudioEffectSlider
            key={index}
            topLabel={effectOption.topLabel}
            bottomLabel={effectOption.bottomLabel}
            ticks={effectOption.ticks}
            rangeMax={effectOption.rangeMax}
            rangeMin={effectOption.rangeMin}
            precision={effectOption.precision}
            units={effectOption.units}
            orientation={orientation}
            snapToWholeNum={effectOption.snapToWholeNum}
          />
        ))}
      </div>
    </div>
  );
}
