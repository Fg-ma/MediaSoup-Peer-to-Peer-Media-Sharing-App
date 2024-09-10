import React, { useState, useEffect, useRef } from "react";
import { Octaves } from "../FgPiano";

const keyColors: { [key: string]: string } = {
  a: "red",
  s: "orange",
  d: "yellow",
  f: "green",
  g: "blue",
  h: "indigo",
  j: "violet",
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
      keyDownTime: number;
      height: number;
      bottom: number;
    };
  }>({});
  const keyCount = useRef(0);
  const heightGrowFactor = 0.1;
  const bottomGrowFactor = 0.01;

  const handleKeyUp = (event: KeyboardEvent) => {
    const eventKey = event.key;

    let octave: number = visibleOctaveRef.current;
    if (shiftPressed.current) {
      octave = Math.min(6, octave + 1);
    }
    if (controlPressed.current) {
      octave = Math.max(0, octave - 1);
    }

    switch (eventKey) {
      case "s":
        setKeyPresses((prev) => {
          const prevKeyPresses = { ...prev };
          const height =
            (Date.now() - prevKeyPresses[`C-fg-${octave}`].keyDownTime) *
            heightGrowFactor;

          prevKeyPresses[`C-fg-${octave}`] = {
            ...prevKeyPresses[`C-fg-${octave}`],
            currentlyPressed: false,
            height,
          };
          return prevKeyPresses;
        });
        break;
      case "d":
        setKeyPresses((prev) => {
          const prevKeyPresses = { ...prev };
          const height =
            (Date.now() - prevKeyPresses[`D-fg-${octave}`].keyDownTime) *
            heightGrowFactor;

          prevKeyPresses[`D-fg-${octave}`] = {
            ...prevKeyPresses[`D-fg-${octave}`],
            currentlyPressed: false,
            height,
          };
          return prevKeyPresses;
        });
        break;
      case "f":
        setKeyPresses((prev) => {
          const prevKeyPresses = { ...prev };
          const height =
            (Date.now() - prevKeyPresses[`E-fg-${octave}`].keyDownTime) *
            heightGrowFactor;

          prevKeyPresses[`E-fg-${octave}`] = {
            ...prevKeyPresses[`E-fg-${octave}`],
            currentlyPressed: false,
            height,
          };
          return prevKeyPresses;
        });
        break;
      case "j":
        setKeyPresses((prev) => {
          const prevKeyPresses = { ...prev };
          const height =
            (Date.now() - prevKeyPresses[`F-fg-${octave}`].keyDownTime) *
            heightGrowFactor;

          prevKeyPresses[`F-fg-${octave}`] = {
            ...prevKeyPresses[`F-fg-${octave}`],
            currentlyPressed: false,
            height,
          };
          return prevKeyPresses;
        });
        break;
      case "k":
        setKeyPresses((prev) => {
          const prevKeyPresses = { ...prev };
          const height =
            (Date.now() - prevKeyPresses[`G-fg-${octave}`].keyDownTime) *
            heightGrowFactor;

          prevKeyPresses[`G-fg-${octave}`] = {
            ...prevKeyPresses[`G-fg-${octave}`],
            currentlyPressed: false,
            height,
          };
          return prevKeyPresses;
        });
        break;
      case "l":
        setKeyPresses((prev) => {
          const prevKeyPresses = { ...prev };
          const height =
            (Date.now() - prevKeyPresses[`A-fg-${octave}`].keyDownTime) *
            heightGrowFactor;

          prevKeyPresses[`A-fg-${octave}`] = {
            ...prevKeyPresses[`A-fg-${octave}`],
            currentlyPressed: false,
            height,
          };
          return prevKeyPresses;
        });
        break;
      case ";":
        setKeyPresses((prev) => {
          const prevKeyPresses = { ...prev };
          const height =
            (Date.now() - prevKeyPresses[`B-fg-${octave}`].keyDownTime) *
            heightGrowFactor;

          prevKeyPresses[`B-fg-${octave}`] = {
            ...prevKeyPresses[`B-fg-${octave}`],
            currentlyPressed: false,
            height,
          };
          return prevKeyPresses;
        });
        break;
      case "e":
        setKeyPresses((prev) => {
          const prevKeyPresses = { ...prev };
          const height =
            (Date.now() - prevKeyPresses[`C#-fg-${octave}`].keyDownTime) *
            heightGrowFactor;

          prevKeyPresses[`C#-fg-${octave}`] = {
            ...prevKeyPresses[`C#-fg-${octave}`],
            currentlyPressed: false,
            height,
          };
          return prevKeyPresses;
        });
        break;
      case "r":
        setKeyPresses((prev) => {
          const prevKeyPresses = { ...prev };
          const height =
            (Date.now() - prevKeyPresses[`D#-fg-${octave}`].keyDownTime) *
            heightGrowFactor;

          prevKeyPresses[`D#-fg-${octave}`] = {
            ...prevKeyPresses[`D#-fg-${octave}`],
            currentlyPressed: false,
            height,
          };
          return prevKeyPresses;
        });
        break;
      case "i":
        setKeyPresses((prev) => {
          const prevKeyPresses = { ...prev };
          const height =
            (Date.now() - prevKeyPresses[`F#-fg-${octave}`].keyDownTime) *
            heightGrowFactor;

          prevKeyPresses[`F#-fg-${octave}`] = {
            ...prevKeyPresses[`F#-fg-${octave}`],
            currentlyPressed: false,
            height,
          };
          return prevKeyPresses;
        });
        break;
      case "o":
        setKeyPresses((prev) => {
          const prevKeyPresses = { ...prev };
          const height =
            (Date.now() - prevKeyPresses[`G#-fg-${octave}`].keyDownTime) *
            heightGrowFactor;

          prevKeyPresses[`G#-fg-${octave}`] = {
            ...prevKeyPresses[`G#-fg-${octave}`],
            currentlyPressed: false,
            height,
          };
          return prevKeyPresses;
        });
        break;
      case "p":
        setKeyPresses((prev) => {
          const prevKeyPresses = { ...prev };
          const height =
            (Date.now() - prevKeyPresses[`A#-fg-${octave}`].keyDownTime) *
            heightGrowFactor;

          prevKeyPresses[`A#-fg-${octave}`] = {
            ...prevKeyPresses[`A#-fg-${octave}`],
            currentlyPressed: false,
            height,
          };
          return prevKeyPresses;
        });
        break;
      default:
        break;
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    keyCount.current += 1;

    const eventKey = event.key;

    let octave: number = visibleOctaveRef.current;
    if (shiftPressed.current) {
      octave = Math.min(6, octave + 1);
    }
    if (controlPressed.current) {
      octave = Math.max(0, octave - 1);
    }

    const keyPressInfo = {
      currentlyPressed: true,
      keyDownTime: Date.now(),
      height: 0,
      bottom: 0,
    };

    switch (eventKey) {
      case "s":
        setKeyPresses((prev) => ({
          ...prev,
          [`C-fg-${octave}`]: keyPressInfo,
        }));
        break;
      case "d":
        setKeyPresses((prev) => ({
          ...prev,
          [`D-fg-${octave}`]: keyPressInfo,
        }));
        break;
      case "f":
        setKeyPresses((prev) => ({
          ...prev,
          [`E-fg-${octave}`]: keyPressInfo,
        }));
        break;
      case "j":
        setKeyPresses((prev) => ({
          ...prev,
          [`F-fg-${octave}`]: keyPressInfo,
        }));
        break;
      case "k":
        setKeyPresses((prev) => ({
          ...prev,
          [`G-fg-${octave}`]: keyPressInfo,
        }));
        break;
      case "l":
        setKeyPresses((prev) => ({
          ...prev,
          [`A-fg-${octave}`]: keyPressInfo,
        }));
        break;
      case ";":
        setKeyPresses((prev) => ({
          ...prev,
          [`B-fg-${octave}`]: keyPressInfo,
        }));
        break;
      case "e":
        setKeyPresses((prev) => ({
          ...prev,
          [`C#-fg-${octave}`]: keyPressInfo,
        }));
        break;
      case "r":
        setKeyPresses((prev) => ({
          ...prev,
          [`D#-fg-${octave}`]: keyPressInfo,
        }));
        break;
      case "i":
        setKeyPresses((prev) => ({
          ...prev,
          [`F#-fg-${octave}`]: keyPressInfo,
        }));
        break;
      case "o":
        setKeyPresses((prev) => ({
          ...prev,
          [`G#-fg-${octave}`]: keyPressInfo,
        }));
        break;
      case "p":
        setKeyPresses((prev) => ({
          ...prev,
          [`A#-fg-${octave}`]: keyPressInfo,
        }));
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyPresses]);

  useEffect(() => {
    setInterval(() => {
      setKeyPresses((prev) => {
        let newKeyPresses: {
          [key: string]: {
            currentlyPressed: boolean;
            keyDownTime: number;
            height: number;
            bottom: number;
          };
        } = {};
        for (const keyPress in prev) {
          let newHeight = prev[keyPress].height;
          let newbottom = prev[keyPress].bottom;
          if (prev[keyPress].currentlyPressed) {
            newHeight += heightGrowFactor;
          } else {
            newbottom += bottomGrowFactor;
          }

          newKeyPresses[keyPress] = {
            ...prev[keyPress],
            height: newHeight,
            bottom: newbottom,
          };
        }

        return newKeyPresses;
      });
    }, 10);
  }, []);

  return (
    <div className='w-full h-20 bg-gray-200 relative overflow-hidden'>
      {Object.entries(keyPresses).map(
        ([key, { currentlyPressed, keyDownTime, height, bottom }], index) => {
          return (
            <div
              key={key}
              className={`absolute w-6 bg-fg-secondary`}
              style={{
                backgroundColor: keyColors[key],
                left: `${index * 24}px`,
                bottom: `${bottom}px`,
                height: `${height}px`,
                transition: "height 0.1s linear, bottom 0.1s linear",
              }}
            />
          );
        }
      )}
    </div>
  );
}
