import React from "react";
import FgPortal from "../../../elements/fgPortal/FgPortal";

export default function SliderValuePortal({
  value,
  precision,
  units,
}: {
  value: number;
  precision: number;
  units?: string;
}) {
  return (
    <FgPortal
      type="mouse"
      mouseType="topRight"
      content={
        <div className="slider-value-portal text-md h-min w-max rounded bg-fg-white p-1 font-K2D shadow">
          {value.toFixed(precision)} {units && units}
        </div>
      }
    />
  );
}
