import React, { useCallback, useEffect, useRef, useState } from "react";
import FgPanel from "../fgPanel/FgPanel";
import "./lib/pianoStyles.css";
import ScaleSection from "./lib/ScaleSection";
import FgPianoController from "./lib/FgPianoController";
import { useStreamsContext } from "../context/StreamsContext";

export type Octaves = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export default function FgPiano({
  isUser,
  initialOctave = 3,
  closeCallback,
  referenceElement,
}: {
  isUser: boolean;
  initialOctave?: Octaves;
  closeCallback?: () => void;
  referenceElement?: HTMLElement;
}) {
  const { userMedia } = useStreamsContext();

  const scaleSectionRef = useRef<HTMLDivElement>(null);
  const keyWidth = useRef(0);
  const [visibleOctave, setVisibleOctave] = useState<Octaves>(initialOctave);
  const visibleOctaveRef = useRef<Octaves>(initialOctave);
  const isKeydownListenerAdded = useRef(false);
  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);
  const keysPressed = useRef<string[]>([]);

  const fgPianoController = new FgPianoController(
    isUser,
    userMedia,
    scaleSectionRef,
    keyWidth,
    setVisibleOctave,
    visibleOctaveRef,
    keysPressed,
    shiftPressed,
    controlPressed
  );

  const handleKeyUp = (event: KeyboardEvent) => {
    if (!event.key) {
      return;
    }

    let octave: number = visibleOctaveRef.current;
    if (shiftPressed.current) {
      octave = Math.min(6, octave + 1);
    }
    if (controlPressed.current) {
      octave = Math.max(0, octave - 1);
    }

    fgPianoController.handleKeyUp(event.key.toLowerCase(), octave as Octaves);

    if (keysPressed.current.length === 0) {
      document.removeEventListener("keyup", handleKeyUp);
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    event.preventDefault();

    if (!event.key) {
      return;
    }

    const tagName = document.activeElement?.tagName.toLowerCase();
    if (tagName === "input") return;

    let octave: number = visibleOctaveRef.current;
    if (shiftPressed.current) {
      octave = Math.min(6, octave + 1);
    }
    if (controlPressed.current) {
      octave = Math.max(0, octave - 1);
    }

    if (keysPressed.current.length === 0) {
      document.addEventListener("keyup", handleKeyUp);
    }

    fgPianoController.handleKeyDown(event.key.toLowerCase(), octave as Octaves);
  }, []);

  const handleKeyStrokes = (focus: boolean) => {
    if (focus) {
      if (!isKeydownListenerAdded.current) {
        isKeydownListenerAdded.current = true;
        document.addEventListener("keydown", handleKeyDown);
      }
    } else {
      if (isKeydownListenerAdded.current) {
        isKeydownListenerAdded.current = false;
        document.removeEventListener("keydown", handleKeyDown);
      }
    }
  };

  useEffect(() => {
    fgPianoController.resize();

    fgPianoController.scrollToOctave(initialOctave);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    for (let octave = 0; octave <= 6; octave++) {
      const scale = document.getElementById(`piano_scale_${octave}`);
      scale?.classList.remove("active-octave");
    }

    const activeScale = document.getElementById(`piano_scale_${visibleOctave}`);
    activeScale?.classList.add("active-octave");
  }, [visibleOctave]);

  return (
    <FgPanel
      content={
        <div className='piano'>
          <ScaleSection
            externalRef={scaleSectionRef}
            playNote={fgPianoController.playNote}
            visibleOctave={visibleOctave}
            getVisibleOctave={fgPianoController.getVisibleOctave}
          />
        </div>
      }
      resizeCallback={fgPianoController.resize}
      focusCallback={handleKeyStrokes}
      closeCallback={closeCallback}
      closePosition='topRight'
      initPosition={{
        referenceElement,
        placement: "below",
      }}
      initHeight={300}
      initWidth={400}
      minWidth={285}
      minHeight={190}
    />
  );
}
