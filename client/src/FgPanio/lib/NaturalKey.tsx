import React from "react";
import FgButton from "../../fgButton/FgButton";

export default function NaturalKey({
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
      className={`natural-key ${classname}`}
      contentFunction={() => (
        <div className='natural-key-accent'>
          {activationKey && (
            <div className='natural-key-acivation-key'>{activationKey}</div>
          )}
          {value === "C" && (
            <div className='natural-key-c'>{value + `${octave}` ?? ""}</div>
          )}
        </div>
      )}
    />
  );
}
