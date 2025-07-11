import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import FgPanel from "../../elements/fgPanel/FgPanel";
import ScaleSection from "./lib/ScaleSection";
import FgPianoController, { keysMap } from "./lib/FgPianoController";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import SamplerToolbar from "./lib/SamplerToolbar";
import "./lib/pianoStyles.css";

const SamplerEffectsToolbar = React.lazy(
  () => import("./lib/SamplerEffectsToolbar"),
);

export type Octaves = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type NoteStore = {
  "0": HTMLDivElement[];
  "1": HTMLDivElement[];
  "2": HTMLDivElement[];
  "3": HTMLDivElement[];
  "4": HTMLDivElement[];
  "5": HTMLDivElement[];
  "6": HTMLDivElement[];
};

export type Notes =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

export type StringOctaves = "0" | "1" | "2" | "3" | "4" | "5" | "6";

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
  const { userMedia } = useMediaContext();

  const [visibleOctave, setVisibleOctave] = useState<Octaves>(initialOctave);
  const [focus, setFocus] = useState(false);
  const [samplerEffectsActive, setSamplerEffectsActive] = useState(false);
  const [keyVisualizerActive, setKeyVisualizerActive] = useState(false);
  const keyVisualizerActiveRef = useRef(false);
  const visibleOctaveRef = useRef<Octaves>(initialOctave);
  const scaleSectionContainerRef = useRef<HTMLDivElement>(null);
  const scaleSectionRef = useRef<HTMLDivElement>(null);
  const keyWidth = useRef(0);
  const isKeydownListenerAdded = useRef(false);
  const keysPressed = useRef<string[]>([]);
  const keyVisualizerRef = useRef<HTMLDivElement>(null);
  const keyVisualizerContainerRef = useRef<HTMLDivElement>(null);
  const visualizerAnimationFrameRef = useRef<number | undefined>(undefined);
  const keyVisualizerNotesStore = useRef<{
    [note in Notes]: NoteStore;
  }>({
    C: { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
    "C#": { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
    D: { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
    "D#": { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
    E: { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
    F: { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
    "F#": { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
    G: { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
    "G#": { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
    A: { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
    "A#": { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
    B: { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
  });

  const fgPianoController = useRef(
    new FgPianoController(
      isUser,
      userMedia,
      scaleSectionContainerRef,
      scaleSectionRef,
      keyWidth,
      setVisibleOctave,
      visibleOctaveRef,
      keysPressed,
      keyVisualizerActiveRef,
      keyVisualizerRef,
      visualizerAnimationFrameRef,
      keyVisualizerNotesStore,
    ),
  );

  const handleKeyUp = (event: KeyboardEvent) => {
    const eventKey = event.key.toLowerCase();

    if (!(eventKey in keysMap)) {
      return;
    }

    let octave: number = visibleOctaveRef.current;
    if (event.shiftKey) {
      octave = Math.min(6, octave + 1);
    } else if (event.ctrlKey) {
      octave = Math.max(0, octave - 1);
    }

    fgPianoController.current.handleKeyUp(eventKey, octave as Octaves);

    if (keysPressed.current.length === 0) {
      document.removeEventListener("keyup", handleKeyUp);
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const tagName = (event.target as HTMLElement).tagName.toLowerCase();

    if (tagName === "input" || tagName === "textarea") return;

    event.stopPropagation();
    event.preventDefault();

    const eventKey = event.key.toLowerCase();

    if (!(eventKey in keysMap)) {
      return;
    }

    let octave: number = visibleOctaveRef.current;
    if (event.shiftKey) {
      octave = Math.min(6, octave + 1);
    } else if (event.ctrlKey) {
      octave = Math.max(0, octave - 1);
    }

    if (keysPressed.current.length === 0) {
      document.addEventListener("keyup", handleKeyUp);
    }

    fgPianoController.current.handleKeyDown(eventKey, octave as Octaves);
  }, []);

  const focusCallback = (focus: boolean) => {
    setFocus(focus);

    if (focus) {
      if (!isKeydownListenerAdded.current) {
        isKeydownListenerAdded.current = true;
        document.addEventListener("keydown", handleKeyDown, true);
      }
    } else {
      if (isKeydownListenerAdded.current) {
        isKeydownListenerAdded.current = false;
        document.removeEventListener("keydown", handleKeyDown, true);
      }
    }
  };

  useEffect(() => {
    fgPianoController.current.resize();

    fgPianoController.current.scrollToOctave(initialOctave);

    return () => {
      if (isKeydownListenerAdded.current) {
        isKeydownListenerAdded.current = false;
        document.removeEventListener("keydown", handleKeyDown);
      }
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
      className="border-2 border-fg-white shadow-md shadow-fg-tone-black-8"
      content={
        <div className="piano">
          <SamplerToolbar
            focus={focus}
            fgPianoController={fgPianoController}
            visibleOctaveRef={visibleOctaveRef}
            samplerEffectsActive={samplerEffectsActive}
            setSamplerEffectsActive={setSamplerEffectsActive}
            keyVisualizerActive={keyVisualizerActive}
            setKeyVisualizerActive={setKeyVisualizerActive}
            keyVisualizerActiveRef={keyVisualizerActiveRef}
            keyVisualizerContainerRef={keyVisualizerContainerRef}
          />
          {samplerEffectsActive && (
            <Suspense fallback={<div>Loading...</div>}>
              <SamplerEffectsToolbar focus={focus} />
            </Suspense>
          )}
          <ScaleSection
            fgPianoController={fgPianoController}
            scaleSectionContainerRef={scaleSectionContainerRef}
            scaleSectionRef={scaleSectionRef}
            visibleOctave={visibleOctave}
            setVisibleOctave={setVisibleOctave}
            visibleOctaveRef={visibleOctaveRef}
            keyVisualizerActive={keyVisualizerActive}
            setKeyVisualizerActive={setKeyVisualizerActive}
            keyVisualizerActiveRef={keyVisualizerActiveRef}
            keyVisualizerRef={keyVisualizerRef}
            keyVisualizerContainerRef={keyVisualizerContainerRef}
            visualizerAnimationFrameRef={visualizerAnimationFrameRef}
            keyVisualizerNotesStore={keyVisualizerNotesStore}
          />
        </div>
      }
      resizeCallback={fgPianoController.current.resize}
      focusCallback={focusCallback}
      closeCallback={closeCallback}
      closePosition="topRight"
      initPosition={{
        referenceElement,
        placement: "below",
      }}
      initHeight={"330px"}
      initWidth={"530px"}
      minWidth={285}
      minHeight={190}
      shadow={{
        left: true,
        right: true,
      }}
      backgroundColor={"#090909"}
      secondaryBackgroundColor={"#161616"}
    />
  );
}
