import React, { useCallback, useEffect, useRef, useState } from "react";
import FgPanel from "../fgPanel/FgPanel";
import "./lib/panioStyles.css";
import ScaleSection from "./lib/ScaleSection";
import { keys } from "./lib/Scale";
import FgPanioController from "./lib/FgPanioController";

export default function FgPanio() {
  const scaleSectionRef = useRef<HTMLDivElement>(null);
  const keyWidth = useRef(0);
  const [visibleOctave, setVisibleOctave] = useState(0);
  const visibleOctaveRef = useRef(0);
  const isKeydownListenerAdded = useRef(false);
  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);
  const keysPressed = useRef<string[]>([]);

  const fgPanioController = new FgPanioController(
    scaleSectionRef,
    keyWidth,
    setVisibleOctave,
    visibleOctaveRef,
    keysPressed,
    shiftPressed,
    controlPressed
  );

  const resize = () => {
    if (!scaleSectionRef.current) {
      return;
    }

    const heightInPixels = scaleSectionRef.current.offsetHeight;
    const newWidth = heightInPixels * 0.15;

    keyWidth.current = newWidth;

    scaleSectionRef.current.style.setProperty("--key-width", `${newWidth}px`);
    scaleSectionRef.current.style.setProperty(
      "--key-border-style",
      newWidth > 32 ? "solid" : "none"
    );

    fgPanioController.getVisibleOctave();
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (!event.key) {
      return;
    }

    let octave = visibleOctaveRef.current;
    if (shiftPressed.current) {
      octave = Math.min(6, octave + 1);
    }
    if (controlPressed.current) {
      octave = Math.max(0, octave - 1);
    }
    let key;

    fgPanioController.handleKeyUp(event.key.toLowerCase(), octave);

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

    let octave = visibleOctaveRef.current;
    if (shiftPressed.current) {
      octave = Math.min(6, octave + 1);
    }
    if (controlPressed.current) {
      octave = Math.max(0, octave - 1);
    }
    let key;

    if (keysPressed.current.length === 0) {
      document.addEventListener("keyup", handleKeyUp);
    }

    fgPanioController.handleKeyDown(event.key.toLowerCase(), octave);
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
    resize();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    for (let octave = 0; octave <= 6; octave++) {
      const key = document.getElementById(`paino_key_${octave}_C`);
      key?.classList.remove("active-octave");
    }

    const activeKey = document.getElementById(`paino_key_${visibleOctave}_C`);
    activeKey?.classList.add("active-octave");
  }, [visibleOctave]);

  const playNote = (note: string, octave: number) => {};

  return (
    <FgPanel
      content={
        <div className='panio'>
          <ScaleSection
            externalRef={scaleSectionRef}
            getVisibleOctave={fgPanioController.getVisibleOctave}
            visibleOctave={visibleOctave}
          />
        </div>
      }
      resizeCallback={resize}
      focusCallback={handleKeyStrokes}
      initHeight={300}
      initWidth={400}
      minWidth={285}
      minHeight={190}
    />
  );
}
