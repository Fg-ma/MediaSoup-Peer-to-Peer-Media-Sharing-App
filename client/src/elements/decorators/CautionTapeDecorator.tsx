import React, { useLayoutEffect, useRef, useState } from "react";

export default function CautionTapeDecorator({
  className,
  width = 4,
}: {
  className?: string;
  width?: number;
}) {
  const decoratorRef = useRef<SVGSVGElement>(null);
  const size = useRef({ width: 0, height: 0 });
  const [_, setRerender] = useState(false);

  useLayoutEffect(() => {
    if (!decoratorRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (decoratorRef.current) {
        size.current = {
          width: decoratorRef.current.clientWidth,
          height: decoratorRef.current.clientHeight,
        };
        setRerender((prev) => !prev);
      }
    });
    resizeObserver.observe(decoratorRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [decoratorRef.current]);

  const halfWidth = width / 2;
  const threeWidth = width * 3;
  const threeHalvesWidth = (width * 3) / 2;
  const fullWidthMinusHalf = size.current.width - halfWidth;
  const fullHeightMinusHalf = size.current.height - halfWidth;
  const iScaleFactor = 1.5 * threeHalvesWidth;

  return (
    <svg
      ref={decoratorRef}
      className={`${className} pointer-events-none absolute left-[-${width}px] top-[-${width}px]`}
      style={{
        width: `calc(100% + ${width * 2}px)`,
        height: `calc(100% + ${width * 2}px)`,
      }}
      viewBox={`0 0 ${size.current.width} ${size.current.height}`}
    >
      {/* Top */}
      <g>
        {Array.from(
          {
            length: Math.floor(size.current.width / iScaleFactor),
          },
          (_, k) => {
            const i = k * iScaleFactor;

            return (
              <polygon
                key={i}
                points={`${i},0 ${i + width},0 ${i + threeHalvesWidth},${width} ${i + halfWidth},${width}`}
                strokeWidth={0}
              />
            );
          },
        )}
      </g>

      {/* Bottom */}
      <g>
        {Array.from(
          {
            length: Math.floor(size.current.width / iScaleFactor),
          },
          (_, k) => {
            const i = k * iScaleFactor;

            return (
              <polygon
                key={i}
                points={`${i},${size.current.height - width} ${i + width},${size.current.height - width} ${i + threeHalvesWidth},${size.current.height} ${i + halfWidth},${size.current.height}`}
                strokeWidth={0}
              />
            );
          },
        )}
      </g>

      {/* Right */}
      <g>
        {Array.from(
          {
            length: Math.floor(size.current.height / iScaleFactor),
          },
          (_, k) => {
            const i = k * iScaleFactor;

            return (
              <polygon
                key={i}
                points={`${size.current.width},${i} ${size.current.width},${i + width} ${size.current.width - width},${i + threeHalvesWidth} ${size.current.width - width},${i + halfWidth}`}
                strokeWidth={0}
              />
            );
          },
        )}
      </g>

      {/* Left */}
      <g>
        {Array.from(
          {
            length: Math.floor(size.current.height / iScaleFactor),
          },
          (_, k) => {
            const i = k * iScaleFactor;

            return (
              <polygon
                key={i}
                points={`${width},${i} ${width},${i + width} 0,${i + threeHalvesWidth} 0,${i + halfWidth}`}
                strokeWidth={0}
              />
            );
          },
        )}
      </g>

      {/* Corners */}
      <g>
        <g>
          <line
            x1={`${halfWidth}`}
            y1={`${halfWidth}`}
            x2={`${threeWidth}`}
            y2={`${halfWidth}`}
            strokeWidth={`${width}`}
            strokeLinecap="round"
          />
          <line
            x1={`${halfWidth}`}
            y1={`${halfWidth}`}
            x2={`${halfWidth}`}
            y2={`${threeWidth}`}
            strokeWidth={`${width}`}
            strokeLinecap="round"
          />
        </g>
        <g>
          <line
            x1={`${fullWidthMinusHalf}`}
            y1={`${fullHeightMinusHalf}`}
            x2={`${size.current.width - width * 3}`}
            y2={`${fullHeightMinusHalf}`}
            strokeWidth={`${width}`}
            strokeLinecap="round"
          />
          <line
            x1={`${fullWidthMinusHalf}`}
            y1={`${fullHeightMinusHalf}`}
            x2={`${fullWidthMinusHalf}`}
            y2={`${size.current.height - width * 3}`}
            strokeWidth={`${width}`}
            strokeLinecap="round"
          />
        </g>
        <g>
          <line
            x1={`${fullWidthMinusHalf}`}
            y1={`${halfWidth}`}
            x2={`${size.current.width - width * 3}`}
            y2={`${halfWidth}`}
            strokeWidth={`${width}`}
            strokeLinecap="round"
          />
          <line
            x1={`${fullWidthMinusHalf}`}
            y1={`${halfWidth}`}
            x2={`${fullWidthMinusHalf}`}
            y2={`${threeWidth}`}
            strokeWidth={`${width}`}
            strokeLinecap="round"
          />
        </g>
        <g>
          <line
            x1={`${halfWidth}`}
            y1={`${fullHeightMinusHalf}`}
            x2={`${halfWidth}`}
            y2={`${size.current.height - width * 3}`}
            strokeWidth={`${width}`}
            strokeLinecap="round"
          />
          <line
            x1={`${halfWidth}`}
            y1={`${fullHeightMinusHalf}`}
            x2={`${threeWidth}`}
            y2={`${fullHeightMinusHalf}`}
            strokeWidth={`${width}`}
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
}
