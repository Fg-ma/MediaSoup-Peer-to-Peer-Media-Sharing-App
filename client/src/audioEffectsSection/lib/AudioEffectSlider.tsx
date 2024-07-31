import React, { useState, useRef } from "react";
import SliderValuePortal from "./SliderValuePortal";
import { motion, AnimatePresence, Variants, Transition } from "framer-motion";

const tickVar: Variants = {
  init: { opacity: 0, scale: 0.8 },
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
  ticks,
  rangeMax,
  rangeMin,
  precision = 1,
  units,
}: {
  topLabel?: string;
  bottomLabel?: string;
  ticks: number;
  rangeMax: number;
  rangeMin: number;
  precision?: number;
  units?: string;
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
    if (trackRef.current) {
      const trackRect = trackRef.current.getBoundingClientRect();
      const offsetY =
        ((trackRect.bottom - event.clientY) / trackRect.height) * 100;

      const newValue = Math.max(
        0,
        Math.min(100, rescaleValue(offsetY, [5, 95], [0, 100]))
      );
      setStyleValue(
        Math.max(
          5,
          Math.min(95, rescaleValue(snapPositions(newValue), [0, 100], [5, 95]))
        )
      );
      setValue(
        rescaleValue(snapPositions(newValue), [0, 100], [rangeMin, rangeMax])
      );
    }
  };

  const handleMouseUp = () => {
    setSliding(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    setSliding(true);
    handleMouseMove(event);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className='w-16 h-full flex flex-col items-center justify-center relative'>
      {topLabel && (
        <div className='text-black text-base font-K2D w-full text-center max-w-full overflow-wrap-break-word break-words hyphens-auto'>
          {topLabel}
        </div>
      )}
      <div className='w-full flex items-center justify-center grow'>
        <div
          className='vertical-slider-track'
          style={{
            background: `linear-gradient(to top, #F56114 ${styleValue}%, #e6e6e6 ${styleValue}%)`,
            boxShadow: sliding ? "inset 0 0 1.25px rgba(0, 0, 0, 0.3)" : "",
          }}
          ref={trackRef}
          onMouseDown={handleMouseDown}
        >
          {tickPositions.current.map((pos, index) => (
            <div key={pos}>
              <div
                className='tick'
                style={{ bottom: `calc(${pos}% - 2px)` }}
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
                    style={{ bottom: `calc(${pos}% - 0.625rem)` }}
                    className='text-black font-K2D text-sm absolute left-3.5 w-max'
                    variants={tickVar}
                    initial='init'
                    animate='animate'
                    exit='init'
                    transition={tickTransition}
                  >
                    {units &&
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
            className='vertical-slider-handle'
            style={{ bottom: `calc(${styleValue}% - 5px)` }}
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
        <div className='text-black text-base font-K2D w-full text-center max-w-full overflow-wrap-break-word break-words hyphens-auto'>
          {bottomLabel}
        </div>
      )}
    </div>
  );
}
