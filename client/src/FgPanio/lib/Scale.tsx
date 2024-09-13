import React from "react";
import NaturalKey from "./NaturalKey";
import AccidentalKey from "./AccidentalKey";
import FgPianoController from "./FgPianoController";

export const keys = {
  naturalKeys: {
    C: "S",
    D: "D",
    E: "F",
    F: "J",
    G: "K",
    A: "L",
    B: ";",
  },
  accidentalKeys: {
    ["C#"]: "E",
    ["D#"]: "R",
    ["F#"]: "I",
    ["G#"]: "O",
    ["A#"]: "P",
  },
};

export default function Scale({
  octave,
  playNote,
  visibleOctave,
  fgPianoController,
  keyVisualizerActiveRef,
  visualizerAnimationFrameRef,
  keysPressed,
  setKeyPresses,
}: {
  octave: number;
  playNote: (note: string, octave: number, isPressed: boolean) => void;
  visibleOctave: number;
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
  return (
    <div id={`piano_scale_${octave}`} className='piano-scale'>
      <NaturalKey
        classname='piano-C'
        note='C'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.C : undefined
        }
        fgPianoController={fgPianoController}
        keyVisualizerActiveRef={keyVisualizerActiveRef}
        visualizerAnimationFrameRef={visualizerAnimationFrameRef}
        keysPressed={keysPressed}
        setKeyPresses={setKeyPresses}
      />
      <AccidentalKey
        classname='piano-C#'
        note='C#'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys["C#"] : undefined
        }
        fgPianoController={fgPianoController}
        keyVisualizerActiveRef={keyVisualizerActiveRef}
        visualizerAnimationFrameRef={visualizerAnimationFrameRef}
        keysPressed={keysPressed}
        setKeyPresses={setKeyPresses}
      />
      <NaturalKey
        classname='piano-D'
        note='D'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.D : undefined
        }
        fgPianoController={fgPianoController}
        keyVisualizerActiveRef={keyVisualizerActiveRef}
        visualizerAnimationFrameRef={visualizerAnimationFrameRef}
        keysPressed={keysPressed}
        setKeyPresses={setKeyPresses}
      />
      <AccidentalKey
        classname='piano-D#'
        note='D#'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys["D#"] : undefined
        }
        fgPianoController={fgPianoController}
        keyVisualizerActiveRef={keyVisualizerActiveRef}
        visualizerAnimationFrameRef={visualizerAnimationFrameRef}
        keysPressed={keysPressed}
        setKeyPresses={setKeyPresses}
      />
      <NaturalKey
        classname='piano-E'
        note='E'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.E : undefined
        }
        fgPianoController={fgPianoController}
        keyVisualizerActiveRef={keyVisualizerActiveRef}
        visualizerAnimationFrameRef={visualizerAnimationFrameRef}
        keysPressed={keysPressed}
        setKeyPresses={setKeyPresses}
      />
      <NaturalKey
        classname='piano-F'
        note='F'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.F : undefined
        }
        fgPianoController={fgPianoController}
        keyVisualizerActiveRef={keyVisualizerActiveRef}
        visualizerAnimationFrameRef={visualizerAnimationFrameRef}
        keysPressed={keysPressed}
        setKeyPresses={setKeyPresses}
      />
      <AccidentalKey
        classname='piano-F#'
        note='F#'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys["F#"] : undefined
        }
        fgPianoController={fgPianoController}
        keyVisualizerActiveRef={keyVisualizerActiveRef}
        visualizerAnimationFrameRef={visualizerAnimationFrameRef}
        keysPressed={keysPressed}
        setKeyPresses={setKeyPresses}
      />
      <NaturalKey
        classname='piano-G'
        note='G'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.G : undefined
        }
        fgPianoController={fgPianoController}
        keyVisualizerActiveRef={keyVisualizerActiveRef}
        visualizerAnimationFrameRef={visualizerAnimationFrameRef}
        keysPressed={keysPressed}
        setKeyPresses={setKeyPresses}
      />
      <AccidentalKey
        classname='piano-G#'
        note='G#'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys["G#"] : undefined
        }
        fgPianoController={fgPianoController}
        keyVisualizerActiveRef={keyVisualizerActiveRef}
        visualizerAnimationFrameRef={visualizerAnimationFrameRef}
        keysPressed={keysPressed}
        setKeyPresses={setKeyPresses}
      />
      <NaturalKey
        classname='piano-A'
        note='A'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.A : undefined
        }
        fgPianoController={fgPianoController}
        keyVisualizerActiveRef={keyVisualizerActiveRef}
        visualizerAnimationFrameRef={visualizerAnimationFrameRef}
        keysPressed={keysPressed}
        setKeyPresses={setKeyPresses}
      />
      <AccidentalKey
        classname='piano-A#'
        note='A#'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys["A#"] : undefined
        }
        fgPianoController={fgPianoController}
        keyVisualizerActiveRef={keyVisualizerActiveRef}
        visualizerAnimationFrameRef={visualizerAnimationFrameRef}
        keysPressed={keysPressed}
        setKeyPresses={setKeyPresses}
      />
      <NaturalKey
        classname='piano-B'
        note='B'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.B : undefined
        }
        fgPianoController={fgPianoController}
        keyVisualizerActiveRef={keyVisualizerActiveRef}
        visualizerAnimationFrameRef={visualizerAnimationFrameRef}
        keysPressed={keysPressed}
        setKeyPresses={setKeyPresses}
      />
    </div>
  );
}
