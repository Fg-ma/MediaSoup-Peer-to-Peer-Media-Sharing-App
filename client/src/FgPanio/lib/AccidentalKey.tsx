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
  playNote,
  activationKey,
  fgPianoController,
  keyVisualizerActiveRef,
  visualizerAnimationFrameRef,
  keysPressed,
  setKeyPresses,
}: {
  classname?: string;
  note: string;
  octave: number;
  playNote: (note: string, octave: number, isPress: boolean) => void;
  activationKey?: string;
  fgPianoController: FgPianoController;
  keyVisualizerActiveRef: React.MutableRefObject<boolean>;
  visualizerAnimationFrameRef: React.MutableRefObject<number | undefined>;
  keysPressed: React.MutableRefObject<string[]>;
  setKeyPresses: React.Dispatch<
    React.SetStateAction<{
      [key: string]: {
        currentlyPressed: boolean;
        height: number;
        bottom: number;
      }[];
    }>
  >;
}) {
  const accidentalKeyRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = () => {
    if (!keysPressed.current.includes(note)) {
      accidentalKeyRef.current?.classList.add("pressed");
      playNote(note, octave, true);
    }

    if (keyVisualizerActiveRef.current && !keysPressed.current.includes(note)) {
      if (visualizerAnimationFrameRef.current === undefined) {
        // Start the animation loop to update continuously
        visualizerAnimationFrameRef.current = requestAnimationFrame(
          fgPianoController.updateVisualizerAnimations
        );
      }

      setKeyPresses((prevKeyPresses) => {
        const key = `${note}-fg-${octave}`;

        const currentKeyPresses = prevKeyPresses[key] || [];

        const newKeyPresses = {
          ...prevKeyPresses,
          [key]: [
            ...currentKeyPresses,
            {
              currentlyPressed: true,
              height: 0,
              bottom: 0,
            },
          ],
        };

        return newKeyPresses;
      });
    }
  };

  const handleMouseUp = () => {
    accidentalKeyRef.current?.classList.remove("pressed");
    playNote(note, octave, false);

    if (keyVisualizerActiveRef.current) {
      setKeyPresses((prevKeyPresses) => {
        const key = `${note}-fg-${octave}`;

        const updatedKeyPressArray = prevKeyPresses[key]
          ? [...prevKeyPresses[key]]
          : [];

        if (keyVisualizerActiveRef.current) {
          const lastEntry = updatedKeyPressArray.pop();
          if (lastEntry) {
            lastEntry.currentlyPressed = false;

            const newKeyPresses = {
              ...prevKeyPresses,
              [key]: [...updatedKeyPressArray, lastEntry],
            };

            return newKeyPresses;
          } else {
            return prevKeyPresses;
          }
        } else {
          const newKeyPresses = {
            ...prevKeyPresses,
          };

          delete newKeyPresses[key];

          return newKeyPresses;
        }
      });
    }
  };

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
      mouseDownFunction={handleMouseDown}
      mouseUpFunction={handleMouseUp}
      style={{ cursor: "default" }}
      data-note={note}
      data-octave={octave}
    />
  );
}
