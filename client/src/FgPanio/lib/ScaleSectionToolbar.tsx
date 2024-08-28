import React from "react";
import { AnimatePresence, Transition, Variants, motion } from "framer-motion";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import { Octaves } from "../FgPiano";
import navigateForward from "../../../public/svgs/navigateForward.svg";
import navigateBack from "../../../public/svgs/navigateBack.svg";

const navVar: Variants = {
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

const navTransition: Transition = {
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
    <div className='w-full h-8 flex mb-1 space-x-2 px-2'>
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
        <div className='mb-0.5'>Octave</div>
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
      <div className='font-K2D text-lg flex items-center justify-center space-x-1'>
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
        />
        <FgButton contentFunction={() => <div className='mb-0.5'>Panio</div>} />
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
          animationOptions={{
            variants: navVar,
            transition: navTransition,
            whileHover: "hover",
          }}
        />
      </div>
    </div>
  );
}
