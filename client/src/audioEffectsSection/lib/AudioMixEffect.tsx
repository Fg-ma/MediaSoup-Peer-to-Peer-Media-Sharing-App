import React, { useEffect, useRef, useState } from "react";
import AudioEffectSlider from "./AudioEffectSlider";

export default function AudioMixEffect({
  effectLabel,
  effectOptions,
  bgColor,
}: {
  effectLabel: string;
  effectOptions: {
    topLabel?: string;
    bottomLabel?: string;
    ticks: number;
    rangeMax: number;
    rangeMin: number;
    precision?: number;
    units?: string;
  }[];
  bgColor?: string;
}) {
  return (
    <div
      className='h-60 border-2 border-black p-5 relative rounded'
      style={{ backgroundColor: bgColor }}
    >
      <div className='whitespace-pre-line leading-4 absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 text-lg bg-white rounded-sm p-1 border-2 border-black font-Josefin text-center'>
        {effectLabel.split("").join("\n")}
      </div>
      <div className='h-full flex items-center justify-center'>
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
          />
        ))}
      </div>
    </div>
  );
}
