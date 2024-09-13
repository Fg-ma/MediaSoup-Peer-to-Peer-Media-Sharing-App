import React, { useEffect, useRef, Suspense } from "react";
import Scale from "./Scale";
import { Octaves } from "../FgPiano";
import VerticalSplitPanes from "../../verticalSplitPane/VerticalSplitPanes";
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
  keyPresses,
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
  keyPresses: {
    [key: string]: {
      currentlyPressed: boolean;
      height: number;
      bottom: number;
    }[];
  };
}) {
  const currentPress = useRef<
    { note: string | null; octave: string | null } | undefined
  >(undefined);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

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

    scaleSectionContainerRef?.current?.addEventListener("wheel", handleWheel);

    return () => {
      scaleSectionContainerRef?.current?.removeEventListener(
        "wheel",
        handleWheel
      );
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fgPianoController.resize();
    }, 0);
  }, [keyVisualizerActive]);

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

      fgPianoController.playNote(
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

        fgPianoController.playNote(
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

        fgPianoController.playNote(
          targetValues.note,
          parseInt(targetValues.octave),
          true
        );

        currentPress.current = targetValues;
      }
    }
  };

  return (
    <div
      ref={scaleSectionContainerRef}
      className='scale-section-container'
      onMouseDown={handleMouseDown}
    >
      <VerticalSplitPanes
        topContent={
          keyVisualizerActive ? (
            <Suspense fallback={<div>Loading...</div>}>
              <KeyVisualizer
                keyVisualizerRef={keyVisualizerRef}
                keyPresses={keyPresses}
              />
            </Suspense>
          ) : undefined
        }
        bottomContent={
          <div
            ref={scaleSectionRef}
            className='scale-section space-x-0.25 py-0.25 px-2'
          >
            <Scale
              octave={0}
              playNote={fgPianoController.playNote}
              visibleOctave={visibleOctave}
            />
            <Scale
              octave={1}
              playNote={fgPianoController.playNote}
              visibleOctave={visibleOctave}
            />
            <Scale
              octave={2}
              playNote={fgPianoController.playNote}
              visibleOctave={visibleOctave}
            />
            <Scale
              octave={3}
              playNote={fgPianoController.playNote}
              visibleOctave={visibleOctave}
            />
            <Scale
              octave={4}
              playNote={fgPianoController.playNote}
              visibleOctave={visibleOctave}
            />
            <Scale
              octave={5}
              playNote={fgPianoController.playNote}
              visibleOctave={visibleOctave}
            />
            <Scale
              octave={6}
              playNote={fgPianoController.playNote}
              visibleOctave={visibleOctave}
            />
          </div>
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
  );
}
