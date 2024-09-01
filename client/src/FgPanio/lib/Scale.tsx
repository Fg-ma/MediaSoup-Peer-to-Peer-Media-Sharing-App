import React from "react";
import NaturalKey from "./NaturalKey";
import AccidentalKey from "./AccidentalKey";

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
}: {
  octave: number;
  playNote: (note: string, octave: number, isPressed: boolean) => void;
  visibleOctave: number;
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
      />
      <AccidentalKey
        classname='piano-C#'
        note='C#'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys["C#"] : undefined
        }
      />
      <NaturalKey
        classname='piano-D'
        note='D'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.D : undefined
        }
      />
      <AccidentalKey
        classname='piano-D#'
        note='D#'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys["D#"] : undefined
        }
      />
      <NaturalKey
        classname='piano-E'
        note='E'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.E : undefined
        }
      />
      <NaturalKey
        classname='piano-F'
        note='F'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.F : undefined
        }
      />
      <AccidentalKey
        classname='piano-F#'
        note='F#'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys["F#"] : undefined
        }
      />
      <NaturalKey
        classname='piano-G'
        note='G'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.G : undefined
        }
      />
      <AccidentalKey
        classname='piano-G#'
        note='G#'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys["G#"] : undefined
        }
      />
      <NaturalKey
        classname='piano-A'
        note='A'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.A : undefined
        }
      />
      <AccidentalKey
        classname='piano-A#'
        note='A#'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys["A#"] : undefined
        }
      />
      <NaturalKey
        classname='piano-B'
        note='B'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.B : undefined
        }
      />
    </div>
  );
}
