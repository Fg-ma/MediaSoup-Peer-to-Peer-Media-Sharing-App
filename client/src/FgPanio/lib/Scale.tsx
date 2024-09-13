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
  visibleOctave,
}: {
  octave: number;
  visibleOctave: number;
}) {
  return (
    <div id={`piano_scale_${octave}`} className='piano-scale'>
      <NaturalKey
        classname='piano-C'
        note='C'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.C : undefined
        }
      />
      <AccidentalKey
        classname='piano-C#'
        note='C#'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys["C#"] : undefined
        }
      />
      <NaturalKey
        classname='piano-D'
        note='D'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.D : undefined
        }
      />
      <AccidentalKey
        classname='piano-D#'
        note='D#'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys["D#"] : undefined
        }
      />
      <NaturalKey
        classname='piano-E'
        note='E'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.E : undefined
        }
      />
      <NaturalKey
        classname='piano-F'
        note='F'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.F : undefined
        }
      />
      <AccidentalKey
        classname='piano-F#'
        note='F#'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys["F#"] : undefined
        }
      />
      <NaturalKey
        classname='piano-G'
        note='G'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.G : undefined
        }
      />
      <AccidentalKey
        classname='piano-G#'
        note='G#'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys["G#"] : undefined
        }
      />
      <NaturalKey
        classname='piano-A'
        note='A'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.A : undefined
        }
      />
      <AccidentalKey
        classname='piano-A#'
        note='A#'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys["A#"] : undefined
        }
      />
      <NaturalKey
        classname='piano-B'
        note='B'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.B : undefined
        }
      />
    </div>
  );
}
