import React, { useRef } from "react";
import FgButton from "../../fgButton/FgButton";
import { AnimatePresence, motion, Transition, Variants } from "framer-motion";

const NaturalKeyVar: Variants = {
  init: { opacity: 0, bottom: "2.5%" },
  animate: {
    opacity: 1,
    bottom: "5%",
  },
};

const NaturalKeyTransition: Transition = {
  transition: {
    opacity: { duration: 0.025 },
    bottom: { duration: 0.025 },
  },
};

export default function NaturalKey({
  classname,
  value,
  octave,
  activationKey,
}: {
  classname?: string;
  value: string;
  octave: number;
  activationKey?: string;
}) {
  const naturalKeyRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = () => {
    naturalKeyRef.current?.classList.add("pressed");
  };

  const handleMouseUp = () => {
    naturalKeyRef.current?.classList.remove("pressed");
  };

  return (
    <FgButton
      externalId={`paino_key_${octave}_${value}`}
      externalRef={naturalKeyRef}
      className={`natural-key ${classname}`}
      contentFunction={() => (
        <>
          <AnimatePresence>
            {activationKey && (
              <motion.div
                className='natural-key-acivation-key'
                variants={NaturalKeyVar}
                initial='init'
                animate='animate'
                exit='init'
                transition={NaturalKeyTransition}
              >
                {activationKey}
              </motion.div>
            )}
          </AnimatePresence>
          {value === "C" && (
            <div className='natural-key-c'>{value + `${octave}` ?? ""}</div>
          )}
          <div className='natural-key-accent'></div>
        </>
      )}
      mouseDownFunction={handleMouseDown}
      mouseUpFunction={handleMouseUp}
      style={{ cursor: "default" }}
    />
  );
}
