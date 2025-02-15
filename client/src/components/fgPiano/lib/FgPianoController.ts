import { v4 as uuidv4 } from "uuid";
import { UserMediaType } from "../../../context/mediaContext/typeConstant";
import { keys } from "./Scale";
import { Notes, NoteStore, Octaves, StringOctaves } from "../FgPiano";

export const keysMap: { [key: string]: string } = {
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
  shift: "shift",
  control: "control",
};

class FgPianoController {
  private heightGrowFactor = 5; // Height growth factor for pressed key
  private bottomGrowFactor = 5; // Bottom movement factor for released key

  constructor(
    private isUser: boolean,

    private userMedia: React.MutableRefObject<UserMediaType>,

    private scaleSectionContainerRef: React.RefObject<HTMLDivElement>,
    private scaleSectionRef: React.RefObject<HTMLDivElement>,

    private keyWidth: React.MutableRefObject<number>,

    private setVisibleOctave: React.Dispatch<React.SetStateAction<Octaves>>,
    private visibleOctaveRef: React.MutableRefObject<Octaves>,

    private keysPressed: React.MutableRefObject<string[]>,
    private shiftPressed: React.MutableRefObject<boolean>,
    private controlPressed: React.MutableRefObject<boolean>,

    private keyVisualizerActiveRef: React.MutableRefObject<boolean>,
    private keyVisualizerRef: React.RefObject<HTMLDivElement>,
    private visualizerAnimationFrameRef: React.MutableRefObject<
      number | undefined
    >,
    private keyVisualizerNotesStore: React.MutableRefObject<{
      [note in Notes]: NoteStore;
    }>
  ) {}

  playNote = (note: string, octave: number, isPress: boolean) => {
    if (this.isUser) {
      this.userMedia.current.audio?.playNote(`${note}${octave}`, isPress);
    }
  };

  getVisibleOctave = () => {
    if (!this.scaleSectionContainerRef.current) {
      return;
    }

    const octaveWidth = this.keyWidth.current * 7 + 6;
    const left = this.scaleSectionContainerRef.current.scrollLeft;
    const quarterWidth = this.scaleSectionContainerRef.current.clientWidth / 4;

    const octave = Math.round((left + quarterWidth) / octaveWidth);

    this.setVisibleOctave(octave as Octaves);
    this.visibleOctaveRef.current = octave as Octaves;
  };

  unpressOctave = (octave: Octaves) => {
    for (const key in keys.naturalKeys) {
      const keyElement = document.getElementById(`piano_key_${octave}_${key}`);
      keyElement?.classList.remove("pressed");
    }

    for (const key in keys.accidentalKeys) {
      const keyElement = document.getElementById(`piano_key_${octave}_${key}`);
      keyElement?.classList.remove("pressed");
    }
  };

  scrollToOctave = (octave: Octaves) => {
    if (!this.scaleSectionContainerRef.current) {
      return;
    }

    const octaveWidth = this.keyWidth.current * 7 + 6;
    const octaveLeftPosition = octaveWidth * octave;

    this.scaleSectionContainerRef.current.scrollTo({
      left: octaveLeftPosition,
      behavior: "instant",
    });

    this.setVisibleOctave(octave);
    this.visibleOctaveRef.current = octave;
  };

  handleKeyUp = (eventKey: string, octave: Octaves) => {
    const pianoKey = keysMap[eventKey];

    if (this.keyVisualizerActiveRef.current && this.keyVisualizerRef.current) {
      if (pianoKey === "shift" || pianoKey === "control") {
        const children = Array.from(this.keyVisualizerRef.current.children);
        children.forEach((child) => {
          const [key] = child.id.split("_");
          const [_childKey, childOctave] = key.split("-fg-");

          if (parseInt(childOctave) === octave) {
            child.classList.remove("key-visualizer-currently-pressed");
          }
        });
      } else {
        const children = Array.from(this.keyVisualizerRef.current.children);
        children.forEach((child) => {
          const [key] = child.id.split("_");
          const [childKey, childOctave] = key.split("-fg-");

          if (childKey === pianoKey && parseInt(childOctave) === octave) {
            child.classList.remove("key-visualizer-currently-pressed");
          }
        });
      }
    }

    if (pianoKey) {
      if (pianoKey === "shift") {
        this.unpressOctave(octave);
        this.shiftPressed.current = false;
        this.keysPressed.current = this.keysPressed.current.filter(
          (key) => key !== pianoKey
        );
      } else if (pianoKey === "control") {
        this.unpressOctave(octave);
        this.controlPressed.current = false;
        this.keysPressed.current = this.keysPressed.current.filter(
          (key) => key !== pianoKey
        );
      } else {
        const key = document.getElementById(`piano_key_${octave}_${pianoKey}`);
        key?.classList.remove("pressed");

        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== pianoKey
        );

        this.playNote(pianoKey, octave, false);
      }
    }
  };

  handleKeyDown = (eventKey: string, octave: Octaves) => {
    const pianoKey = keysMap[eventKey];

    if (
      this.keyVisualizerRef.current &&
      this.keyVisualizerActiveRef.current &&
      !this.keysPressed.current.includes(pianoKey)
    ) {
      if (this.visualizerAnimationFrameRef.current === undefined) {
        // Start the animation loop to update continuously
        this.visualizerAnimationFrameRef.current = requestAnimationFrame(
          this.updateVisualizerAnimations
        );
      }

      if (pianoKey === "shift" || pianoKey === "control") {
        const children = Array.from(this.keyVisualizerRef.current.children);
        children.forEach((child) => {
          const [key] = child.id.split("_");
          const [_childKey, childOctave] = key.split("-fg-");

          if (parseInt(childOctave) === this.visibleOctaveRef.current) {
            child.classList.remove("key-visualizer-currently-pressed");
          }
        });
      } else {
        const newKeyElement = document.createElement("div");
        const key = `${pianoKey}-fg-${octave}`;
        newKeyElement.id = `${key}_${uuidv4()}`;
        newKeyElement.style.bottom = "0px";
        newKeyElement.style.height = "1px";
        newKeyElement.classList.add(key);
        newKeyElement.classList.add("key-visualizer-key");
        newKeyElement.classList.add("key-visualizer-currently-pressed");

        this.keyVisualizerRef.current.appendChild(newKeyElement);

        this.keyVisualizerNotesStore.current[pianoKey as Notes][
          `${octave}`
        ].push(newKeyElement);
      }
    }

    if (pianoKey && !this.keysPressed.current.includes(pianoKey)) {
      if (pianoKey === "shift") {
        this.unpressOctave(octave);
        this.shiftPressed.current = true;
        this.keysPressed.current = [...this.keysPressed.current, pianoKey];
      } else if (pianoKey === "control") {
        this.unpressOctave(octave);
        this.controlPressed.current = true;
        this.keysPressed.current = [...this.keysPressed.current, pianoKey];
      } else {
        const key = document.getElementById(`piano_key_${octave}_${pianoKey}`);
        key?.classList.add("pressed");

        this.keysPressed.current = [...this.keysPressed.current, pianoKey];

        this.playNote(pianoKey, octave, true);
      }
    }
  };

  resize = () => {
    if (
      !this.scaleSectionRef.current ||
      !this.scaleSectionContainerRef.current
    ) {
      return;
    }

    const heightInPixels = this.scaleSectionRef.current.offsetHeight;
    const newKeyWidth = heightInPixels * 0.15;

    this.keyWidth.current = newKeyWidth;

    this.scaleSectionContainerRef.current.style.setProperty(
      "--key-width",
      `${this.keyWidth.current}px`
    );
    this.scaleSectionContainerRef.current.style.setProperty(
      "--key-border-style",
      this.keyWidth.current > 32 ? "solid" : "none"
    );
    this.scaleSectionContainerRef.current.style.setProperty(
      "--scale-section-container-width",
      `${this.scaleSectionContainerRef.current.clientWidth}px`
    );

    this.getVisibleOctave();

    const piano: HTMLElement | null = document.querySelector(".piano");
    const octaveLabel = document.querySelector(".octave-label");
    const octaveContainer = document.querySelector(".octave-container");

    if (piano) {
      if (piano.offsetWidth > 390) {
        octaveLabel?.classList.remove("hidden");
        octaveContainer?.classList.add("space-x-2");
      } else {
        octaveLabel?.classList.add("hidden");
        octaveContainer?.classList.remove("space-x-2");
      }
    }

    const selectSamplerLabel: HTMLElement | null = document.querySelector(
      ".select-sampler-label"
    );

    if (piano && selectSamplerLabel) {
      selectSamplerLabel.classList.remove("truncate", "w-max");
      selectSamplerLabel.style.width = "";

      if (selectSamplerLabel.clientWidth > piano.clientWidth / 4) {
        selectSamplerLabel.classList.add("truncate");
        selectSamplerLabel.style.width = `${piano.clientWidth / 4}px`;
      } else {
        selectSamplerLabel.classList.add("w-max");
      }
    }
  };
  private lastExecutionTime = 0;

  updateVisualizerAnimations = () => {
    const now = performance.now();
    if (now - this.lastExecutionTime < 32) {
      this.visualizerAnimationFrameRef.current = requestAnimationFrame(
        this.updateVisualizerAnimations
      );
      return;
    } // 16ms ~ 60FPS

    this.lastExecutionTime = now;
    if (
      !this.keyVisualizerRef.current ||
      !this.keyVisualizerNotesStore.current
    ) {
      this.visualizerAnimationFrameRef.current = requestAnimationFrame(
        this.updateVisualizerAnimations
      );
      return;
    }

    let atLeastOneDiv = false;

    const keyVisualizerHeight = this.keyVisualizerRef.current.clientHeight;
    const noteStores = Object.keys(this.keyVisualizerNotesStore.current);
    noteStores.forEach((note) => {
      const octaveStores = Object.entries(
        this.keyVisualizerNotesStore.current[note as Notes]
      );
      octaveStores.forEach(([octave, elements]) => {
        elements.forEach((element, index) => {
          atLeastOneDiv = true;

          const { style, classList } = element;
          if (classList.contains("key-visualizer-currently-pressed")) {
            const currentHeight = parseInt(
              style.height.slice(0, -2) || "0",
              10
            );
            style.height = `${currentHeight + this.heightGrowFactor}px`;
          } else {
            const newBottom =
              parseInt(style.bottom.slice(0, -2) || "0", 10) +
              this.bottomGrowFactor;

            if (newBottom <= keyVisualizerHeight + 5) {
              style.bottom = `${newBottom}px`;
            } else {
              if (element.isConnected) {
                element.remove();
                this.keyVisualizerNotesStore.current[note as Notes][
                  octave as StringOctaves
                ].splice(index, 1);
              }
            }
          }
        });
      });
    });

    if (atLeastOneDiv) {
      // Continue updating using requestAnimationFrame for smooth animation
      this.visualizerAnimationFrameRef.current = requestAnimationFrame(
        this.updateVisualizerAnimations
      );
    } else {
      if (this.visualizerAnimationFrameRef.current) {
        cancelAnimationFrame(this.visualizerAnimationFrameRef.current);
        this.visualizerAnimationFrameRef.current = undefined;
      }
    }
  };
}

export default FgPianoController;
