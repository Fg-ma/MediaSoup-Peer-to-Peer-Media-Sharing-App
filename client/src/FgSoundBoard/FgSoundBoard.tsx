import React, { useState } from "react";
import FgPanel from "../fgPanel/FgPanel";
import FgButton from "../fgButton/FgButton";
import "./soundBoard.css";

export default function FgSoundBoard() {
  const [soundEffects, setSoundEffects] = useState<
    Record<
      number,
      {
        path: string;
        audio: HTMLAudioElement | undefined;
        playing: boolean;
        active: boolean;
      }
    >
  >({
    1: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    2: {
      path: "/backgroundMusic/backgroundMusic2.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    3: {
      path: "/backgroundMusic/backgroundMusic3.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    4: {
      path: "/backgroundMusic/backgroundMusic4.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    5: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    6: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    7: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    8: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    9: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    10: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    11: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    12: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    13: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    14: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    15: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    16: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    17: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    18: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    19: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    20: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    21: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    22: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    23: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    24: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
    25: {
      path: "/backgroundMusic/backgroundMusic1.mp3",
      audio: undefined,
      playing: false,
      active: false,
    },
  });

  const toggleButton = (key: number) => {
    setSoundEffects((prevEffects) => ({
      ...prevEffects,
      [key]: {
        ...prevEffects[key],
        active: !prevEffects[key].active,
      },
    }));
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
                className={`sound-board-btn ${effect.active ? "active" : ""}`}
                mouseDownFunction={() => clickDown(parseInt(key))}
                mouseUpFunction={() => clickUp(parseInt(key))}
                touchStartFunction={() => clickDown(parseInt(key))}
                touchEndFunction={() => clickUp(parseInt(key))}
                contentFunction={() => (
                  <>
                    <div className='sound-board-btn-alt-1'></div>
                    <div className='sound-board-btn-alt-2'></div>
                  </>
                )}
              />
            ))}
          </div>
        </div>
      }
      minHeight={395}
      minWidth={395}
      initPosition={{ x: 0, y: 0 }}
      initHeight='395px'
      initWidth='395px'
      backgroundColor='#f3f3f3'
      secondaryBackgroundColor='#d9d9d9'
      shadow={{ left: true, right: false, bottom: false, top: true }}
    />
  );
}
