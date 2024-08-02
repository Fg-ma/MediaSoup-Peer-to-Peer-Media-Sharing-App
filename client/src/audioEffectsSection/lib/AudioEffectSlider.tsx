import React, { useState, useRef } from "react";
import SliderValuePortal from "./SliderValuePortal";
import { motion, AnimatePresence, Variants, Transition } from "framer-motion";

const tickVar: Variants = {
  horizontalInit: {
    opacity: 0,
    scale: 0.8,
    x: "-50%",
  },
  verticalInit: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 100 },
    },
  },
};

const tickTransition: Transition = {
  transition: {
    opacity: { duration: 0.15 },
  },
};

export default function AudioEffectSlider({
  topLabel,
  bottomLabel,
  ticks = 6,
  rangeMax = 100,
  rangeMin = 0,
  precision = 1,
  units,
  orientation = "vertical",
  snapToWholeNum = false,
}: {
  topLabel?: string;
  bottomLabel?: string;
  ticks?: number;
  rangeMax?: number;
  rangeMin?: number;
  precision?: number;
  units?: string;
  orientation?: "vertical" | "horizontal";
  snapToWholeNum?: boolean;
}) {
  const [sliding, setSliding] = useState(false);
  const [handleHovering, setHandleHovering] = useState(false);
  const [tickHovering, setTickHovering] = useState(false);
  const [value, setValue] = useState((rangeMax - Math.abs(rangeMin)) / 2);
  const [styleValue, setStyleValue] = useState(50);
  const handleRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tickPositions = useRef<number[]>(
    Array.from({ length: ticks }, (_, i) => {
      const positionPercent = (i / (ticks - 1)) * 90 + 5;
      return positionPercent;
    })
  );
  const snapValues = useRef<number[]>(
    Array.from({ length: ticks }, (_, i) => {
      const positionPercent = (i / (ticks - 1)) * 100;
      return positionPercent;
    })
  );

  const rescaleValue = (
    value: number,
    fromRange: [number, number],
    toRange: [number, number]
  ): number => {
    const [fromMin, fromMax] = fromRange;
    const [toMin, toMax] = toRange;

    // Normalize the value to a 0-1 range
    const normalizedValue = (value - fromMin) / (fromMax - fromMin);

    // Scale it to the new range
    return toMin + normalizedValue * (toMax - toMin);
  };

  const snapPositions = (value: number): number => {
    const threshold = 2;
    for (let i = 0; i < snapValues.current.length; i++) {
      if (Math.abs(value - snapValues.current[i]) <= threshold) {
        return snapValues.current[i];
      }
    }

    return value;
  };

  const handleMouseMove = (event: React.MouseEvent | MouseEvent) => {
    if (!trackRef.current) {
      return;
    }

    const trackRect = trackRef.current.getBoundingClientRect();

    let offset: number | undefined;
    if (orientation === "vertical") {
      offset = ((trackRect.bottom - event.clientY) / trackRect.height) * 100;
    } else if (orientation === "horizontal") {
      offset = ((event.clientX - trackRect.left) / trackRect.width) * 100;
    }

    if (!offset) {
      return;
    }

    const newValue = Math.max(
      0,
      Math.min(100, rescaleValue(offset, [5, 95], [0, 100]))
    );
    let newValueState = rescaleValue(
      snapPositions(newValue),
      [0, 100],
      [rangeMin, rangeMax]
    );

    // Snap to whole number if enabled
    if (snapToWholeNum) {
      newValueState = Math.round(newValueState);
    }

    setValue(newValueState);
    setStyleValue(
      Math.max(
        5,
        Math.min(95, rescaleValue(newValueState, [rangeMin, rangeMax], [5, 95]))
      )
    );
  };

  const handleMouseUp = () => {
    setSliding(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setSliding(true);
    handleMouseMove(event);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className={`flex items-center justify-center relative flex-col
        ${orientation === "vertical" ? "w-16 h-full" : ""}
        ${orientation === "horizontal" ? "h-16 w-full" : ""}
      `}
    >
      {topLabel && (
        <div
          className={`text-black text-base font-K2D w-full max-w-full overflow-wrap-break-word break-words hyphens-auto flex justify-center items-center
            ${orientation === "vertical" ? "text-center" : ""}
            ${orientation === "horizontal" ? "text-start absolute top-0.5" : ""}
          `}
        >
          <div className='grow'>{topLabel}</div>
          {tickHovering && units && orientation === "horizontal" && (
            <AnimatePresence>
              <motion.div
                className='w-max'
                variants={tickVar}
                initial='init'
                animate='animate'
                exit='init'
                transition={tickTransition}
              >
                {units}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}
      <div
        className={`flex items-center justify-center
          ${orientation === "vertical" ? "w-full grow" : ""}
          ${orientation === "horizontal" ? "py-1 w-full" : ""}
        `}
      >
        <div
          className={`vertical-slider-track relative cursor-pointer rounded
            ${orientation === "vertical" ? "w-2.5 h-full" : ""}
            ${orientation === "horizontal" ? "h-2.5 w-full" : ""}
          `}
          style={{
            background: `linear-gradient(to ${
              orientation === "vertical"
                ? "top"
                : orientation === "horizontal"
                ? "right"
                : "top"
            }, #F56114 ${styleValue}%, #e6e6e6 ${styleValue}%)`,
            boxShadow: sliding ? "inset 0 0 1.25px rgba(0, 0, 0, 0.3)" : "",
          }}
          ref={trackRef}
          onMouseDown={handleMouseDown}
        >
          {tickPositions.current.map((pos, index) => (
            <div key={pos}>
              <div
                className={`absolute bg-black rounded-1.5
                  ${
                    orientation === "vertical"
                      ? "w-3.5 h-1 left-1/2 -translate-x-1/2"
                      : ""
                  }
                  ${
                    orientation === "horizontal"
                      ? "w-1 h-3.5 top-1/2 -translate-y-1/2"
                      : ""
                  }
                `}
                style={{
                  [orientation === "vertical"
                    ? "bottom"
                    : orientation === "horizontal"
                    ? "left"
                    : "bottom"]: `calc(${pos}% - 2px)`,
                }}
                onMouseEnter={() => {
                  setTickHovering(true);
                }}
                onMouseLeave={() => {
                  setTickHovering(false);
                }}
              ></div>
              {tickHovering && !sliding && (
                <AnimatePresence>
                  <motion.div
                    style={{
                      [orientation === "vertical"
                        ? "bottom"
                        : ""]: `calc(${pos}% - 0.625rem)`,
                      [orientation === "horizontal" ? "left" : ""]: `${pos}%`,
                    }}
                    className={`text-black font-K2D text-sm absolute w-max flex justify-center items-center
                      ${orientation === "vertical" ? "left-3.5" : ""}
                      ${
                        orientation === "horizontal"
                          ? bottomLabel
                            ? "bottom-3"
                            : "top-2.5"
                          : ""
                      }
                    `}
                    variants={tickVar}
                    initial={
                      orientation === "vertical"
                        ? "verticalInit"
                        : orientation === "horizontal"
                        ? "horizontalInit"
                        : "verticalInit"
                    }
                    animate='animate'
                    exit='init'
                    transition={tickTransition}
                  >
                    {units &&
                    orientation === "vertical" &&
                    (index === 0 || index === tickPositions.current.length - 1)
                      ? `${rescaleValue(pos, [5, 95], [rangeMin, rangeMax])
                          .toFixed(precision)
                          .replace(/\.?0+$/, "")} ${units}`
                      : `${rescaleValue(pos, [5, 95], [rangeMin, rangeMax])
                          .toFixed(precision)
                          .replace(/\.?0+$/, "")}`}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          ))}
          <div
            className={`absolute rounded bg-[#333333] cursor-pointer
              ${
                orientation === "vertical"
                  ? "w-4.5 h-2.5 left-1/2 -translate-x-1/2"
                  : ""
              }
              ${
                orientation === "horizontal"
                  ? "w-2.5 h-4.5 top-1/2 -translate-y-1/2 "
                  : ""
              }
            `}
            style={{
              [orientation === "vertical"
                ? "bottom"
                : orientation === "horizontal"
                ? "left"
                : "bottom"]: `calc(${styleValue}% - 5px)`,
            }}
            ref={handleRef}
            onMouseEnter={() => {
              setHandleHovering(true);
            }}
            onMouseLeave={() => {
              setHandleHovering(false);
            }}
          ></div>
          {(sliding || handleHovering) && (
            <SliderValuePortal
              value={value}
              handleRef={handleRef}
              precision={precision}
              units={units}
            />
          )}
        </div>
      </div>
      {bottomLabel && (
        <div
          className={`text-black text-base font-K2D w-full max-w-full overflow-wrap-break-word break-words hyphens-auto flex justify-center items-center
            ${orientation === "vertical" ? "text-center" : ""}
            ${
              orientation === "horizontal"
                ? "text-start absolute bottom-0.5"
                : ""
            }
          `}
        >
          <div className='grow'>{bottomLabel}</div>
          {tickHovering && units && orientation === "horizontal" && (
            <AnimatePresence>
              <motion.div
                className='w-max'
                variants={tickVar}
                initial='init'
                animate='animate'
                exit='init'
                transition={tickTransition}
              >
                {units}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
}
