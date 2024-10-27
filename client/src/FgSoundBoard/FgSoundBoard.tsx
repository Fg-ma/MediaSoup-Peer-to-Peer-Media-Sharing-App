import React, { useState } from "react";
import FgPanel from "../fgPanel/FgPanel";
import FgButton from "../fgButton/FgButton";
import "./soundBoard.css";

type BoardEffects =
  | "topRightDiagonal"
  | "topLeftDiagonal"
  | "bottomRightDiagonal"
  | "bottomLeftDiagonal"
  | "verticalSweep"
  | "horizontalSweep"
  | "reverseVerticalSweep"
  | "reverseHorizontalSweep"
  | "scissor"
  | "x"
  | "pulse"
  | "smallSpin"
  | "largeSpin"
  | "cross"
  | "gravity"
  | "antigravity"
  | "topSmile"
  | "bottomSmile"
  | "leftSmile"
  | "rightSmile"
  | "spiral";

const boardEffects: {
  [boardEffect in BoardEffects]: {
    sequence: number[][];
    running: boolean;
  };
} = {
  topRightDiagonal: {
    sequence: [
      [5],
      [4, 10],
      [3, 9, 15],
      [2, 8, 14, 20],
      [1, 7, 13, 19, 25],
      [6, 12, 18, 24],
      [11, 17, 23],
      [16, 22],
      [21],
      [],
    ],
    running: false,
  },
  topLeftDiagonal: {
    sequence: [
      [1],
      [2, 6],
      [11, 7, 3],
      [16, 12, 8, 4],
      [21, 17, 13, 9, 5],
      [22, 18, 14, 10],
      [23, 19, 15],
      [24, 20],
      [25],
      [],
    ],
    running: false,
  },
  bottomRightDiagonal: {
    sequence: [
      [21],
      [16, 22],
      [11, 17, 23],
      [6, 12, 18, 24],
      [1, 7, 13, 19, 25],
      [2, 8, 14, 20],
      [3, 9, 15],
      [4, 10],
      [5],
      [],
    ],
    running: false,
  },
  bottomLeftDiagonal: {
    sequence: [
      [25],
      [24, 20],
      [23, 19, 15],
      [22, 18, 14, 10],
      [21, 17, 13, 9, 5],
      [16, 12, 8, 4],
      [11, 7, 3],
      [2, 6],
      [1],
      [],
    ],
    running: false,
  },
  verticalSweep: {
    sequence: [
      [1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15],
      [16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25],
      [],
    ],
    running: false,
  },
  horizontalSweep: {
    sequence: [
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24],
      [5, 10, 15, 20, 25],
      [],
    ],
    running: false,
  },
  reverseVerticalSweep: {
    sequence: [
      [21, 22, 23, 24, 25],
      [16, 17, 18, 19, 20],
      [11, 12, 13, 14, 15],
      [6, 7, 8, 9, 10],
      [1, 2, 3, 4, 5],
      [],
    ],
    running: false,
  },
  reverseHorizontalSweep: {
    sequence: [
      [5, 10, 15, 20, 25],
      [4, 9, 14, 19, 24],
      [3, 8, 13, 18, 23],
      [2, 7, 12, 17, 22],
      [1, 6, 11, 16, 21],
      [],
    ],
    running: false,
  },
  scissor: {
    sequence: [
      [1, 5, 21, 25],
      [2, 4, 6, 7, 9, 10, 16, 17, 19, 20, 22, 24],
      [3, 8, 11, 12, 13, 14, 15, 18, 23],
      [3, 8, 11, 12, 13, 14, 15, 18, 23],
      [3, 8, 11, 12, 13, 14, 15, 18, 23],
      [2, 4, 6, 7, 9, 10, 16, 17, 19, 20, 22, 24],
      [1, 5, 21, 25],
      [],
    ],
    running: false,
  },
  x: {
    sequence: [
      [3, 11, 15, 23],
      [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
      [1, 5, 7, 9, 13, 17, 19, 21, 25],
      [1, 5, 7, 9, 13, 17, 19, 21, 25],
      [1, 5, 7, 9, 13, 17, 19, 21, 25],
      [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
      [3, 11, 15, 23],
      [],
    ],
    running: false,
  },
  pulse: {
    sequence: [
      [13],
      [8, 12, 14, 18],
      [3, 7, 9, 11, 15, 17, 19, 23],
      [2, 4, 6, 10, 16, 20, 22, 24],
      [1, 5, 21, 25],
      [],
    ],
    running: false,
  },
  smallSpin: {
    sequence: [
      [8, 12, 14],
      [8, 14, 18],
      [12, 14, 18],
      [8, 12, 18],
      [8, 12, 14, 18],
      [8, 12, 14, 18],
      [8, 12, 14, 18],
      [3, 7, 9, 11, 15, 17, 19, 23],
      [2, 4, 6, 10, 16, 20, 22, 24],
      [1, 5, 21, 25],
      [],
    ],
    running: false,
  },
  largeSpin: {
    sequence: [
      [3, 7, 9, 11, 15, 17, 19],
      [3, 7, 9, 11, 15, 19, 23],
      [3, 7, 9, 15, 17, 19, 23],
      [3, 9, 11, 15, 17, 19, 23],
      [7, 9, 11, 15, 17, 19, 23],
      [3, 7, 11, 15, 17, 19, 23],
      [3, 7, 9, 11, 17, 19, 23],
      [3, 7, 9, 11, 15, 17, 23],
      [3, 7, 9, 11, 15, 17, 19, 23],
      [3, 7, 9, 11, 15, 17, 19, 23],
      [3, 7, 9, 11, 15, 17, 19, 23],
      [2, 4, 6, 10, 16, 20, 22, 24],
      [1, 5, 21, 25],
      [],
    ],
    running: false,
  },
  cross: {
    sequence: [[1], [7], [13], [19], [25], [5], [9], [13], [17], [21], []],
    running: false,
  },
  gravity: {
    sequence: [
      [1, 3, 5],
      [1, 3, 5, 6, 8, 10],
      [6, 8, 10, 11, 13, 15],
      [2, 4, 11, 13, 15, 16, 18, 20],
      [2, 4, 7, 9, 16, 18, 20, 21, 23, 25],
      [7, 9, 12, 14, 21, 23, 25],
      [12, 14, 17, 19],
      [17, 19, 22, 24],
      [22, 24],
      [],
    ],
    running: false,
  },
  antigravity: {
    sequence: [
      [21, 23, 25],
      [21, 23, 25, 16, 18, 20],
      [16, 18, 20, 11, 13, 15],
      [22, 24, 11, 13, 15, 6, 8, 10],
      [22, 24, 17, 19, 6, 8, 10, 1, 3, 5],
      [17, 19, 12, 14, 1, 3, 5],
      [12, 14, 7, 9],
      [7, 9, 2, 4],
      [2, 4],
      [],
    ],
    running: false,
  },
  topSmile: {
    sequence: [
      [2, 3, 4],
      [1, 5, 7, 8, 9],
      [6, 10, 12, 13, 14],
      [2, 4, 11, 15, 17, 18, 19],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [7, 9, 12, 14, 21, 25],
      [12, 14, 17, 19],
      [17, 19, 22, 24],
      [22, 24],
      [],
    ],
    running: false,
  },
  bottomSmile: {
    sequence: [
      [22, 24],
      [17, 19, 22, 24],
      [12, 14, 17, 19],
      [7, 9, 12, 14, 21, 25],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 11, 15, 17, 18, 19],
      [6, 10, 12, 13, 14],
      [1, 5, 7, 8, 9],
      [2, 3, 4],
      [],
    ],
    running: false,
  },
  leftSmile: {
    sequence: [
      [16],
      [1, 6, 17, 21],
      [2, 7, 13, 16, 17],
      [1, 6, 3, 8, 14, 16, 17, 18],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [3, 8, 5, 10, 17, 23, 24, 25],
      [4, 9, 18, 24, 25],
      [5, 10, 19, 25],
      [19],
      [],
    ],
    running: false,
  },
  rightSmile: {
    sequence: [
      [19],
      [5, 10, 19, 25],
      [4, 9, 18, 24, 25],
      [3, 8, 5, 10, 17, 23, 24, 25],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [1, 6, 3, 8, 14, 16, 17, 18],
      [2, 7, 13, 16, 17],
      [1, 6, 17, 21],
      [16],
      [],
    ],
    running: false,
  },
  spiral: {
    sequence: [
      [1],
      [2],
      [3],
      [4],
      [5],
      [10],
      [15],
      [20],
      [25],
      [24],
      [23],
      [22],
      [21],
      [16],
      [11],
      [6],
      [7],
      [8],
      [9],
      [14],
      [19],
      [18],
      [17],
      [12],
      [13],
      [],
    ],
    running: false,
  },
};

export default function FgSoundBoard({
  soundBoardButtonRef,
  closeCallback,
}: {
  soundBoardButtonRef?: HTMLButtonElement;
  closeCallback?: () => void;
}) {
  const [soundEffects, setSoundEffects] = useState<
    Record<
      number,
      {
        path: string;
        audio: HTMLAudioElement | undefined;
        playing: boolean;
        pressed: boolean;
        classes: string[];
      }
    >
  >({
    1: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    2: {
      path: "/backgroundMusic/backgroundMusic2.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    3: {
      path: "/backgroundMusic/backgroundMusic3.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    4: {
      path: "/backgroundMusic/backgroundMusic4.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    5: {
      path: "/backgroundMusic/backgroundMusic5.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    6: {
      path: "/backgroundMusic/backgroundMusic6.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    7: {
      path: "/backgroundMusic/backgroundMusic7.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    8: {
      path: "/backgroundMusic/backgroundMusic8.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    9: {
      path: "/backgroundMusic/backgroundMusic9.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    10: {
      path: "/backgroundMusic/backgroundMusic10.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    11: {
      path: "/backgroundMusic/backgroundMusic11.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    12: {
      path: "/backgroundMusic/backgroundMusic12.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    13: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    14: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    15: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    16: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    17: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    18: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    19: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    20: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    21: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    22: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    23: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    24: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
    25: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      pressed: false,
      classes: [],
    },
  });

  const boardEffectInterval = 75;

  const toggleButton = (key: number) => {
    setSoundEffects((prevEffects) => ({
      ...prevEffects,
      [key]: {
        ...prevEffects[key],
        pressed: !prevEffects[key].pressed,
      },
    }));
  };

  const boardEffectUpdater = (
    boardEffect: BoardEffects,
    boardIndex: number
  ) => {
    setSoundEffects((prevEffects) => {
      const newEffects = { ...prevEffects };

      for (const key in newEffects) {
        const updatedClasses = [...newEffects[key].classes];

        if (
          boardIndex - 1 >= 0 &&
          boardEffects[boardEffect].sequence[boardIndex - 1].includes(
            parseInt(key)
          )
        ) {
          newEffects[key].classes = updatedClasses.filter(
            (cls) => cls !== "active"
          );
        }
      }

      for (const key in newEffects) {
        const updatedClasses = [...newEffects[key].classes];

        if (
          boardEffects[boardEffect].sequence[boardIndex].includes(parseInt(key))
        ) {
          updatedClasses.push("active");
          newEffects[key].classes = updatedClasses;
        }
      }

      return newEffects;
    });
  };

  const getRandomKey = (): BoardEffects => {
    const keys = Object.keys(boardEffects) as BoardEffects[];
    return keys[Math.floor(Math.random() * keys.length)];
  };

  const startBoardEffect = () => {
    const boardEffect = getRandomKey();

    if (boardEffects[boardEffect].running) return;

    boardEffects[boardEffect].running = true;

    boardEffects[boardEffect].sequence.forEach(async (keys, index) => {
      setTimeout(
        () => boardEffectUpdater(boardEffect, index),
        index * boardEffectInterval
      );
    });

    setTimeout(() => {
      boardEffects[boardEffect].running = false;
    }, boardEffectInterval);
  };

  const toggleAudio = (key: number) => {
    setSoundEffects((prevEffects) => {
      const soundEffect = prevEffects[key];
      const { playing, audio, path } = soundEffect;

      if (playing && audio) {
        audio.pause();
        audio.currentTime = 0; // Reset the audio to the start

        // Remove the audio instance by setting it to undefined
        return {
          ...prevEffects,
          [key]: {
            ...soundEffect,
            audio: undefined,
            playing: false,
          },
        };
      } else {
        // Create a new Audio instance and start playing
        const newAudio = new Audio(path);
        newAudio.play();

        return {
          ...prevEffects,
          [key]: {
            ...soundEffect,
            audio: newAudio,
            playing: true,
          },
        };
      }
    });
  };

  const clickDown = (key: number) => {
    startBoardEffect();
    toggleButton(key);
    toggleAudio(key);
  };

  const clickUp = (key: number) => {
    toggleButton(key);
  };

  return (
    <FgPanel
      content={
        <div className='small-multidirectional-scroll-bar p-4 overflow-auto w-full h-full relative'>
          <div className='w-full h-full min-h-max min-w-max grid grid-cols-5 gap-3 items-center justify-center justify-items-center place-items-center'>
            {Object.entries(soundEffects).map(([key, effect]) => (
              <FgButton
                key={key}
                className={`sound-board-btn ${
                  effect.pressed ? "pressed" : ""
                } ${effect.classes.join(" ")}`}
                mouseDownFunction={() => clickDown(parseInt(key))}
                mouseUpFunction={() => clickUp(parseInt(key))}
                touchStartFunction={() => clickDown(parseInt(key))}
                touchEndFunction={() => clickUp(parseInt(key))}
                contentFunction={() => (
                  <>
                    <div className='sound-board-btn-alt-1'></div>
                    <div className='sound-board-btn-alt-2'></div>
                    <div className='sound-board-btn-alt-3'></div>
                  </>
                )}
              />
            ))}
          </div>
        </div>
      }
      minHeight={395}
      minWidth={395}
      initPosition={{
        x: 0,
        y: 0,
        referenceElement: soundBoardButtonRef,
        placement: "below",
      }}
      initHeight='395px'
      initWidth='395px'
      shadow={{ left: true, right: false, bottom: false, top: true }}
      closeCallback={closeCallback}
      closePosition='topRight'
    />
  );
}
