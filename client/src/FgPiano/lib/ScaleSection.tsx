import React, { useEffect, useRef, Suspense } from "react";
import Scale from "./Scale";
import { Octaves } from "../FgPiano";
import VerticalSplitPanes from "../../verticalSplitPane/VerticalSplitPanes";
import FgPianoController, { keysMap } from "./FgPianoController";

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
  visualizerAnimationFrameRef,
  keysPressed,
  setKeyPresses,
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
  visualizerAnimationFrameRef: React.MutableRefObject<number | undefined>;
  keysPressed: React.MutableRefObject<string[]>;
  setKeyPresses: React.Dispatch<
    React.SetStateAction<{
      [key: string]: {
        currentlyPressed: boolean;
        height: number;
        bottom: number;
      }[];
    }>
  >;
}) {
  const currentPress = useRef<
    { note: string | null; octave: string | null } | undefined
  >(undefined);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (keyVisualizerActive) {
        setKeyPresses((prevKeyPresses) => {
          const newKeyPresses = {
            ...prevKeyPresses,
          };

          for (const keyPress in newKeyPresses) {
            for (let i = 0; i < newKeyPresses[keyPress].length; i++) {
              newKeyPresses[keyPress][i] = {
                ...newKeyPresses[keyPress][i],
                currentlyPressed: false,
              };
            }

            const [note, octave] = keyPress.split("-fg-");

            const keyElement = document.getElementById(
              `piano_key_${octave}_${note}`
            );

            if (keyElement?.classList.contains("pressed")) {
              keyElement?.classList.remove("pressed");
              fgPianoController.playNote(note, parseInt(octave), false);
            }
          }

          currentPress.current = undefined;

          return newKeyPresses;
        });
      } else {
        for (const keyPress in keysMap) {
          const keyElement = document.getElementById(
            `piano_key_${visibleOctaveRef.current}_${keysMap[keyPress]}`
          );

          if (keyElement?.classList.contains("pressed")) {
            keyElement?.classList.remove("pressed");

            fgPianoController.playNote(
              keysMap[keyPress],
              visibleOctaveRef.current,
              false
            );
          }
        }

        currentPress.current = undefined;
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

  const handleMouseUp = () => {
    window.removeEventListener("pointerup", handleMouseUp);
    window.removeEventListener("pointermove", handleMouseMove);

    if (keyVisualizerActive) {
      setKeyPresses((prevKeyPresses) => {
        const newKeyPresses = {
          ...prevKeyPresses,
        };

        if (
          currentPress.current &&
          currentPress.current.note &&
          currentPress.current.octave
        ) {
          const key = `${currentPress.current.note}-fg-${currentPress.current.octave}`;

          for (let i = 0; i < newKeyPresses[key].length; i++) {
            newKeyPresses[key][i] = {
              ...newKeyPresses[key][i],
              currentlyPressed: false,
            };
          }

          if (prevKeyPresses[key].length === 0) {
            delete newKeyPresses[key];
          }

          const keyElement = document.getElementById(
            `piano_key_${currentPress.current.octave}_${currentPress.current.note}`
          );
          keyElement?.classList.remove("pressed");

          fgPianoController.playNote(
            currentPress.current.note,
            parseInt(currentPress.current.octave),
            false
          );

          currentPress.current = undefined;
        }

        return newKeyPresses;
      });
    } else {
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

        currentPress.current = undefined;
      }
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    window.addEventListener("pointerup", handleMouseUp);
    window.addEventListener("pointermove", handleMouseMove);

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

    if (!keysPressed.current.includes(note)) {
      const keyElement = document.getElementById(`piano_key_${octave}_${note}`);
      keyElement?.classList.add("pressed");
      fgPianoController.playNote(note, parseInt(octave), true);
    }

    if (keyVisualizerActiveRef.current && !keysPressed.current.includes(note)) {
      if (visualizerAnimationFrameRef.current === undefined) {
        // Start the animation loop to update continuously
        visualizerAnimationFrameRef.current = requestAnimationFrame(
          fgPianoController.updateVisualizerAnimations
        );
      }

      setKeyPresses((prevKeyPresses) => {
        const key = `${note}-fg-${octave}`;

        const currentKeyPresses = prevKeyPresses[key] || [];

        for (let i = 0; i < currentKeyPresses.length; i++) {
          currentKeyPresses[i] = {
            ...currentKeyPresses[i],
            currentlyPressed: false,
          };
        }

        const newKeyPresses = {
          ...prevKeyPresses,
          [key]: [
            ...currentKeyPresses,
            {
              currentlyPressed: true,
              height: 0,
              bottom: 0,
            },
          ],
        };

        return newKeyPresses;
      });
    }
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
      if (keyVisualizerActiveRef.current) {
        if (visualizerAnimationFrameRef.current === undefined) {
          // Start the animation loop to update continuously
          visualizerAnimationFrameRef.current = requestAnimationFrame(
            fgPianoController.updateVisualizerAnimations
          );
        }

        setKeyPresses((prevKeyPresses) => {
          const newKeyPresses = {
            ...prevKeyPresses,
          };

          if (
            currentPress.current &&
            currentPress.current.note &&
            currentPress.current.octave
          ) {
            const key = `${currentPress.current.note}-fg-${currentPress.current.octave}`;

            const updatedKeyPressArray = prevKeyPresses[key]
              ? [...prevKeyPresses[key].filter((item) => item !== undefined)]
              : [];

            if (updatedKeyPressArray.length > 0) {
              const lastEntry = updatedKeyPressArray.pop();
              if (lastEntry) {
                lastEntry.currentlyPressed = false;

                newKeyPresses[key] = [...updatedKeyPressArray, lastEntry];
              }
            } else {
              delete newKeyPresses[key];
            }
          }

          if (
            targetValues.note &&
            targetValues.octave &&
            !keysPressed.current.includes(targetValues.note)
          ) {
            const key = `${targetValues.note}-fg-${targetValues.octave}`;

            const currentKeyPresses = prevKeyPresses[key] || [];

            newKeyPresses[key] = [
              ...currentKeyPresses,
              {
                currentlyPressed: true,
                height: 0,
                bottom: 0,
              },
            ];
          }

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

          return newKeyPresses;
        });
      } else {
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
    }
  };

  return (
    <div
      ref={scaleSectionContainerRef}
      className='scale-section-container hide-scroll-bar'
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
            <Scale octave={0} visibleOctave={visibleOctave} />
            <Scale octave={1} visibleOctave={visibleOctave} />
            <Scale octave={2} visibleOctave={visibleOctave} />
            <Scale octave={3} visibleOctave={visibleOctave} />
            <Scale octave={4} visibleOctave={visibleOctave} />
            <Scale octave={5} visibleOctave={visibleOctave} />
            <Scale octave={6} visibleOctave={visibleOctave} />
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
