import React, { useEffect, useRef } from "react";
import Scale from "./Scale";
import { Octaves } from "../FgPiano";
import KeyVisualizer from "./KeyVisualizer";

export default function ScaleSection({
  externalRef,
  playNote,
  visibleOctave,
  setVisibleOctave,
  visibleOctaveRef,
  getVisibleOctave,
  shiftPressed,
  controlPressed,
}: {
  externalRef: React.RefObject<HTMLDivElement>;
  playNote: (note: string, octave: number, isPressed: boolean) => void;
  visibleOctave: Octaves;
  setVisibleOctave: React.Dispatch<React.SetStateAction<Octaves>>;
  visibleOctaveRef: React.MutableRefObject<Octaves>;
  getVisibleOctave: () => void;
  shiftPressed: React.MutableRefObject<boolean>;
  controlPressed: React.MutableRefObject<boolean>;
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

        if (externalRef.current.scrollLeft === 0) {
          visibleOctaveRef.current = 0;
          setVisibleOctave(0);
        } else if (
          externalRef.current.scrollLeft + externalRef.current.clientWidth ===
          externalRef.current.scrollWidth
        ) {
          visibleOctaveRef.current = 6;
          setVisibleOctave(6);
        } else {
          getVisibleOctave();
        }
      }
    };

    externalRef?.current?.addEventListener("wheel", handleWheel);

    return () => {
      externalRef?.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleMouseUp = () => {
    window.removeEventListener("pointerup", handleMouseUp);
    window.removeEventListener("pointermove", handleMouseMove);

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
        currentPress.current.note,
        parseInt(currentPress.current.octave),
        false
      );

      currentPress.current = undefined;
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    window.addEventListener("pointerup", handleMouseUp);
    window.addEventListener("pointermove", handleMouseMove);

    const targetElement = event.target as HTMLElement;
    currentPress.current = {
      note: targetElement.getAttribute("data-note"),
      octave: targetElement.getAttribute("data-octave"),
    };
  };

  const handleMouseMove = (event: MouseEvent) => {
    const targetElement = event.target as HTMLButtonElement;

    if (targetElement.disabled) {
      return;
    }

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

        playNote(targetValues.note, parseInt(targetValues.octave), true);

        currentPress.current = targetValues;
      }
    }
  };

  return (
    <div
      ref={externalRef}
      className='scale-section-container'
      onMouseDown={handleMouseDown}
    >
      <KeyVisualizer
        visibleOctaveRef={visibleOctaveRef}
        shiftPressed={shiftPressed}
        controlPressed={controlPressed}
      />
      <div className='scale-section space-x-0.25 py-0.25 px-2'>
        <Scale octave={0} playNote={playNote} visibleOctave={visibleOctave} />
        <Scale octave={1} playNote={playNote} visibleOctave={visibleOctave} />
        <Scale octave={2} playNote={playNote} visibleOctave={visibleOctave} />
        <Scale octave={3} playNote={playNote} visibleOctave={visibleOctave} />
        <Scale octave={4} playNote={playNote} visibleOctave={visibleOctave} />
        <Scale octave={5} playNote={playNote} visibleOctave={visibleOctave} />
        <Scale octave={6} playNote={playNote} visibleOctave={visibleOctave} />
      </div>
    </div>
  );
}
