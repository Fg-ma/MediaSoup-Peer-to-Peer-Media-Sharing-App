import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import FgPanel from "../fgElements/fgPanel/FgPanel";
import "./lib/pianoStyles.css";
import ScaleSection from "./lib/ScaleSection";
import FgPianoController, { keysMap } from "./lib/FgPianoController";
import { useStreamsContext } from "../context/streamsContext/StreamsContext";
import SamplerToolbar from "./lib/SamplerToolbar";

const SamplerEffectsToolbar = React.lazy(
  () => import("./lib/SamplerEffectsToolbar")
);

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
  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);
  const keysPressed = useRef<string[]>([]);
  const keyVisualizerRef = useRef<HTMLDivElement>(null);
  const keyVisualizerContainerRef = useRef<HTMLDivElement>(null);
  const visualizerAnimationFrameRef = useRef<number | undefined>(undefined);

  const fgPianoController = new FgPianoController(
    isUser,
    userMedia,
    scaleSectionContainerRef,
    scaleSectionRef,
    keyWidth,
    setVisibleOctave,
    visibleOctaveRef,
    keysPressed,
    shiftPressed,
    controlPressed,
    keyVisualizerActiveRef,
    keyVisualizerRef,
    visualizerAnimationFrameRef
  );

  const handleKeyUp = (event: KeyboardEvent) => {
    const eventKey = event.key.toLowerCase();

    if (!(eventKey in keysMap)) {
      return;
    }

    let octave: number = visibleOctaveRef.current;
    if (shiftPressed.current) {
      octave = Math.min(6, octave + 1);
    }
    if (controlPressed.current) {
      octave = Math.max(0, octave - 1);
    }

    fgPianoController.handleKeyUp(eventKey, octave as Octaves);

    if (keysPressed.current.length === 0) {
      document.removeEventListener("keyup", handleKeyUp);
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const eventKey = event.key.toLowerCase();

    if (event.target instanceof HTMLInputElement) {
      return;
    }

    if (!(eventKey in keysMap)) {
      return;
    }

    event.preventDefault();

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

    fgPianoController.handleKeyDown(eventKey, octave as Octaves);
  }, []);

  const focusCallback = (focus: boolean) => {
    setFocus(focus);

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
      content={
        <div className='piano'>
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
          />
        </div>
      }
      resizeCallback={fgPianoController.resize}
      focusCallback={focusCallback}
      closeCallback={closeCallback}
      closePosition='topRight'
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
    />
  );
}
