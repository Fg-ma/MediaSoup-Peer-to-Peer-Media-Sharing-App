import React from "react";
import FgButton from "../../fgButton/FgButton";

export default function AccidentalKey({
  classname,
  value,
  octave,
  activationKey,
}: {
  classname?: string;
  value: string;
  octave: number;
  activationKey?: string;
}) {
  return (
    <FgButton
      className={`accidental-key ${classname}`}
      contentFunction={() => <div className='accidental-key-accent'></div>}
    />
  );
}
