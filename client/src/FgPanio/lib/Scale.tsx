import React from "react";
import NaturalKey from "./NaturalKey";
import AccidentalKey from "./AccidentalKey";

export default function Scale() {
  return (
    <div className='panio-scale'>
      <NaturalKey classname='panio-C' value='C' />
      <AccidentalKey classname='panio-C#-Db' value='C#-Db' />
      <NaturalKey classname='panio-D' value='D' />
      <AccidentalKey classname='panio-D#-Eb' value='D#-Eb' />
      <NaturalKey classname='panio-E' value='E' />
      <NaturalKey classname='panio-F' value='F' />
      <AccidentalKey classname='panio-F#-Gb' value='F#-Gb' />
      <NaturalKey classname='panio-G' value='G' />
      <AccidentalKey classname='panio-G#-Ab' value='G#-Ab' />
      <NaturalKey classname='panio-A' value='A' />
      <AccidentalKey classname='panio-A#-Bb' value='A#-Bb' />
      <NaturalKey classname='panio-B' value='B' />
    </div>
  );
}
