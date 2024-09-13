import React, { useRef } from "react";
import FgButton from "../../fgButton/FgButton";
import { AnimatePresence, motion, Transition, Variants } from "framer-motion";
import FgPianoController from "./FgPianoController";

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
  const naturalKeyRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = () => {
    if (!keysPressed.current.includes(note)) {
      naturalKeyRef.current?.classList.add("pressed");
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
    naturalKeyRef.current?.classList.remove("pressed");
    playNote(note, octave, false);

    if (keyVisualizerActiveRef.current) {
      setKeyPresses((prevKeyPresses) => {
        const key = `${note}-fg-${octave}`;

        const updatedKeyPressArray = prevKeyPresses[key]
          ? [...prevKeyPresses[key]]
          : [];

        if (updatedKeyPressArray.length > 0) {
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
          )}
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
