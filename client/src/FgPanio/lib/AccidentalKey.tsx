import React, { useRef } from "react";
import FgButton from "../../fgButton/FgButton";
import { AnimatePresence, motion, Transition, Variants } from "framer-motion";
import FgPianoController from "./FgPianoController";

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
  activationKey,
}: {
  classname?: string;
  note: string;
  octave: number;
  activationKey?: string;
}) {
  const getNextNote = (note: string) => {
    const notes = ["C", "D", "E", "F", "G", "A", "B"];
    const index = notes.indexOf(note);

    if (index === -1) {
      return "";
    }

    // Get the next note index and wrap around if needed
    const nextIndex = (index + 1) % notes.length;
    return notes[nextIndex];
  };

  return (
    <FgButton
      externalId={`piano_key_${octave}_${note}`}
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
                data-note={note}
                data-octave={octave}
              >
                {activationKey}
              </motion.div>
            )}
          </AnimatePresence>
          <div
            className='accidental-key-accent'
            data-note={note}
            data-octave={octave}
          ></div>
          <div
            className='accidental-key-hint accidental-key-hint-upper'
            data-note={note}
            data-octave={octave}
          >
            {note}
          </div>
          <div
            className='accidental-key-hint accidental-key-hint-lower'
            data-note={note}
            data-octave={octave}
          >{`${getNextNote(note[0])}b`}</div>
        </>
      )}
      style={{ cursor: "default" }}
      data-note={note}
      data-octave={octave}
    />
  );
}
