import React, { useEffect, useRef } from "react";
import { Transition, Variants, motion } from "framer-motion";
import { Octaves } from "../FgPiano";
import SelectSampler from "./SelectSampler";
import SamplerVolume from "./SamplerVolume";
import OctaveSelection from "./OctaveSelection";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import FgPianoController from "./FgPianoController";

import effectIcon from "../../../public/svgs/effectIcon.svg";
import effectOffIcon from "../../../public/svgs/effectOffIcon.svg";
import keyVisualizerIcon from "../../../public/svgs/audioEffects/keyVisualizerIcon.svg";
import keyVisualizerOffIcon from "../../../public/svgs/audioEffects/keyVisualizerOffIcon.svg";
import SamplerMetronome from "./SamplerMetronome";

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

export default function SamplerToolbar({
  focus,
  fgPianoController,
  visibleOctaveRef,
  samplerEffectsActive,
  setSamplerEffectsActive,
  keyVisualizerActive,
  setKeyVisualizerActive,
  keyVisualizerActiveRef,
}: {
  focus: boolean;
  fgPianoController: FgPianoController;
  visibleOctaveRef: React.MutableRefObject<Octaves>;
  samplerEffectsActive: boolean;
  setSamplerEffectsActive: React.Dispatch<React.SetStateAction<boolean>>;
  keyVisualizerActive: boolean;
  setKeyVisualizerActive: React.Dispatch<React.SetStateAction<boolean>>;
  keyVisualizerActiveRef: React.MutableRefObject<boolean>;
}) {
  const rightScaleSectionToolbarRef = useRef<HTMLDivElement>(null);

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (rightScaleSectionToolbarRef.current) {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        rightScaleSectionToolbarRef.current.scrollLeft -= event.deltaX / 2;
      } else {
        rightScaleSectionToolbarRef.current.scrollLeft -= event.deltaY / 2;
      }
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
    <div className='w-full h-8 flex justify-between px-2 mb-1'>
      <motion.div
        className='w-max h-8 z-20 flex items-center space-x-2 pr-2 asp'
        animate={{
          boxShadow: `8px 0 4px -3px  ${
            focus ? "rgb(255, 255, 255)" : "rgba(243, 243, 243)"
          }`,
        }}
        transition={{
          boxShadow: { duration: 0.3, ease: "linear" },
        }}
      >
        <FgButton
          contentFunction={() => {
            const iconSrc = keyVisualizerActive
              ? keyVisualizerOffIcon
              : keyVisualizerIcon;

            return (
              <FgSVG
                src={iconSrc}
                attributes={[
                  { key: "height", value: "95%" },
                  { key: "width", value: "95%" },
                  { key: "fill", value: "black" },
                  { key: "stroke", value: "black" },
                ]}
              />
            );
          }}
          clickFunction={() => {
            setKeyVisualizerActive((prev) => !prev);
            keyVisualizerActiveRef.current = !keyVisualizerActiveRef.current;
          }}
          hoverContent={
            <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
              {samplerEffectsActive ? "Close key visualizer" : "Key visualizer"}
            </div>
          }
          className='flex items-center justify-center h-8 min-h-8 aspect-square relative'
          options={{ hoverType: "below", hoverTimeoutDuration: 750 }}
        />
        <FgButton
          contentFunction={() => {
            const iconSrc = samplerEffectsActive ? effectOffIcon : effectIcon;

            return (
              <FgSVG
                src={iconSrc}
                attributes={[
                  { key: "height", value: "95%" },
                  { key: "width", value: "95%" },
                  { key: "fill", value: "black" },
                  { key: "stroke", value: "black" },
                ]}
              />
            );
          }}
          clickFunction={() => {
            setSamplerEffectsActive((prev) => !prev);
          }}
          hoverContent={
            <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
              {samplerEffectsActive ? "Close effects" : "Effects"}
            </div>
          }
          className='flex items-center justify-center h-8 min-h-8 aspect-square relative'
          options={{ hoverType: "below", hoverTimeoutDuration: 750 }}
        />
        <SamplerMetronome />
        <SamplerVolume />
      </motion.div>
      <div
        ref={rightScaleSectionToolbarRef}
        className='w-max h-8 overflow-x-auto z-10 flex items-center space-x-2 scale-x-[-1] pr-2'
      >
        <div className='scale-x-[-1] flex space-x-2 items-center'>
          <OctaveSelection
            visibleOctaveRef={visibleOctaveRef}
            scrollToOctave={fgPianoController.scrollToOctave}
          />
          <SelectSampler />
        </div>
      </div>
    </div>
  );
}
