import {
  boardEffectColors,
  BoardEffectColors,
  BoardModes,
  crazyBoardEffects,
  CrazyBoardEffects,
  SoundEffects,
  SoundEffectsMetaData,
} from "./typeConstant";
import { UserMediaType } from "../../../context/mediaContext/typeConstant";

class FgSoundBoardController {
  crazyBoardEffectInterval = 75;
  seizureBoardEffectInterval = 150;

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
    >,
    private importButton: {
      pressed: boolean;
      seizureColor: string | undefined;
      classes: string[];
    },
    private setImportButton: React.Dispatch<
      React.SetStateAction<{
        pressed: boolean;
        seizureColor: string | undefined;
        classes: string[];
      }>
    >,
    private fileSelectorRef: React.RefObject<HTMLInputElement>,
    private importedFiles: Record<number, { file: File; path: string }>,
    private setImportedFiles: React.Dispatch<
      React.SetStateAction<Record<number, { file: File; path: string }>>
    >,
    private tempImportedFiles: React.MutableRefObject<FileList | undefined>,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private audioEndTimeouts: React.MutableRefObject<
      Record<number, NodeJS.Timeout | undefined>
    >,
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

  private carzyBoardEffectUpdater = (
    boardEffect: CrazyBoardEffects,
    boardIndex: number,
  ) => {
    this.setSoundEffects((prevEffects) => {
      const newEffects = { ...prevEffects };

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

      const updatedClasses = [...this.importButton.classes];

      if (
        boardIndex - 1 >= 0 &&
        crazyBoardEffects[boardEffect].sequence[boardIndex - 1].includes(1)
      ) {
        this.importButton.classes = updatedClasses.filter(
          (cls) => cls !== "active",
        );
      }

      if (crazyBoardEffects[boardEffect].sequence[boardIndex].includes(1)) {
        updatedClasses.push("active");
        this.importButton.classes = updatedClasses;
      }

      return newEffects;
    });
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
    this.setSoundEffects((prevEffects) => {
      const newEffects = { ...prevEffects };

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

      let updatedClasses = [...this.importButton.classes];

      if (this.importButton.seizureColor) {
        updatedClasses = updatedClasses.filter(
          (cls) => cls !== `active-${this.importButton.seizureColor}`,
        );
      }

      const seizureColor = this.getRandomColor();

      updatedClasses.push(`active-${seizureColor}`);
      this.importButton.classes = updatedClasses;
      this.importButton.seizureColor = seizureColor;

      return newEffects;
    });
  };

  private clearSeizureBoardEffect = () => {
    this.setSoundEffects((prevEffects) => {
      const newEffects = { ...prevEffects };

      for (const key in newEffects) {
        const updatedClasses = [...newEffects[key].classes];

        if (newEffects[key].seizureColor) {
          newEffects[key].classes = updatedClasses.filter(
            (cls) => cls !== `active-${newEffects[key].seizureColor}`,
          );
        }
      }

      const updatedClasses = [...this.importButton.classes];

      if (this.importButton.seizureColor) {
        this.importButton.classes = updatedClasses.filter(
          (cls) => cls !== `active-${this.importButton.seizureColor}`,
        );
      }

      return newEffects;
    });
  };

  private startSeizureBoardEffect = (key: number) => {
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

  private audioEnded = (key: number) => {
    if (this.seizureBoardEffectIntevalRef.current) {
      clearInterval(this.seizureBoardEffectIntevalRef.current);
      this.seizureBoardEffectIntevalRef.current = undefined;
    }
    if (this.seizureBoardEffectTimeoutRef.current) {
      clearTimeout(this.seizureBoardEffectTimeoutRef.current);
      this.seizureBoardEffectTimeoutRef.current = undefined;
    }
    this.clearSeizureBoardEffect();

    this.setSoundEffects((prev) => {
      return {
        ...prev,
        [key]: {
          ...prev[key],
          playing: false,
        },
      };
    });

    if (this.audioEndTimeouts.current[key]) {
      clearTimeout(this.audioEndTimeouts.current[key]);
      this.audioEndTimeouts.current[key] = undefined;
    }
  };

  private playAudio = async (key: number, path: string): Promise<boolean> => {
    const url = this.importedFiles[key] ? this.importedFiles[key].path : path;

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

    const { playing, path } = this.soundEffects[key];
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
      this.setSoundEffects((prevEffects) => {
        const soundEffect = prevEffects[key];
        const { playing, classes } = soundEffect;

        const newClasses = classes.includes("failed")
          ? classes.filter((cls) => cls !== "failed")
          : [...classes];

        if (playing) {
          return {
            ...prevEffects,
            [key]: {
              ...soundEffect,
              playing: false,
              classes: newClasses,
            },
          };
        } else {
          return {
            ...prevEffects,
            [key]: {
              ...soundEffect,
              playing: true,
              classes: newClasses,
            },
          };
        }
      });
    } else if (!this.soundEffects[key].classes.includes("failed")) {
      this.setSoundEffects((prevEffects) => {
        const soundEffect = prevEffects[key];
        return {
          ...prevEffects,
          [key]: {
            ...soundEffect,
            classes: [...soundEffect.classes, "failed"],
          },
        };
      });
    }

    return succeeded;
  };

  private toggleSeizureMode = (key: number) => {
    if (!this.soundEffects[key].playing && this.boardMode === "seizure") {
      this.startCrazyBoardEffect();
      this.startSeizureBoardEffect(key);
    } else if (this.soundEffects[key].playing && this.boardMode === "seizure") {
      if (this.seizureBoardEffectIntevalRef.current) {
        clearInterval(this.seizureBoardEffectIntevalRef.current);
        this.seizureBoardEffectIntevalRef.current = undefined;
      }
      if (this.seizureBoardEffectTimeoutRef.current) {
        clearTimeout(this.seizureBoardEffectTimeoutRef.current);
        this.seizureBoardEffectTimeoutRef.current = undefined;
      }
      this.clearSeizureBoardEffect();
    }
  };

  clickDown = async (key: number) => {
    if (this.tempImportedFiles.current === undefined) {
      this.toggleButton(key);
      const succeeded = await this.toggleAudio(key);

      if (!succeeded) {
        return;
      }

      if (!this.soundEffects[key].playing && this.boardMode === "crazy") {
        this.startCrazyBoardEffect();
      }
      this.toggleSeizureMode(key);
    } else {
      this.toggleButton(key);

      this.setImportedFiles((prev) => {
        const newImportedFiles = { ...prev };

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
      });
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

  handleImportEffectClickDown = () => {
    this.setImportButton((prevEffects) => ({
      ...prevEffects,
      pressed: true,
    }));

    this.fileSelectorRef.current?.click();

    window.addEventListener("focus", this.handleImportDerivedWindowFocusChange);
  };

  handleImportDerivedWindowFocusChange = () => {
    this.setImportButton((prevEffects) => ({
      ...prevEffects,
      pressed: false,
    }));

    window.removeEventListener(
      "focus",
      this.handleImportDerivedWindowFocusChange,
    );
  };

  handleImportEffectClickUp = () => {
    this.setImportButton((prevEffects) => ({
      ...prevEffects,
      pressed: false,
    }));
  };

  handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      this.tempImportedFiles.current = files;
    }

    this.setImportButton((prevEffects) => ({
      ...prevEffects,
      pressed: false,
    }));
  };
}

export default FgSoundBoardController;
