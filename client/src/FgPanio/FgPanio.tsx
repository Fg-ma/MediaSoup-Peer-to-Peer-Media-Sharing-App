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
    visibleOctaveRef
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

  const unpressOctave = (octave: number) => {
    for (const key in keys.naturalKeys) {
      const keyElement = document.getElementById(`paino_key_${octave}_${key}`);
      keyElement?.classList.remove("pressed");
    }

    for (const key in keys.accidentalKeys) {
      const keyElement = document.getElementById(`paino_key_${octave}_${key}`);
      keyElement?.classList.remove("pressed");
    }
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

    switch (event.key.toLowerCase()) {
      case "shift":
        unpressOctave(octave);
        shiftPressed.current = false;
        keysPressed.current = keysPressed.current.filter((k) => k !== "shift");
        break;
      case "control":
        unpressOctave(octave);
        controlPressed.current = false;
        keysPressed.current = keysPressed.current.filter(
          (k) => k !== "control"
        );
        break;
      case "s":
        key = document.getElementById(`paino_key_${octave}_C`);
        key?.classList.remove("pressed");
        keysPressed.current = keysPressed.current.filter((k) => k !== "C");
        break;
      case "d":
        key = document.getElementById(`paino_key_${octave}_D`);
        key?.classList.remove("pressed");
        keysPressed.current = keysPressed.current.filter((k) => k !== "D");
        break;
      case "f":
        key = document.getElementById(`paino_key_${octave}_E`);
        key?.classList.remove("pressed");
        keysPressed.current = keysPressed.current.filter((k) => k !== "E");
        break;
      case "j":
        key = document.getElementById(`paino_key_${octave}_F`);
        key?.classList.remove("pressed");
        keysPressed.current = keysPressed.current.filter((k) => k !== "F");
        break;
      case "k":
        key = document.getElementById(`paino_key_${octave}_G`);
        key?.classList.remove("pressed");
        keysPressed.current = keysPressed.current.filter((k) => k !== "G");
        break;
      case "l":
        key = document.getElementById(`paino_key_${octave}_A`);
        key?.classList.remove("pressed");
        keysPressed.current = keysPressed.current.filter((k) => k !== "A");
        break;
      case ";":
        key = document.getElementById(`paino_key_${octave}_B`);
        key?.classList.remove("pressed");
        keysPressed.current = keysPressed.current.filter((k) => k !== "B");
        break;
      case "e":
        key = document.getElementById(`paino_key_${octave}_CSharpDb`);
        key?.classList.remove("pressed");
        keysPressed.current = keysPressed.current.filter(
          (k) => k !== "CSharpDb"
        );
        break;
      case "r":
        key = document.getElementById(`paino_key_${octave}_DSharpEb`);
        key?.classList.remove("pressed");
        keysPressed.current = keysPressed.current.filter(
          (k) => k !== "DSharpEb"
        );
        break;
      case "i":
        key = document.getElementById(`paino_key_${octave}_FSharpGb`);
        key?.classList.remove("pressed");
        keysPressed.current = keysPressed.current.filter(
          (k) => k !== "FSharpGb"
        );
        break;
      case "o":
        key = document.getElementById(`paino_key_${octave}_GSharpAb`);
        key?.classList.remove("pressed");
        keysPressed.current = keysPressed.current.filter(
          (k) => k !== "GSharpAb"
        );
        break;
      case "p":
        key = document.getElementById(`paino_key_${octave}_ASharpBb`);
        key?.classList.remove("pressed");
        keysPressed.current = keysPressed.current.filter(
          (k) => k !== "ASharpBb"
        );
        break;
      default:
        break;
    }

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

    switch (event.key.toLowerCase()) {
      case "shift":
        unpressOctave(octave);
        shiftPressed.current = true;
        keysPressed.current = [...keysPressed.current, "shift"];
        break;
      case "control":
        unpressOctave(octave);
        controlPressed.current = true;
        keysPressed.current = [...keysPressed.current, "control"];
        break;
      case "s":
        if (!keysPressed.current.includes("C")) {
          key = document.getElementById(`paino_key_${octave}_C`);
          key?.classList.add("pressed");
          keysPressed.current = [...keysPressed.current, "C"];
        }
        break;
      case "d":
        if (!keysPressed.current.includes("D")) {
          key = document.getElementById(`paino_key_${octave}_D`);
          key?.classList.add("pressed");
          keysPressed.current = [...keysPressed.current, "D"];
        }
        break;
      case "f":
        if (!keysPressed.current.includes("E")) {
          key = document.getElementById(`paino_key_${octave}_E`);
          key?.classList.add("pressed");
          keysPressed.current = [...keysPressed.current, "E"];
        }
        break;
      case "j":
        if (!keysPressed.current.includes("F")) {
          key = document.getElementById(`paino_key_${octave}_F`);
          key?.classList.add("pressed");
          keysPressed.current = [...keysPressed.current, "F"];
        }
        break;
      case "k":
        if (!keysPressed.current.includes("G")) {
          key = document.getElementById(`paino_key_${octave}_G`);
          key?.classList.add("pressed");
          keysPressed.current = [...keysPressed.current, "G"];
        }
        break;
      case "l":
        if (!keysPressed.current.includes("A")) {
          key = document.getElementById(`paino_key_${octave}_A`);
          key?.classList.add("pressed");
          keysPressed.current = [...keysPressed.current, "A"];
        }
        break;
      case ";":
        if (!keysPressed.current.includes("B")) {
          key = document.getElementById(`paino_key_${octave}_B`);
          key?.classList.add("pressed");
          keysPressed.current = [...keysPressed.current, "B"];
        }
        break;
      case "e":
        if (!keysPressed.current.includes("CSharpDb")) {
          key = document.getElementById(`paino_key_${octave}_CSharpDb`);
          key?.classList.add("pressed");
          keysPressed.current = [...keysPressed.current, "CSharpDb"];
        }
        break;
      case "r":
        if (!keysPressed.current.includes("DSharpEb")) {
          key = document.getElementById(`paino_key_${octave}_DSharpEb`);
          key?.classList.add("pressed");
          keysPressed.current = [...keysPressed.current, "DSharpEb"];
        }
        break;
      case "i":
        if (!keysPressed.current.includes("FSharpGb")) {
          key = document.getElementById(`paino_key_${octave}_FSharpGb`);
          key?.classList.add("pressed");
          keysPressed.current = [...keysPressed.current, "FSharpGb"];
        }
        break;
      case "o":
        if (!keysPressed.current.includes("GSharpAb")) {
          key = document.getElementById(`paino_key_${octave}_GSharpAb`);
          key?.classList.add("pressed");
          keysPressed.current = [...keysPressed.current, "GSharpAb"];
        }
        break;
      case "p":
        if (!keysPressed.current.includes("ASharpBb")) {
          key = document.getElementById(`paino_key_${octave}_ASharpBb`);
          key?.classList.add("pressed");
          keysPressed.current = [...keysPressed.current, "ASharpBb"];
        }
        break;
      default:
        break;
    }
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
