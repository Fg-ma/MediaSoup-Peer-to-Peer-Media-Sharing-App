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
  const naturalKeyRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = () => {
    naturalKeyRef.current?.classList.add("pressed");

    playNote(note, octave);
  };

  const handleMouseUp = () => {
    naturalKeyRef.current?.classList.remove("pressed");
  };

  return (
    <FgButton
      externalId={`paino_key_${octave}_${note}`}
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
          {note === "C" && (
            <div className='natural-key-c'>{note + `${octave}` ?? ""}</div>
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
