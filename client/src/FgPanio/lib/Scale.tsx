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
  visibleOctave,
}: {
  octave: number;
  visibleOctave: number;
}) {
  return (
    <div className='panio-scale'>
      <NaturalKey
        classname='panio-C'
        value='C'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.C : undefined
        }
      />
      <AccidentalKey
        classname='panio-CSharpDb'
        value='CSharpDb'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys.CSharpDb : undefined
        }
      />
      <NaturalKey
        classname='panio-D'
        value='D'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.D : undefined
        }
      />
      <AccidentalKey
        classname='panio-DSharpEb'
        value='DSharpEb'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys.DSharpEb : undefined
        }
      />
      <NaturalKey
        classname='panio-E'
        value='E'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.E : undefined
        }
      />
      <NaturalKey
        classname='panio-F'
        value='F'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.F : undefined
        }
      />
      <AccidentalKey
        classname='panio-FSharpGb'
        value='FSharpGb'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys.FSharpGb : undefined
        }
      />
      <NaturalKey
        classname='panio-G'
        value='G'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.G : undefined
        }
      />
      <AccidentalKey
        classname='panio-GSharpAb'
        value='GSharpAb'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys.GSharpAb : undefined
        }
      />
      <NaturalKey
        classname='panio-A'
        value='A'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.A : undefined
        }
      />
      <AccidentalKey
        classname='panio-ASharpBb'
        value='ASharpBb'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.accidentalKeys.ASharpBb : undefined
        }
      />
      <NaturalKey
        classname='panio-B'
        value='B'
        octave={octave}
        activationKey={
          octave === visibleOctave ? keys.naturalKeys.B : undefined
        }
      />
    </div>
  );
}
