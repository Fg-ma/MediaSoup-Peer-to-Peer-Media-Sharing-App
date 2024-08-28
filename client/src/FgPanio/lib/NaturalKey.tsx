import React, { useRef, useState } from "react";
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
  playNote: (note: string, octave: number, isPress: boolean) => void;
  activationKey?: string;
}) {
  const naturalKeyRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = () => {
    naturalKeyRef.current?.classList.add("pressed");

    playNote(note, octave, true);
  };

  const handleMouseUp = () => {
    naturalKeyRef.current?.classList.remove("pressed");

    playNote(note, octave, false);
  };

  return (
    <FgButton
      externalId={`piano_key_${octave}_${note}`}
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
                data-note={note}
                data-octave={octave}
              >
                {activationKey}
              </motion.div>
            )}
          </AnimatePresence>
          {note === "C" && (
            <div
              className='natural-key-c'
              data-note={note}
              data-octave={octave}
            >
              {note + `${octave}`}
            </div>
          )}{" "}
          {note !== "C" && (
            <div
              className='natural-key-hint'
              data-note={note}
              data-octave={octave}
            >
              {note}
            </div>
          )}
          <div
            className='natural-key-accent'
            data-note={note}
            data-octave={octave}
          ></div>
        </>
      )}
      mouseDownFunction={handleMouseDown}
      mouseUpFunction={handleMouseUp}
      style={{ cursor: "default" }}
      data-note={note}
      data-octave={octave}
    />
  );
}
