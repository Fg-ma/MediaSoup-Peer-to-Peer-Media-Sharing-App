import React from "react";
import FgButton from "../../fgButton/FgButton";

export default function AccidentalKey({
  classname,
  value,
}: {
  classname?: string;
  value?: string;
}) {
  return <FgButton className={`accidental-key ${classname}`} />;
}
