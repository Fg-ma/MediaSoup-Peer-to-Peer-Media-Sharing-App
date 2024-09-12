import React, { useState, useEffect, useRef } from "react";
import { Octaves } from "../FgPiano";

const keyMap: { [key: string]: string } = {
  s: "C",
  d: "D",
  f: "E",
  j: "F",
  k: "G",
  l: "A",
  ";": "B",
  e: "C#",
  r: "D#",
  i: "F#",
  o: "G#",
  p: "A#",
};

export default function KeyVisualizer({
  visibleOctaveRef,
  shiftPressed,
  controlPressed,
}: {
  visibleOctaveRef: React.MutableRefObject<Octaves>;
  shiftPressed: React.MutableRefObject<boolean>;
  controlPressed: React.MutableRefObject<boolean>;
}) {
  const [keyPresses, setKeyPresses] = useState<{
    [key: string]: {
      currentlyPressed: boolean;
      height: number;
      bottom: number;
    }[];
  }>({});

  const keyVisualizerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const heightGrowFactor = 1.5; // Height growth factor for pressed key
  const bottomGrowFactor = 1.5; // Bottom movement factor for released key

  const updateAnimations = () => {
    setKeyPresses((prevKeyPresses) => {
      const updatedKeyPresses: typeof prevKeyPresses = {};

      Object.entries(prevKeyPresses).forEach(([key, keyPresses]) => {
        updatedKeyPresses[key] = updatedKeyPresses[key] || [];

        keyPresses.forEach((instance, index) => {
          if (!instance) return;

          let newHeight = instance.height;
          let newBottom = instance.bottom;

          if (instance.currentlyPressed) {
            newHeight += heightGrowFactor; // Grow height when pressed
          } else {
            newBottom += bottomGrowFactor; // Move upwards when released
          }

          // Only keep updating if it's within the bounds of the visualizer
          if (newBottom <= (keyVisualizerRef.current?.clientHeight ?? 0)) {
            updatedKeyPresses[key][index] = {
              ...keyPresses[index],
              height: newHeight,
              bottom: newBottom,
            };
          }
        });
      });

      return updatedKeyPresses;
    });

    // Continue updating using requestAnimationFrame for smooth animation
    animationFrameRef.current = requestAnimationFrame(updateAnimations);
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const eventKey = event.key;

    if (!(eventKey in keyMap)) {
      return;
    }

    let octave: number = visibleOctaveRef.current;
    if (shiftPressed.current) {
      octave = Math.min(6, octave + 1);
    }
    if (controlPressed.current) {
      octave = Math.max(0, octave - 1);
    }

    // On key release, stop growing and start flying up
    setKeyPresses((prevKeyPresses) => {
      const key = `${keyMap[eventKey]}-fg-${octave}`;

      const updatedKeyPressArray = prevKeyPresses[key]
        ? [...prevKeyPresses[key]]
        : [];

      const lastEntry = updatedKeyPressArray.pop();
      if (lastEntry) {
        lastEntry.currentlyPressed = false;

        const newKeyPresses = {
          ...prevKeyPresses,
          [key]: [...updatedKeyPressArray, lastEntry],
        };

        return newKeyPresses;
      } else {
        return prevKeyPresses;
      }
    });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const eventKey = event.key;

    if (!(eventKey in keyMap)) {
      return;
    }

    let octave: number = visibleOctaveRef.current;
    if (shiftPressed.current) {
      octave = Math.min(6, octave + 1);
    }
    if (controlPressed.current) {
      octave = Math.max(0, octave - 1);
    }

    setKeyPresses((prevKeyPresses) => {
      const key = `${keyMap[eventKey]}-fg-${octave}`;

      const currentKeyPresses = prevKeyPresses[key] || [];

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
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Start the animation loop to update continuously
    animationFrameRef.current = requestAnimationFrame(updateAnimations);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div ref={keyVisualizerRef} className='key-visualizer'>
      {Object.entries(keyPresses).map(([key, keyPressArray]) =>
        keyPressArray.map((instance, index) => {
          return (
            <div
              key={`${key}_${index}`}
              className={`key-visualizer-key ${key}`}
              style={{
                backgroundColor: "orange",
                bottom: instance && instance.bottom && `${instance.bottom}px`,
                height: instance && instance.height && `${instance.height}px`,
              }}
            />
          );
        })
      )}
    </div>
  );
}
