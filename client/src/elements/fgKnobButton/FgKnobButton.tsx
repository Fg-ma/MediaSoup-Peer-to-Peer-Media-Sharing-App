import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const defaultKnobButtonOptions = {
  id: undefined,
  ticks: 6,
  rangeMax: 100,
  rangeMin: 0,
  precision: 1,
  units: undefined,
  snapToWholeNum: false,
  snapToNearestTick: false,
};

export interface KnobButtonOptions {
  id?: string;
  initValue?: number;
  topLabel?: string;
  bottomLabel?: string;
  ticks?: number;
  rangeMax?: number;
  rangeMin?: number;
  precision?: number;
  units?: string;
  snapToWholeNum?: boolean;
  snapToNearestTick?: boolean;
}

const rad = (angle: number) => (angle * Math.PI) / 180;

const x = (angle: number, radius: number) => Math.cos(rad(angle)) * radius + 50;
const y = (angle: number, radius: number) => Math.sin(rad(angle)) * radius + 50;

// Helper function to determine large arc flag
const largeArcFlag = (start: number, end: number) => {
  return Math.abs(end - start) > 180 ? 1 : 0;
};

// Helper function to determine sweep flag
const sweepFlag = (start: number, end: number) => {
  return end > start ? 1 : 0;
};

export default function FgKnobButton({
  height,
  options,
  onValueChange,
}: {
  height: number;
  options?: KnobButtonOptions;
  onValueChange?: (value: number, id?: string) => void;
}) {
  const fgKnobButtonOptions = {
    ...defaultKnobButtonOptions,
    ...options,
  };

  const getAngleFromValue = (value: number) => {
    const valuePercentage =
      (value - fgKnobButtonOptions.rangeMin) /
      (fgKnobButtonOptions.rangeMax - fgKnobButtonOptions.rangeMin);
    return valuePercentage * 270; // 270-degree range (-135 to 135 degrees)
  };

  const [value, setValue] = useState<number>(
    fgKnobButtonOptions.initValue !== undefined
      ? fgKnobButtonOptions.initValue
      : (fgKnobButtonOptions.rangeMax + fgKnobButtonOptions.rangeMin) / 2,
  );
  const [angle, setAngle] = useState<number>(getAngleFromValue(value));
  const [clicked, setClicked] = useState(false);
  const knobButtonRef = useRef<HTMLDivElement>(null);

  const ticks = Array.from({ length: fgKnobButtonOptions.ticks }, (_, i) => {
    return (i * 270) / (fgKnobButtonOptions.ticks - 1);
  });

  const radius = 40;
  const startAngle = 135;
  const endAngleSecondArc = startAngle + 270;

  const getValueFromAngle = (angle: number) => {
    const anglePercentage = angle / 270;
    let newValue =
      anglePercentage *
        (fgKnobButtonOptions.rangeMax - fgKnobButtonOptions.rangeMin) +
      fgKnobButtonOptions.rangeMin;

    if (fgKnobButtonOptions.snapToWholeNum) {
      newValue = Math.round(newValue);
    } else {
      newValue = parseFloat(newValue.toFixed(fgKnobButtonOptions.precision));
    }

    setAngle(getAngleFromValue(newValue));
    return newValue;
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!knobButtonRef.current) return;

    const rect = knobButtonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const pointerX = event.clientX;
    const pointerY = event.clientY;
    const angleRad = Math.atan2(pointerY - centerY, pointerX - centerX);
    let newAngle = (angleRad * 180) / Math.PI - 135;

    if (newAngle < 0) {
      newAngle += 360;
    }

    if (newAngle > 315) newAngle = 0;
    if (newAngle > 270 && newAngle <= 315) newAngle = 270;

    if (
      fgKnobButtonOptions.snapToNearestTick &&
      fgKnobButtonOptions.ticks > 1
    ) {
      const tickSpacing = 270 / (fgKnobButtonOptions.ticks - 1);
      newAngle = Math.round(newAngle / tickSpacing) * tickSpacing;
    }

    // Check if the angle is within 2 degrees of any tick
    const closestTick = ticks.find((tick) => Math.abs(newAngle - tick) <= 6);

    if (closestTick !== undefined) {
      newAngle = closestTick;
    }

    setValue(getValueFromAngle(newAngle));
  };

  const handlePointerUp = () => {
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);

    setClicked(false);
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    event.preventDefault();

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);

    handlePointerMove(event as unknown as PointerEvent);

    setClicked(true);
  };

  useEffect(() => {
    if (onValueChange) {
      onValueChange(value, fgKnobButtonOptions.id);
    }
  }, [value]);

  return (
    <div
      id={fgKnobButtonOptions.id}
      className={`flex aspect-square flex-col items-center justify-center`}
      style={{
        // prettier-ignore
        width: `calc(${height}rem - ${fgKnobButtonOptions.topLabel ? "1rem" : "0rem"} - ${fgKnobButtonOptions.bottomLabel ? "1rem" : "0rem"})`,
        height: `${height}rem`,
      }}
    >
      {fgKnobButtonOptions.topLabel && (
        <div className="cursor-default select-none font-K2D text-base leading-4 text-fg-off-white">
          {fgKnobButtonOptions.topLabel}
        </div>
      )}
      <div
        ref={knobButtonRef}
        className="relative aspect-square grow cursor-pointer"
        onPointerDown={handlePointerDown}
      >
        <svg className="h-full w-max" viewBox="0 0 100 100">
          {/* after path round*/}
          <circle
            className="fill-fg-off-white"
            cx={x(endAngleSecondArc, radius)}
            cy={y(endAngleSecondArc, radius)}
            r={5}
          />

          {/* before path round */}
          <circle
            className="fill-fg-red"
            cx={x(startAngle, radius)}
            cy={y(startAngle, radius)}
            r={5}
          />

          {/* before path */}
          <path
            className="stroke-fg-red"
            d={`M ${x(startAngle, radius)} ${y(
              startAngle,
              radius,
            )} A ${radius} ${radius} 0 ${largeArcFlag(
              startAngle,
              startAngle + angle,
            )} ${sweepFlag(startAngle, startAngle + angle)} ${x(
              startAngle + angle,
              radius,
            )} ${y(startAngle + angle, radius)}`}
            fill="none"
            strokeWidth={10}
          />

          {/* after path */}
          <path
            className="stroke-fg-off-white"
            d={`M ${x(startAngle + angle, radius)} ${y(
              startAngle + angle,
              radius,
            )} A ${radius} ${radius} 0 ${largeArcFlag(
              startAngle + angle,
              endAngleSecondArc,
            )} ${sweepFlag(startAngle + angle, endAngleSecondArc)} ${x(
              endAngleSecondArc,
              radius,
            )} ${y(endAngleSecondArc, radius)}`}
            fill="none"
            strokeWidth={10}
          />

          {/* ticks */}
          <AnimatePresence>
            {clicked &&
              ticks.map((tick, index) => (
                <motion.path
                  key={index}
                  className="stroke-fg-tone-black-5"
                  d={`M ${x(startAngle + tick, 34)} ${y(
                    startAngle + tick,
                    34,
                  )} L ${x(startAngle + tick, 46)} ${y(startAngle + tick, 46)}`}
                  fill="none"
                  strokeWidth={4}
                  strokeLinecap="round"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 1, pathLength: 1 }}
                  exit={{ opacity: 0, pathLength: 0 }}
                  transition={{ duration: 0.2 }}
                />
              ))}
          </AnimatePresence>

          {/* pointer path */}
          <path
            className="stroke-fg-tone-black-6"
            d={`M ${x(startAngle + angle, 28)} ${y(
              startAngle + angle,
              28,
            )} L ${x(startAngle + angle, 46)} ${y(startAngle + angle, 46)}`}
            fill="none"
            strokeWidth={5}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute left-1/2 top-1/2 z-[-1] flex -translate-x-1/2 -translate-y-1/2 cursor-default select-none flex-col items-center justify-center font-K2D text-sm leading-4 text-fg-off-white">
          <div>{value}</div>
          {fgKnobButtonOptions.units && <div>{fgKnobButtonOptions.units}</div>}
        </div>
      </div>
      {fgKnobButtonOptions.bottomLabel && (
        <div className="cursor-default select-none font-K2D text-base leading-4 text-fg-off-white">
          {fgKnobButtonOptions.bottomLabel}
        </div>
      )}
    </div>
  );
}
