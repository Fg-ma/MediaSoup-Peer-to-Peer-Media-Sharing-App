import React, { useEffect, useRef, Suspense } from "react";
import { v4 as uuidv4 } from "uuid";
import Scale from "./Scale";
import { Notes, NoteStore, Octaves, StringOctaves } from "../FgPiano";
import VerticalSplitPanes from "../../fgElements/verticalSplitPane/VerticalSplitPanes";
import FgPianoController from "./FgPianoController";

const KeyVisualizer = React.lazy(() => import("./KeyVisualizer"));

export default function ScaleSection({
  fgPianoController,
  scaleSectionContainerRef,
  scaleSectionRef,
  visibleOctave,
  setVisibleOctave,
  visibleOctaveRef,
  keyVisualizerActive,
  setKeyVisualizerActive,
  keyVisualizerActiveRef,
  keyVisualizerRef,
  keyVisualizerContainerRef,
  visualizerAnimationFrameRef,
  keyVisualizerNotesStore,
}: {
  fgPianoController: FgPianoController;
  scaleSectionContainerRef: React.RefObject<HTMLDivElement>;
  scaleSectionRef: React.RefObject<HTMLDivElement>;
  visibleOctave: Octaves;
  setVisibleOctave: React.Dispatch<React.SetStateAction<Octaves>>;
  visibleOctaveRef: React.MutableRefObject<Octaves>;
  keyVisualizerActive: boolean;
  setKeyVisualizerActive: React.Dispatch<React.SetStateAction<boolean>>;
  keyVisualizerActiveRef: React.MutableRefObject<boolean>;
  keyVisualizerRef: React.RefObject<HTMLDivElement>;
  keyVisualizerContainerRef: React.RefObject<HTMLDivElement>;
  visualizerAnimationFrameRef: React.MutableRefObject<number | undefined>;
  keyVisualizerNotesStore: React.MutableRefObject<{
    [note in Notes]: NoteStore;
  }>;
}) {
  const currentPress = useRef<
    { note: string | null; octave: string | null } | undefined
  >(undefined);

  useEffect(() => {
    scaleSectionContainerRef?.current?.addEventListener("wheel", handleWheel);

    return () => {
      scaleSectionContainerRef?.current?.removeEventListener(
        "wheel",
        handleWheel
      );
    };
  }, [keyVisualizerActive]);

  useEffect(() => {
    setTimeout(() => {
      fgPianoController.resize();
    }, 0);
  }, [keyVisualizerActive]);

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();

    currentPress.current = undefined;

    if (keyVisualizerRef.current) {
      const children = Array.from(keyVisualizerRef.current.children);
      children.forEach((child) => {
        const [key] = child.id.split("_");
        const [childKey, childOctave] = key.split("-fg-");

        const keyElement = document.getElementById(
          `piano_key_${childOctave}_${childKey}`
        );

        if (keyElement && keyElement.classList.contains("pressed")) {
          keyElement.classList.remove("pressed");
          fgPianoController.playNote(childKey, parseInt(childOctave), false);
        }

        if (keyVisualizerActive) {
          child.classList.remove("key-visualizer-currently-pressed");
        }
      });
    }

    if (scaleSectionContainerRef && scaleSectionContainerRef.current) {
      // If horizontal scroll is dominant, scroll horizontally.
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        scaleSectionContainerRef.current.scrollLeft += event.deltaX;
      } else {
        scaleSectionContainerRef.current.scrollLeft += event.deltaY;
      }

      if (scaleSectionContainerRef.current.scrollLeft === 0) {
        visibleOctaveRef.current = 0;
        setVisibleOctave(0);
      } else if (
        scaleSectionContainerRef.current.scrollLeft +
          scaleSectionContainerRef.current.clientWidth ===
        scaleSectionContainerRef.current.scrollWidth
      ) {
        visibleOctaveRef.current = 6;
        setVisibleOctave(6);
      } else {
        fgPianoController.getVisibleOctave();
      }
    }
  };

  const handlePointerUp = () => {
    document.removeEventListener("pointerup", handlePointerUp);
    document.removeEventListener("pointermove", handlePointerMove);

    if (
      currentPress.current &&
      currentPress.current.note &&
      currentPress.current.octave
    ) {
      const keyElement = document.getElementById(
        `piano_key_${currentPress.current.octave}_${currentPress.current.note}`
      );
      keyElement?.classList.remove("pressed");

      fgPianoController.playNote(
        currentPress.current.note,
        parseInt(currentPress.current.octave),
        false
      );
    }

    if (keyVisualizerActive && keyVisualizerRef.current) {
      const children = Array.from(keyVisualizerRef.current.children);
      children.forEach((child) => {
        if (
          !currentPress.current ||
          !currentPress.current.note ||
          !currentPress.current.octave
        ) {
          return;
        }

        const [key] = child.id.split("_");
        const [childKey, childOctave] = key.split("-fg-");

        if (
          childKey === currentPress.current.note &&
          childOctave === currentPress.current.octave
        ) {
          child.classList.remove("key-visualizer-currently-pressed");
        }
      });
    }

    currentPress.current = undefined;
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointermove", handlePointerMove);

    const targetElement = event.target as HTMLElement;
    const note = targetElement.getAttribute("data-note");
    const octave = targetElement.getAttribute("data-octave");

    if (!note || !octave) {
      return;
    }

    currentPress.current = {
      note: note,
      octave: octave,
    };

    const keyElement = document.getElementById(`piano_key_${octave}_${note}`);

    if (
      keyVisualizerActiveRef.current &&
      keyElement &&
      !keyElement.classList.contains("pressed")
    ) {
      if (visualizerAnimationFrameRef.current === undefined) {
        visualizerAnimationFrameRef.current = requestAnimationFrame(
          fgPianoController.updateVisualizerAnimations
        );
      }

      const newKeyElement = document.createElement("div");
      const key = `${note}-fg-${octave}`;
      newKeyElement.id = `${key}_${uuidv4()}`;
      newKeyElement.style.bottom = "0px";
      newKeyElement.style.height = "1px";
      newKeyElement.classList.add(key);
      newKeyElement.classList.add("key-visualizer-key");
      newKeyElement.classList.add("key-visualizer-currently-pressed");

      keyVisualizerRef.current?.appendChild(newKeyElement);

      keyVisualizerNotesStore.current[note as Notes][
        octave as StringOctaves
      ].push(newKeyElement);
    }

    if (keyElement && !keyElement.classList.contains("pressed")) {
      keyElement.classList.add("pressed");
      fgPianoController.playNote(note, parseInt(octave), true);
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
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
      (targetValues.note === currentPress.current.note &&
        targetValues.octave === currentPress.current.octave)
    ) {
      return;
    }

    if (currentPress.current.note && currentPress.current.octave) {
      const key = document.getElementById(
        `piano_key_${currentPress.current.octave}_${currentPress.current.note}`
      );
      if (key && key.classList.contains("pressed")) {
        key?.classList.remove("pressed");

        fgPianoController.playNote(
          currentPress.current.note.length === 1
            ? currentPress.current.note
            : `${currentPress.current.note[0]}#`,
          parseInt(currentPress.current.octave),
          false
        );
      }
    }

    if (keyVisualizerActiveRef.current && keyVisualizerRef.current) {
      const children = Array.from(keyVisualizerRef.current.children);
      children.forEach((child) => {
        if (
          !currentPress.current ||
          !currentPress.current.note ||
          !currentPress.current.octave
        ) {
          return;
        }

        const [key] = child.id.split("_");
        const [childKey, childOctave] = key.split("-fg-");

        if (
          childKey === currentPress.current.note &&
          childOctave === currentPress.current.octave
        ) {
          child.classList.remove("key-visualizer-currently-pressed");
        }
      });

      if (targetValues.note && targetValues.octave) {
        const newKeyElement = document.createElement("div");
        const key = `${targetValues.note}-fg-${targetValues.octave}`;
        newKeyElement.id = `${key}_${uuidv4()}`;
        newKeyElement.style.bottom = "0px";
        newKeyElement.style.height = "1px";
        newKeyElement.classList.add(key);
        newKeyElement.classList.add("key-visualizer-key");
        newKeyElement.classList.add("key-visualizer-currently-pressed");

        keyVisualizerRef.current.appendChild(newKeyElement);

        keyVisualizerNotesStore.current[targetValues.note as Notes][
          targetValues.octave as StringOctaves
        ].push(newKeyElement);
      }

      if (visualizerAnimationFrameRef.current === undefined) {
        visualizerAnimationFrameRef.current = requestAnimationFrame(
          fgPianoController.updateVisualizerAnimations
        );
      }
    }

    currentPress.current = undefined;

    if (targetValues.note && targetValues.octave) {
      const key = document.getElementById(
        `piano_key_${targetValues.octave}_${targetValues.note}`
      );
      if (key && !key.classList.contains("pressed")) {
        key.classList.add("pressed");

        fgPianoController.playNote(
          targetValues.note,
          parseInt(targetValues.octave),
          true
        );
      }

      currentPress.current = targetValues;
    }
  };

  return (
    <div className='grow w-full flex items-center justify-center relative overflow-hidden'>
      <div
        ref={scaleSectionContainerRef}
        className='scale-section-container hide-scroll-bar'
        onPointerDown={handlePointerDown}
      >
        <VerticalSplitPanes
          topContent={
            keyVisualizerActive ? (
              <Suspense fallback={<div>Loading...</div>}>
                <KeyVisualizer keyVisualizerRef={keyVisualizerRef} />
              </Suspense>
            ) : undefined
          }
          bottomContent={
            <div
              ref={scaleSectionRef}
              className='scale-section space-x-0.25 py-0.25 px-2'
            >
              <Scale octave={0} visibleOctave={visibleOctave} />
              <Scale octave={1} visibleOctave={visibleOctave} />
              <Scale octave={2} visibleOctave={visibleOctave} />
              <Scale octave={3} visibleOctave={visibleOctave} />
              <Scale octave={4} visibleOctave={visibleOctave} />
              <Scale octave={5} visibleOctave={visibleOctave} />
              <Scale octave={6} visibleOctave={visibleOctave} />
            </div>
          }
          floatingTopContent={
            keyVisualizerActive ? (
              <div
                ref={keyVisualizerContainerRef}
                className='h-full select-none w-full'
              ></div>
            ) : undefined
          }
          panelSizeChangeCallback={fgPianoController.resize}
          minPaneHeightCallback={() => {
            setKeyVisualizerActive(false);
            keyVisualizerActiveRef.current = false;
          }}
          options={{
            initialPaneHeight: "20%",
            minPaneHeight: 0,
            maxPaneHeight: 65,
            dividerButton: false,
          }}
        />
      </div>
    </div>
  );
}
