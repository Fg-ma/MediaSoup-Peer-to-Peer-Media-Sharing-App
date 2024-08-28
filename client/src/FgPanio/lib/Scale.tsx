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
        classname='piano-CSharpDb'
        note='CSharpDb'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys.CSharpDb : undefined
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
        classname='piano-DSharpEb'
        note='DSharpEb'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys.DSharpEb : undefined
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
        classname='piano-FSharpGb'
        note='FSharpGb'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys.FSharpGb : undefined
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
        classname='piano-GSharpAb'
        note='GSharpAb'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys.GSharpAb : undefined
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
        classname='piano-ASharpBb'
        note='ASharpBb'
        octave={octave}
        playNote={playNote}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys.ASharpBb : undefined
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
