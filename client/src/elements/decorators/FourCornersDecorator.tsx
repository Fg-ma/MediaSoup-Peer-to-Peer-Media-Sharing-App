import React from "react";

export default function FourCornersDecorator({
  className,
  width = 4,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <svg
      className={`${className} pointer-events-none absolute -left-[${width}px] -top-[${width}px]`}
      style={{
        width: `calc(100% + ${width * 2}px)`,
        height: `calc(100% + ${width * 2}px)`,
      }}
    >
      <g>
        <line
          x1={`${width / 2}px`}
          y1={`${width / 2}px`}
          x2="33.33%"
          y2={`${width / 2}px`}
          strokeWidth={`${width}px`}
          strokeLinecap="round"
        />
        <line
          x1={`${width / 2}px`}
          y1={`${width / 2}px`}
          x2={`${width / 2}px`}
          y2="33.33%"
          strokeWidth={`${width}px`}
          strokeLinecap="round"
        />
      </g>
      <g>
        <line
          x1={`calc(100% - ${width / 2}px)`}
          y1={`calc(100% - ${width / 2}px)`}
          x2="66.66%"
          y2={`calc(100% - ${width / 2}px)`}
          strokeWidth={`${width}px`}
          strokeLinecap="round"
        />
        <line
          x1={`calc(100% - ${width / 2}px)`}
          y1={`calc(100% - ${width / 2}px)`}
          x2={`calc(100% - ${width / 2}px)`}
          y2="66.66%"
          strokeWidth={`${width}px`}
          strokeLinecap="round"
        />
      </g>
      <g>
        <line
          x1={`calc(100% - ${width / 2}px)`}
          y1={`${width / 2}px`}
          x2="66.66%"
          y2={`${width / 2}px`}
          strokeWidth={`${width}px`}
          strokeLinecap="round"
        />
        <line
          x1={`calc(100% - ${width / 2}px)`}
          y1={`${width / 2}px`}
          x2={`calc(100% - ${width / 2}px)`}
          y2="33.33%"
          strokeWidth={`${width}px`}
          strokeLinecap="round"
        />
      </g>
      <g>
        <line
          x1={`${width / 2}px`}
          y1={`calc(100% - ${width / 2}px)`}
          x2={`${width / 2}px`}
          y2="66.66%"
          strokeWidth={`${width}px`}
          strokeLinecap="round"
        />
        <line
          x1={`${width / 2}px`}
          y1={`calc(100% - ${width / 2}px)`}
          x2="33.33%"
          y2={`calc(100% - ${width / 2}px)`}
          strokeWidth={`${width}px`}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
