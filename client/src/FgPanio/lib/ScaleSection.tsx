import React, { useEffect } from "react";
import Scale from "./Scale";

export default function ScaleSection({
  externalRef,
  playNote,
  visibleOctave,
  getVisibleOctave,
}: {
  externalRef: React.RefObject<HTMLDivElement>;
  playNote: (note: string, octave: number) => void;
  visibleOctave: number;
  getVisibleOctave: () => void;
}) {
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      getVisibleOctave();

      if (externalRef && externalRef.current) {
        // If horizontal scroll is dominant, scroll horizontally.
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
          externalRef.current.scrollLeft += event.deltaX;
        } else {
          externalRef.current.scrollLeft += event.deltaY;
        }
      }
    };

    externalRef?.current?.addEventListener("wheel", handleWheel);

    return () => {
      externalRef?.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div ref={externalRef} className='scale-section space-x-0.25'>
      <Scale octave={0} playNote={playNote} visibleOctave={visibleOctave} />
      <Scale octave={1} playNote={playNote} visibleOctave={visibleOctave} />
      <Scale octave={2} playNote={playNote} visibleOctave={visibleOctave} />
      <Scale octave={3} playNote={playNote} visibleOctave={visibleOctave} />
      <Scale octave={4} playNote={playNote} visibleOctave={visibleOctave} />
      <Scale octave={5} playNote={playNote} visibleOctave={visibleOctave} />
      <Scale octave={6} playNote={playNote} visibleOctave={visibleOctave} />
    </div>
  );
}
