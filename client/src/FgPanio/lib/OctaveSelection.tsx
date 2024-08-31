import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import { Octaves } from "../FgPiano";
import navigateForward from "../../../public/svgs/navigateForward.svg";
import navigateBack from "../../../public/svgs/navigateBack.svg";
import { navTransition, navVar } from "./ScaleSectionToolbar";
import FgPortal from "../../fgPortal/FgPortal";

export default function OctaveSelection({
  toolbarRef,
  visibleOctaveRef,
  scrollToOctave,
}: {
  toolbarRef: React.RefObject<HTMLDivElement>;
  visibleOctaveRef: React.MutableRefObject<Octaves>;
  scrollToOctave: (octave: Octaves) => void;
}) {
  const [hover, setHover] = useState(false);
  const octaveDivRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    document.addEventListener("mousemove", handleMouseMove);

    setHover(true);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (
      octaveDivRef.current &&
      !octaveDivRef.current.contains(event.target as Node)
    ) {
      document.removeEventListener("mousemove", handleMouseMove);

      setHover(false);
    }
  };

  return (
    <div className='font-K2D text-lg flex items-center justify-center space-x-1'>
      <AnimatePresence>
        {visibleOctaveRef.current !== 0 && (
          <motion.div
            variants={navVar}
            initial='leftInit'
            animate='leftAnimate'
            exit='leftInit'
            transition={navTransition}
          >
            <FgButton
              className='w-6 aspect-square rounded-full flex items-center justify-center pr-0.5'
              contentFunction={() => (
                <FgSVG
                  src={navigateBack}
                  attributes={[
                    { key: "height", value: "1rem" },
                    { key: "width", value: "1rem" },
                  ]}
                />
              )}
              animationOptions={{
                variants: navVar,
                transition: navTransition,
                whileHover: "hover",
              }}
              clickFunction={() =>
                scrollToOctave((visibleOctaveRef.current - 1) as Octaves)
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div
        ref={octaveDivRef}
        className='mb-0.5 cursor-default select-none truncate grow'
        onMouseEnter={handleMouseEnter}
      >
        {toolbarRef.current && toolbarRef.current.clientWidth > 400 && "Octave"}{" "}
        {visibleOctaveRef.current}
      </div>
      {hover && (
        <FgPortal
          type='below'
          content={
            <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
              Octave
            </div>
          }
          externalRef={octaveDivRef}
        />
      )}
      <AnimatePresence>
        {visibleOctaveRef.current !== 6 && (
          <motion.div
            variants={navVar}
            initial='rightInit'
            animate='rightAnimate'
            exit='rightInit'
            transition={navTransition}
          >
            <FgButton
              className='w-6 aspect-square rounded-full flex items-center justify-center pl-0.5'
              contentFunction={() => (
                <FgSVG
                  src={navigateForward}
                  attributes={[
                    { key: "height", value: "1rem" },
                    { key: "width", value: "1rem" },
                  ]}
                />
              )}
              clickFunction={() =>
                scrollToOctave((visibleOctaveRef.current + 1) as Octaves)
              }
              animationOptions={{
                variants: navVar,
                transition: navTransition,
                whileHover: "hover",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
