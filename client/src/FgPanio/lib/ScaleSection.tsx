import React, { useEffect, useRef } from "react";
import Scale from "./Scale";

export default function ScaleSection({
  externalRef,
  playNote,
  visibleOctave,
  getVisibleOctave,
}: {
  externalRef: React.RefObject<HTMLDivElement>;
  playNote: (note: string, octave: number, isPressed: boolean) => void;
  visibleOctave: number;
  getVisibleOctave: () => void;
}) {
  const currentPress = useRef<
    { note: string | null; octave: string | null } | undefined
  >(undefined);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (externalRef && externalRef.current) {
        // If horizontal scroll is dominant, scroll horizontally.
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
          externalRef.current.scrollLeft += event.deltaX;
        } else {
          externalRef.current.scrollLeft += event.deltaY;
        }
      }

      getVisibleOctave();
    };

    externalRef?.current?.addEventListener("wheel", handleWheel);

    return () => {
      externalRef?.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleMouseUp = () => {
    document.removeEventListener("mouseup", handleMouseUp);
    document.removeEventListener("mousemove", handleMouseMove);

    if (
      currentPress.current &&
      currentPress.current.note &&
      currentPress.current.octave
    ) {
      const key = document.getElementById(
        `piano_key_${currentPress.current.octave}_${currentPress.current.note}`
      );
      key?.classList.remove("pressed");

      playNote(
        currentPress.current.note.length === 1
          ? currentPress.current.note
          : `${currentPress.current.note[0]}#`,
        parseInt(currentPress.current.octave),
        false
      );

      currentPress.current = undefined;
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    const targetElement = event.target as HTMLElement;
    currentPress.current = {
      note: targetElement.getAttribute("data-note"),
      octave: targetElement.getAttribute("data-octave"),
    };
  };

  const handleMouseMove = (event: MouseEvent) => {
    const targetElement = event.target as HTMLElement;

    const targetValues = {
      note: targetElement.getAttribute("data-note"),
      octave: targetElement.getAttribute("data-octave"),
    };

    if (
      !currentPress.current ||
      targetValues.note !== currentPress.current.note ||
      targetValues.octave !== currentPress.current.octave
    ) {
      if (
        currentPress.current &&
        currentPress.current.note &&
        currentPress.current.octave
      ) {
        const key = document.getElementById(
          `piano_key_${currentPress.current.octave}_${currentPress.current.note}`
        );
        key?.classList.remove("pressed");

        playNote(
          currentPress.current.note.length === 1
            ? currentPress.current.note
            : `${currentPress.current.note[0]}#`,
          parseInt(currentPress.current.octave),
          false
        );

        currentPress.current = undefined;
      }
      if (targetValues.note && targetValues.octave) {
        const key = document.getElementById(
          `piano_key_${targetValues.octave}_${targetValues.note}`
        );
        key?.classList.add("pressed");

        playNote(
          targetValues.note.length === 1
            ? targetValues.note
            : `${targetValues.note[0]}#`,
          parseInt(targetValues.octave),
          true
        );

        currentPress.current = targetValues;
      }
    }
  };

  return (
    <div
      ref={externalRef}
      className='scale-section space-x-0.25'
      onMouseDown={handleMouseDown}
    >
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
