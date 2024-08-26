import React, { useRef } from "react";
import FgButton from "../../fgButton/FgButton";
import { AnimatePresence, motion, Transition, Variants } from "framer-motion";

const AccidentalKeyVar: Variants = {
  init: { opacity: 0, bottom: "9.5%" },
  animate: {
    opacity: 1,
    bottom: "12%",
  },
};

const AccidentalKeyTransition: Transition = {
  transition: {
    opacity: { duration: 0.025 },
    bottom: { duration: 0.025 },
  },
};

export default function AccidentalKey({
  classname,
  note,
  octave,
  playNote,
  activationKey,
}: {
  classname?: string;
  note: string;
  octave: number;
  playNote: (note: string, octave: number) => void;
  activationKey?: string;
}) {
  const accidentalKeyRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = () => {
    accidentalKeyRef.current?.classList.add("pressed");

    playNote(note, octave);
  };

  const handleMouseUp = () => {
    accidentalKeyRef.current?.classList.remove("pressed");
  };

  return (
    <FgButton
      externalId={`paino_key_${octave}_${note}`}
      externalRef={accidentalKeyRef}
      className={`accidental-key ${classname}`}
      contentFunction={() => (
        <>
          <AnimatePresence>
            {activationKey && (
              <motion.div
                className='accidental-key-acivation-key'
                variants={AccidentalKeyVar}
                initial='init'
                animate='animate'
                exit='init'
                transition={AccidentalKeyTransition}
              >
                {activationKey}
              </motion.div>
            )}
          </AnimatePresence>
          <div className='accidental-key-accent'></div>
        </>
      )}
      mouseDownFunction={handleMouseDown}
      mouseUpFunction={handleMouseUp}
      style={{ cursor: "default" }}
    />
  );
}
