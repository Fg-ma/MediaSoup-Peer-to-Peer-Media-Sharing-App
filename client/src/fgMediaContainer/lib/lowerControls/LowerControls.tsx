import React, { useEffect, useRef } from "react";

export default function LowerControls() {
  const rightControlsRef = useRef<HTMLDivElement>(null);

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (rightControlsRef.current) {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        rightControlsRef.current.scrollLeft -= event.deltaX / 2;
      } else {
        rightControlsRef.current.scrollLeft -= event.deltaY / 2;
      }
    }
  };

  useEffect(() => {
    rightControlsRef.current?.addEventListener("wheel", handleWheel);

    return () => {
      rightControlsRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className='media-controls-container absolute bottom-0 w-full h-max flex-col items-end justify-center z-20 pointer-events-none'>
      <div className='flex media-controls w-full h-10 justify-between'>
        <div
          className='flex w-max h-10 z-20 items-center space-x-2'
          style={{ boxShadow: "20px 0 15px -12px rgba(0, 0, 0, 0.9)" }}
        >
          left
        </div>
        <div
          ref={rightControlsRef}
          className='hide-scroll-bar w-max h-10 overflow-x-auto z-10 flex items-center space-x-2 scale-x-[-1] pr-2'
        >
          right
        </div>
      </div>
    </div>
  );
}
