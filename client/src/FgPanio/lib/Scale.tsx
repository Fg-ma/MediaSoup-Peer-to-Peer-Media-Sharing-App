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
    CSharpDb: "E",
    DSharpEb: "R",
    FSharpGb: "I",
    GSharpAb: "O",
    ASharpBb: "P",
  },
};

export default function Scale({
  octave,
  playNote,
  visibleOctave,
}: {
  octave: number;
  playNote: (note: string, octave: number) => void;
  visibleOctave: number;
}) {
  return (
    <div className='panio-scale'>
      <NaturalKey
        classname='panio-C'
        note='C'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.C : undefined
        }
      />
      <AccidentalKey
        classname='panio-CSharpDb'
        note='CSharpDb'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys.CSharpDb : undefined
        }
      />
      <NaturalKey
        classname='panio-D'
        note='D'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.D : undefined
        }
      />
      <AccidentalKey
        classname='panio-DSharpEb'
        note='DSharpEb'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys.DSharpEb : undefined
        }
      />
      <NaturalKey
        classname='panio-E'
        note='E'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.E : undefined
        }
      />
      <NaturalKey
        classname='panio-F'
        note='F'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.F : undefined
        }
      />
      <AccidentalKey
        classname='panio-FSharpGb'
        note='FSharpGb'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys.FSharpGb : undefined
        }
      />
      <NaturalKey
        classname='panio-G'
        note='G'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.G : undefined
        }
      />
      <AccidentalKey
        classname='panio-GSharpAb'
        note='GSharpAb'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys.GSharpAb : undefined
        }
      />
      <NaturalKey
        classname='panio-A'
        note='A'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.A : undefined
        }
      />
      <AccidentalKey
        classname='panio-ASharpBb'
        note='ASharpBb'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys.ASharpBb : undefined
        }
      />
      <NaturalKey
        classname='panio-B'
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
