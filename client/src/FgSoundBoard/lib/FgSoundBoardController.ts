import { BoardModes } from "../FgSoundBoard";
import {
  boardEffectColors,
  BoardEffectColors,
  crazyBoardEffects,
  CrazyBoardEffects,
  SoundEffects,
  SoundEffectsMetaData,
} from "./typeConstants";

class FgSoundBoardController {
  crazyBoardEffectInterval = 75;
  seizureBoardEffectInterval = 75;

  constructor(
    private soundEffects: SoundEffects,
    private setSoundEffects: React.Dispatch<React.SetStateAction<SoundEffects>>,
    private soundEffectsMetaDataRef: React.MutableRefObject<SoundEffectsMetaData>,
    private boardMode: BoardModes,
    private setBoardMode: React.Dispatch<React.SetStateAction<BoardModes>>,
    private seizureBoardEffectIntevalRef: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private seizureBoardEffectTimeoutRef: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >
  ) {}

  toggleButton = (key: number) => {
    this.setSoundEffects((prevEffects) => ({
      ...prevEffects,
      [key]: {
        ...prevEffects[key],
        pressed: !prevEffects[key].pressed,
      },
    }));
  };

  boardEffectUpdater = (boardEffect: CrazyBoardEffects, boardIndex: number) => {
    this.setSoundEffects((prevEffects) => {
      const newEffects = { ...prevEffects };

      for (const key in newEffects) {
        const updatedClasses = [...newEffects[key].classes];

        if (
          boardIndex - 1 >= 0 &&
          crazyBoardEffects[boardEffect].sequence[boardIndex - 1].includes(
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
          crazyBoardEffects[boardEffect].sequence[boardIndex].includes(
            parseInt(key)
          )
        ) {
          updatedClasses.push("active");
          newEffects[key].classes = updatedClasses;
        }
      }

      return newEffects;
    });
  };

  getRandomCrazyBoardEffect = (): CrazyBoardEffects => {
    const keys = Object.keys(crazyBoardEffects) as CrazyBoardEffects[];
    return keys[Math.floor(Math.random() * keys.length)];
  };

  startCrazyBoardEffect = () => {
    const boardEffect = this.getRandomCrazyBoardEffect();

    if (crazyBoardEffects[boardEffect].running) {
      return;
    }

    crazyBoardEffects[boardEffect].running = true;

    crazyBoardEffects[boardEffect].sequence.forEach(async (keys, index) => {
      setTimeout(
        () => this.boardEffectUpdater(boardEffect, index),
        index * this.crazyBoardEffectInterval
      );
    });

    setTimeout(() => {
      crazyBoardEffects[boardEffect].running = false;
    }, this.crazyBoardEffectInterval);
  };

  getRandomColor = (): BoardEffectColors => {
    return boardEffectColors[
      Math.floor(Math.random() * boardEffectColors.length)
    ];
  };

  seizureBoardEffect = () => {
    this.setSoundEffects((prevEffects) => {
      const newEffects = { ...prevEffects };

      for (const key in newEffects) {
        const updatedClasses = [...newEffects[key].classes];

        if (newEffects[key].seizureColor) {
          newEffects[key].classes = updatedClasses.filter(
            (cls) => cls !== `active-${newEffects[key].seizureColor}`
          );
        }
      }

      for (const key in newEffects) {
        const seizureColor = this.getRandomColor();

        const updatedClasses = [...newEffects[key].classes];

        updatedClasses.push(`active-${seizureColor}`);
        newEffects[key].classes = updatedClasses;
        newEffects[key].seizureColor = seizureColor;
      }

      return newEffects;
    });
  };

  clearSeizureBoardEffect = () => {
    this.setSoundEffects((prevEffects) => {
      const newEffects = { ...prevEffects };

      for (const key in newEffects) {
        const updatedClasses = [...newEffects[key].classes];

        if (newEffects[key].seizureColor) {
          newEffects[key].classes = updatedClasses.filter(
            (cls) => cls !== `active-${newEffects[key].seizureColor}`
          );
        }
      }

      return newEffects;
    });
  };

  startSeizureBoardEffect = (key: number) => {
    if (this.seizureBoardEffectIntevalRef.current) {
      clearInterval(this.seizureBoardEffectIntevalRef.current);
      this.seizureBoardEffectIntevalRef.current = undefined;
      this.clearSeizureBoardEffect();
    }
    if (this.seizureBoardEffectTimeoutRef.current) {
      clearTimeout(this.seizureBoardEffectTimeoutRef.current);
      this.seizureBoardEffectTimeoutRef.current = undefined;
    }

    this.seizureBoardEffectIntevalRef.current = setInterval(() => {
      this.seizureBoardEffect();
    }, this.seizureBoardEffectInterval);

    if (this.soundEffectsMetaDataRef.current[key].duration !== 0) {
      this.seizureBoardEffectTimeoutRef.current = setTimeout(() => {
        if (this.seizureBoardEffectIntevalRef.current) {
          clearInterval(this.seizureBoardEffectIntevalRef.current);
          this.seizureBoardEffectIntevalRef.current = undefined;
          this.clearSeizureBoardEffect();
        }
      }, this.soundEffectsMetaDataRef.current[key].duration * 1000);
    } else {
      this.soundEffectsMetaDataRef.current[key].timeoutOnMetaLoaded = true;
    }
  };

  audioEnded = (key: number) => {
    this.setSoundEffects((prevEffects) => {
      const soundEffect = prevEffects[key];
      const { playing, audio, path } = soundEffect;

      if (playing && audio) {
        audio.pause();
        audio.currentTime = 0; // Reset the audio to the start

        audio.removeEventListener("ended", () => this.audioEnded(key));

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
        return prevEffects;
      }
    });
  };

  toggleAudio = (key: number) => {
    this.setSoundEffects((prevEffects) => {
      const soundEffect = prevEffects[key];
      const {
        playing,
        audio,
        path,
        audioEndedListener,
        metadataLoadedListener,
      } = soundEffect;

      if (playing && audio) {
        audio.pause();
        audio.currentTime = 0; // Reset the audio to the start

        if (audioEndedListener)
          audio.removeEventListener("ended", audioEndedListener);
        if (metadataLoadedListener)
          audio.removeEventListener("loadedmetadata", metadataLoadedListener);

        this.soundEffectsMetaDataRef.current[key] = {
          duration: 0,
          timeoutOnMetaLoaded: false,
        };

        if (this.seizureBoardEffectIntevalRef.current) {
          clearInterval(this.seizureBoardEffectIntevalRef.current);
          this.seizureBoardEffectIntevalRef.current = undefined;
          this.clearSeizureBoardEffect();
        }
        if (this.seizureBoardEffectTimeoutRef.current) {
          clearTimeout(this.seizureBoardEffectTimeoutRef.current);
          this.seizureBoardEffectTimeoutRef.current = undefined;
        }

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

        const audioEndedListener = () => this.audioEnded(key);
        const metadataLoadedListener = () => {
          this.soundEffectsMetaDataRef.current[key].duration =
            newAudio.duration;

          if (this.soundEffectsMetaDataRef.current[key].timeoutOnMetaLoaded) {
            this.seizureBoardEffectTimeoutRef.current = setTimeout(() => {
              if (this.seizureBoardEffectIntevalRef.current) {
                clearInterval(this.seizureBoardEffectIntevalRef.current);
                this.seizureBoardEffectIntevalRef.current = undefined;
                this.clearSeizureBoardEffect();
              }
            }, this.soundEffectsMetaDataRef.current[key].duration * 1000);
          }
        };

        newAudio.addEventListener("ended", audioEndedListener);
        newAudio.addEventListener("loadedmetadata", metadataLoadedListener);

        return {
          ...prevEffects,
          [key]: {
            ...soundEffect,
            audio: newAudio,
            playing: true,
            audioEndedListener,
            metadataLoadedListener,
          },
        };
      }
    });
  };

  clickDown = (key: number) => {
    this.toggleAudio(key);
    this.toggleButton(key);

    if (!this.soundEffects[key].playing && this.boardMode === "crazy") {
      this.startCrazyBoardEffect();
    }
    if (!this.soundEffects[key].playing && this.boardMode === "seizure") {
      this.startCrazyBoardEffect();
      this.startSeizureBoardEffect(key);
    }
  };

  clickUp = (key: number) => {
    this.toggleButton(key);
  };

  stateChangeFunction = (state: 0 | 1 | 2) => {
    if (state === 0) {
      this.setBoardMode("standard");
    } else if (state === 1) {
      this.setBoardMode("crazy");
    } else {
      this.setBoardMode("seizure");
    }
  };
}

export default FgSoundBoardController;
