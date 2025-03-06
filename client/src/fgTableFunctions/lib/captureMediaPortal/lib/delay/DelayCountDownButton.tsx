import React, { useEffect, useRef, useState } from "react";

export default function DelayCountDownButton({
  delayCountDown,
}: {
  delayCountDown: number;
}) {
  const [fontSize, setFontSize] = useState("16px");
  const [paddingTop, setPaddingTop] = useState("2px");

  const counterRef = useRef<HTMLDivElement>(null);

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (time < 60) {
      return `${seconds}`;
    }

    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      : `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const updateFontSize = () => {
      if (counterRef.current) {
        const height = counterRef.current.clientHeight;
        setFontSize(`${height * 0.6}px`);
        setPaddingTop(`${height * 0.1}px`);
      }
    };

    const observer = new ResizeObserver(updateFontSize);
    if (counterRef.current) observer.observe(counterRef.current);

    return () => {
      observer.disconnect();
    };
  }, [counterRef.current]);

  return (
    <div
      ref={counterRef}
      className='flex z-20 h-full w-max font-Josefin text-fg-white items-center justify-center whitespace-nowrap select-none'
      style={{ fontSize, lineHeight: "0.8lh", paddingTop }}
    >
      {formatTime(delayCountDown)}
    </div>
  );
}
