import {
  boardEffectColors,
  BoardEffectColors,
  BoardModes,
  crazyBoardEffects,
  CrazyBoardEffects,
  SoundEffects,
  SoundEffectsMetaData,
} from "./typeConstant";
import { UserMediaType } from "../../../context/mediaContext/lib/typeConstant";

class FgSoundBoardController {
  crazyBoardEffectInterval = 75;
  seizureBoardEffectInterval = 150;

  constructor(
    private soundEffects: React.MutableRefObject<SoundEffects>,
    private soundEffectsMetaDataRef: React.MutableRefObject<SoundEffectsMetaData>,
    private boardMode: React.MutableRefObject<BoardModes>,
    private seizureBoardEffectIntevalRef: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private seizureBoardEffectTimeoutRef: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private importButton: React.MutableRefObject<{
      pressed: boolean;
      seizureColor: string | undefined;
      classes: string[];
    }>,
    private fileSelectorRef: React.RefObject<HTMLInputElement>,
    private importedFiles: React.MutableRefObject<
      Record<
        number,
        {
          file: File;
          path: string;
        }
      >
    >,
    private tempImportedFiles: React.MutableRefObject<FileList | undefined>,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private audioEndTimeouts: React.MutableRefObject<
      Record<number, NodeJS.Timeout | undefined>
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  toggleButton = (key: number) => {
    this.soundEffects.current = {
      ...this.soundEffects.current,
      [key]: {
        ...this.soundEffects.current[key],
        pressed: !this.soundEffects.current[key].pressed,
      },
    };
    this.setRerender((prev) => !prev);
  };

  private carzyBoardEffectUpdater = (
    boardEffect: CrazyBoardEffects,
    boardIndex: number,
  ) => {
    this.soundEffects.current = (() => {
      const newEffects = { ...this.soundEffects.current };

      for (const key in newEffects) {
        const updatedClasses = [...newEffects[key].classes];

        if (
          boardIndex - 1 >= 0 &&
          crazyBoardEffects[boardEffect].sequence[boardIndex - 1].includes(
            parseInt(key),
          )
        ) {
          newEffects[key].classes = updatedClasses.filter(
            (cls) => cls !== "active",
          );
        }

        if (
          crazyBoardEffects[boardEffect].sequence[boardIndex].includes(
            parseInt(key),
          )
        ) {
          updatedClasses.push("active");
          newEffects[key].classes = updatedClasses;
        }
      }

      const updatedClasses = [...this.importButton.current.classes];

      if (
        boardIndex - 1 >= 0 &&
        crazyBoardEffects[boardEffect].sequence[boardIndex - 1].includes(1)
      ) {
        this.importButton.current.classes = updatedClasses.filter(
          (cls) => cls !== "active",
        );
      }

      if (crazyBoardEffects[boardEffect].sequence[boardIndex].includes(1)) {
        updatedClasses.push("active");
        this.importButton.current.classes = updatedClasses;
      }

      return newEffects;
    })();
    this.setRerender((prev) => !prev);
  };

  private getRandomCrazyBoardEffect = (): CrazyBoardEffects => {
    const keys = Object.keys(crazyBoardEffects) as CrazyBoardEffects[];
    return keys[Math.floor(Math.random() * keys.length)];
  };

  private startCrazyBoardEffect = () => {
    const boardEffect = this.getRandomCrazyBoardEffect();

    if (crazyBoardEffects[boardEffect].running) {
      return;
    }

    crazyBoardEffects[boardEffect].running = true;

    crazyBoardEffects[boardEffect].sequence.forEach(async (_, index) => {
      setTimeout(
        () => this.carzyBoardEffectUpdater(boardEffect, index),
        index * this.crazyBoardEffectInterval,
      );
    });

    setTimeout(() => {
      crazyBoardEffects[boardEffect].running = false;
    }, this.crazyBoardEffectInterval);
  };

  private getRandomColor = (): BoardEffectColors => {
    return boardEffectColors[
      Math.floor(Math.random() * boardEffectColors.length)
    ];
  };

  private seizureBoardEffect = () => {
    this.soundEffects.current = (() => {
      const newEffects = { ...this.soundEffects.current };

      for (const key in newEffects) {
        let updatedClasses = [...newEffects[key].classes];

        if (newEffects[key].seizureColor) {
          updatedClasses = updatedClasses.filter(
            (cls) => cls !== `active-${newEffects[key].seizureColor}`,
          );
        }

        const seizureColor = this.getRandomColor();

        updatedClasses.push(`active-${seizureColor}`);
        newEffects[key].classes = updatedClasses;
        newEffects[key].seizureColor = seizureColor;
      }

      let updatedClasses = [...this.importButton.current.classes];

      if (this.importButton.current.seizureColor) {
        updatedClasses = updatedClasses.filter(
          (cls) => cls !== `active-${this.importButton.current.seizureColor}`,
        );
      }

      const seizureColor = this.getRandomColor();

      updatedClasses.push(`active-${seizureColor}`);
      this.importButton.current.classes = updatedClasses;
      this.importButton.current.seizureColor = seizureColor;

      return newEffects;
    })();
    this.setRerender((prev) => !prev);
  };

  private clearSeizureBoardEffect = () => {
    this.soundEffects.current = (() => {
      const newEffects = { ...this.soundEffects.current };

      for (const key in newEffects) {
        const updatedClasses = [...newEffects[key].classes];

        if (newEffects[key].seizureColor) {
          newEffects[key].classes = updatedClasses.filter(
            (cls) => cls !== `active-${newEffects[key].seizureColor}`,
          );
        }
      }

      const updatedClasses = [...this.importButton.current.classes];

      if (this.importButton.current.seizureColor) {
        this.importButton.current.classes = updatedClasses.filter(
          (cls) => cls !== `active-${this.importButton.current.seizureColor}`,
        );
      }

      return newEffects;
    })();
    this.setRerender((prev) => !prev);
  };

  private startSeizureBoardEffect = () => {
    if (this.seizureBoardEffectIntevalRef.current) {
      clearInterval(this.seizureBoardEffectIntevalRef.current);
      this.seizureBoardEffectIntevalRef.current = undefined;
      this.clearSeizureBoardEffect();
    }

    this.seizureBoardEffectIntevalRef.current = setInterval(() => {
      this.seizureBoardEffect();
    }, this.seizureBoardEffectInterval);
  };

  private audioEnded = (key: number) => {
    if (this.seizureBoardEffectIntevalRef.current) {
      clearInterval(this.seizureBoardEffectIntevalRef.current);
      this.seizureBoardEffectIntevalRef.current = undefined;
    }

    this.soundEffects.current = {
      ...this.soundEffects.current,
      [key]: {
        ...this.soundEffects.current[key],
        playing: false,
      },
    };
    this.clearSeizureBoardEffect();

    if (this.audioEndTimeouts.current[key]) {
      clearTimeout(this.audioEndTimeouts.current[key]);
      this.audioEndTimeouts.current[key] = undefined;
    }
  };

  private playAudio = async (key: number, path: string): Promise<boolean> => {
    const url = this.importedFiles.current[key]
      ? this.importedFiles.current[key].path
      : path;

    // Start playback with Tone.js and load the sound if it hasn't been loaded
    if (
      !this.userMedia.current.audio?.audioEffects.fgSoundEffects.players[key]
    ) {
      await this.userMedia.current.audio?.audioEffects.fgSoundEffects.loadSoundEffect(
        key,
        url,
      );
    } else if (
      this.userMedia.current.audio?.audioEffects.fgSoundEffects.players[key]
        .url !== url
    ) {
      this.userMedia.current.audio?.audioEffects.fgSoundEffects.swapPlayer(
        key,
        url,
      );
    }

    if (
      this.userMedia.current.audio?.audioEffects.fgSoundEffects.players[key]
        .player.buffer.duration
    ) {
      this.audioEndTimeouts.current[key] = setTimeout(() => {
        this.audioEnded(key);
      }, this.userMedia.current.audio.audioEffects.fgSoundEffects.players[key].player.buffer.duration * 1000);
    }

    return (
      this.userMedia.current.audio?.audioEffects.fgSoundEffects.toggleAudio(
        key,
        false,
      ) ?? false
    );
  };

  closeSoundBoard = () => {
    this.userMedia.current.audio?.audioEffects.fgSoundEffects.endAllSoundEffects();
  };

  private toggleAudio = async (key: number): Promise<boolean> => {
    let succeeded = false;

    const { playing, path } = this.soundEffects.current[key];
    if (playing) {
      // Stop playback
      succeeded =
        this.userMedia.current.audio?.audioEffects.fgSoundEffects.toggleAudio(
          key,
          true,
        ) ?? false;
    } else {
      succeeded = await this.playAudio(key, path);
    }

    if (succeeded) {
      this.soundEffects.current = (() => {
        const soundEffect = this.soundEffects.current[key];
        const { playing, classes } = soundEffect;

        const newClasses = classes.includes("failed")
          ? classes.filter((cls) => cls !== "failed")
          : [...classes];

        if (playing) {
          return {
            ...this.soundEffects.current,
            [key]: {
              ...soundEffect,
              playing: false,
              classes: newClasses,
            },
          };
        } else {
          return {
            ...this.soundEffects.current,
            [key]: {
              ...soundEffect,
              playing: true,
              classes: newClasses,
            },
          };
        }
      })();
      this.setRerender((prev) => !prev);
    } else {
      if (!succeeded) this.clearSeizureBoardEffect();
      if (!this.soundEffects.current[key].classes.includes("failed")) {
        this.soundEffects.current = {
          ...this.soundEffects.current,
          [key]: {
            ...this.soundEffects.current[key],
            classes: [...this.soundEffects.current[key].classes, "failed"],
          },
        };
      }
    }

    return succeeded;
  };

  private toggleSeizureMode = (key: number) => {
    if (
      !this.soundEffects.current[key].playing &&
      this.boardMode.current === "seizure"
    ) {
      this.startCrazyBoardEffect();
      this.startSeizureBoardEffect();
    } else if (
      this.soundEffects.current[key].playing &&
      this.boardMode.current === "seizure"
    ) {
      if (this.seizureBoardEffectIntevalRef.current) {
        clearInterval(this.seizureBoardEffectIntevalRef.current);
        this.seizureBoardEffectIntevalRef.current = undefined;
      }
      this.clearSeizureBoardEffect();
    }
  };

  clickDown = async (key: number) => {
    if (this.tempImportedFiles.current === undefined) {
      this.toggleButton(key);
      if (this.boardMode.current === "crazy") {
        if (!this.soundEffects.current[key].playing)
          this.startCrazyBoardEffect();
      } else {
        this.toggleSeizureMode(key);
      }
      const succeeded = await this.toggleAudio(key);

      if (!succeeded) {
        return;
      }
    } else {
      this.toggleButton(key);

      this.importedFiles.current = (() => {
        const newImportedFiles = { ...this.importedFiles.current };

        if (this.tempImportedFiles.current) {
          // Convert FileList to an array and process the first file
          const filesArray = Array.from(this.tempImportedFiles.current);
          newImportedFiles[key] = {
            file: filesArray[0],
            path: URL.createObjectURL(filesArray[0]),
          };

          // Update tempImportedFiles to remove the first element
          this.tempImportedFiles.current = filesArray.slice(
            1,
          ) as unknown as FileList;

          if (this.tempImportedFiles.current.length === 0) {
            this.tempImportedFiles.current = undefined;
          }
        }

        return newImportedFiles;
      })();
    }
  };

  clickUp = (key: number) => {
    this.toggleButton(key);
  };

  stateChangeFunction = (state: 0 | 1 | 2) => {
    if (state === 0) {
      this.boardMode.current = "standard";
    } else if (state === 1) {
      this.boardMode.current = "crazy";
    } else {
      this.boardMode.current = "seizure";
    }
  };

  handleImportEffectClickDown = () => {
    this.importButton.current = {
      ...this.importButton.current,
      pressed: true,
    };
    this.setRerender((prev) => !prev);

    this.fileSelectorRef.current?.click();

    window.addEventListener("focus", this.handleImportDerivedWindowFocusChange);
  };

  handleImportDerivedWindowFocusChange = () => {
    this.importButton.current = {
      ...this.importButton.current,
      pressed: false,
    };
    this.setRerender((prev) => !prev);

    window.removeEventListener(
      "focus",
      this.handleImportDerivedWindowFocusChange,
    );
  };

  handleImportEffectClickUp = () => {
    this.importButton.current = {
      ...this.importButton.current,
      pressed: false,
    };
    this.setRerender((prev) => !prev);
  };

  handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      this.tempImportedFiles.current = files;
    }

    this.importButton.current = {
      ...this.importButton.current,
      pressed: false,
    };
    this.setRerender((prev) => !prev);
  };
}

export default FgSoundBoardController;
