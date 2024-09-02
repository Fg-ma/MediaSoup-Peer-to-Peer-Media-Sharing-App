import React, { useEffect, useRef } from "react";
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
  const rightScaleSectionToolbarRef = useRef<HTMLDivElement>(null);

  const handleWheel = (event: WheelEvent) => {
    if (rightScaleSectionToolbarRef.current) {
      rightScaleSectionToolbarRef.current.scrollLeft -= event.deltaY / 2;
    }
  };

  useEffect(() => {
    rightScaleSectionToolbarRef.current?.addEventListener("wheel", handleWheel);

    // Cleanup event listener on unmount
    return () => {
      rightScaleSectionToolbarRef.current?.removeEventListener(
        "wheel",
        handleWheel
      );
    };
  }, []);

  return (
    <div className='w-full h-8 flex justify-between px-2 mb-1 overflow-hidden'>
      <div
        className='w-max h-8 z-20 flex items-center space-x-2 pr-2'
        style={{ boxShadow: "8px 0 4px -3px rgba(255, 255, 255, 1)" }}
      >
        <SamplerVolume />
      </div>
      <div
        ref={rightScaleSectionToolbarRef}
        className='w-max h-8 overflow-x-auto z-10 flex items-center space-x-2 scale-x-[-1] pr-2'
      >
        <div className='scale-x-[-1] flex space-x-2 items-center'>
          <OctaveSelection
            visibleOctaveRef={visibleOctaveRef}
            scrollToOctave={scrollToOctave}
          />
          <SelectSampler />
        </div>
      </div>
    </div>
  );
}
