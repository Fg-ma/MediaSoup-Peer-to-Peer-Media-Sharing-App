import React, { useEffect, useRef, useState } from "react";
import SliderValuePortal from "./SliderValuePortal";

export default function AudioEffectSlider({
  ticks,
  rangeMax,
  rangeMin,
}: {
  ticks: number;
  rangeMax: number;
  rangeMin: number;
}) {
  const [sliding, setSliding] = useState(false);
  const [value, setValue] = useState(50);
  const styleValue = useRef(50);
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

      styleValue.current = Math.max(0, Math.min(100, offsetY));

      const newValue = Math.max(
        0,
        Math.min(100, rescaleValue(offsetY, [5, 95], [0, 100]))
      );
      setValue(snapPositions(newValue));
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

  useEffect(() => {
    if (handleRef.current) {
      handleRef.current.style.bottom = `calc(${styleValue.current}% - 7px)`;
    }
    if (trackRef.current) {
      trackRef.current.style.background = `linear-gradient(to top, #F56114 ${styleValue.current}%, #e6e6e6 ${styleValue.current}%)`;
    }
  }, [value]);

  return (
    <div className='col-span-1 row-span-2 flex items-center justify-center'>
      <div
        className='vertical-slider-track'
        ref={trackRef}
        onMouseDown={handleMouseDown}
      >
        {tickPositions.current.map((pos) => (
          <div
            key={pos}
            className='tick'
            style={{ bottom: `calc(${pos}% - 1px)` }}
          ></div>
        ))}
        <div className='vertical-slider-handle' ref={handleRef}></div>
        {sliding && <SliderValuePortal value={value} handleRef={handleRef} />}
      </div>
    </div>
  );
}
