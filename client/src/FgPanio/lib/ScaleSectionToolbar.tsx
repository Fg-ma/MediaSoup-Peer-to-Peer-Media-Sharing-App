import React, { useRef } from "react";
import { Transition, Variants } from "framer-motion";
import { Octaves } from "../FgPiano";
import SelectSampler from "./SelectSampler";
import SamplerVolume from "./SamplerVolume";
import OctaveSelection from "./OctaveSelection";

export const navVar: Variants = {
  leftInit: { opacity: 0, x: -20 },
  leftAnimate: {
    opacity: 1,
    x: 0,
  },
  rightInit: { opacity: 0, x: 20 },
  rightAnimate: {
    opacity: 1,
    x: 0,
  },
  hover: { backgroundColor: "rgb(64 64 64)", fill: "rgb(255, 255, 255)" },
};

export const navTransition: Transition = {
  transition: {
    duration: 0.15,
    ease: "linear",
  },
};

export default function ScaleSectionToolbar({
  visibleOctaveRef,
  scrollToOctave,
}: {
  visibleOctaveRef: React.MutableRefObject<Octaves>;
  scrollToOctave: (octave: Octaves) => void;
}) {
  return (
    <div className='w-full h-8 flex justify-between px-2 mb-1 overflow-hidden'>
      <SamplerVolume />
      <div className='flex space-x-2'>
        <OctaveSelection
          visibleOctaveRef={visibleOctaveRef}
          scrollToOctave={scrollToOctave}
        />
        <SelectSampler />
      </div>
    </div>
  );
}
