import React from "react";
import NaturalKey from "./NaturalKey";
import AccidentalKey from "./AccidentalKey";

const activationKeys = {
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
          octave === visibleOctave ? activationKeys.naturalKeys.C : undefined
        }
      />
      <AccidentalKey
        classname='panio-C#-Db'
        value='C#-Db'
        octave={octave}
        activationKey={
          octave === visibleOctave
            ? activationKeys.accidentalKeys.CSharpDb
            : undefined
        }
      />
      <NaturalKey
        classname='panio-D'
        value='D'
        octave={octave}
        activationKey={
          octave === visibleOctave ? activationKeys.naturalKeys.D : undefined
        }
      />
      <AccidentalKey
        classname='panio-D#-Eb'
        value='D#-Eb'
        octave={octave}
        activationKey={
          octave === visibleOctave
            ? activationKeys.accidentalKeys.DSharpEb
            : undefined
        }
      />
      <NaturalKey
        classname='panio-E'
        value='E'
        octave={octave}
        activationKey={
          octave === visibleOctave ? activationKeys.naturalKeys.E : undefined
        }
      />
      <NaturalKey
        classname='panio-F'
        value='F'
        octave={octave}
        activationKey={
          octave === visibleOctave ? activationKeys.naturalKeys.F : undefined
        }
      />
      <AccidentalKey
        classname='panio-F#-Gb'
        value='F#-Gb'
        octave={octave}
        activationKey={
          octave === visibleOctave
            ? activationKeys.accidentalKeys.FSharpGb
            : undefined
        }
      />
      <NaturalKey
        classname='panio-G'
        value='G'
        octave={octave}
        activationKey={
          octave === visibleOctave ? activationKeys.naturalKeys.G : undefined
        }
      />
      <AccidentalKey
        classname='panio-G#-Ab'
        value='G#-Ab'
        octave={octave}
        activationKey={
          octave === visibleOctave
            ? activationKeys.accidentalKeys.GSharpAb
            : undefined
        }
      />
      <NaturalKey
        classname='panio-A'
        value='A'
        octave={octave}
        activationKey={
          octave === visibleOctave ? activationKeys.naturalKeys.A : undefined
        }
      />
      <AccidentalKey
        classname='panio-A#-Bb'
        value='A#-Bb'
        octave={octave}
        activationKey={
          octave === visibleOctave
            ? activationKeys.accidentalKeys.ASharpBb
            : undefined
        }
      />
      <NaturalKey
        classname='panio-B'
        value='B'
        octave={octave}
        activationKey={
          octave === visibleOctave ? activationKeys.naturalKeys.B : undefined
        }
      />
    </div>
  );
}
