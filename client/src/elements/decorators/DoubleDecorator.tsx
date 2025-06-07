import React, { useLayoutEffect, useRef, useState } from "react";

export default function DoubleDecorator({
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
      {size.current.width !== 0 && size.current.height !== 0 && (
        <g>
          <rect
            x={`${width / 6}`}
            y={`${width / 6}`}
            width={`${size.current.width - width / 3}`}
            height={`${size.current.height - width / 3}`}
            strokeWidth={`${width / 3}`}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <rect
            x={`${(width / 6) * 5}`}
            y={`${(width / 6) * 5}`}
            width={`${size.current.width - (width / 3) * 5}`}
            height={`${size.current.height - (width / 3) * 5}`}
            strokeWidth={`${width / 3}`}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      )}
    </svg>
  );
}
