import React from "react";
import FgButton from "../../fgButton/FgButton";

export default function NaturalKey({
  classname,
  value,
}: {
  classname?: string;
  value?: string;
}) {
  return <FgButton className={`natural-key ${classname}`} />;
}
