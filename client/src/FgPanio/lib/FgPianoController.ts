import { keys } from "./Scale";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import AudioMedia from "../../lib/AudioMedia";
import { Octaves } from "../FgPiano";

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
  private isUser: boolean;

  private userMedia: React.MutableRefObject<{
    camera: {
      [cameraId: string]: CameraMedia;
    };
    screen: {
      [screenId: string]: ScreenMedia;
    };
    audio: AudioMedia | undefined;
  }>;

  private scaleSectionContainerRef: React.RefObject<HTMLDivElement>;
  private scaleSectionRef: React.RefObject<HTMLDivElement>;

  private keyWidth: React.MutableRefObject<number>;

  private setVisibleOctave: React.Dispatch<React.SetStateAction<Octaves>>;
  private visibleOctaveRef: React.MutableRefObject<Octaves>;

  private keysPressed: React.MutableRefObject<string[]>;
  private setKeyPresses: React.Dispatch<
    React.SetStateAction<{
      [key: string]: {
        currentlyPressed: boolean;
        height: number;
        bottom: number;
      }[];
    }>
  >;
  private shiftPressed: React.MutableRefObject<boolean>;
  private controlPressed: React.MutableRefObject<boolean>;

  private keyVisualizerRef: React.RefObject<HTMLDivElement>;
  private visualizerAnimationFrameRef: React.MutableRefObject<
    number | undefined
  >;

  private heightGrowFactor = 1.5; // Height growth factor for pressed key
  private bottomGrowFactor = 1.5; // Bottom movement factor for released key

  constructor(
    isUser: boolean,

    userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,

    scaleSectionContainerRef: React.RefObject<HTMLDivElement>,
    scaleSectionRef: React.RefObject<HTMLDivElement>,

    keyWidth: React.MutableRefObject<number>,

    setVisibleOctave: React.Dispatch<React.SetStateAction<Octaves>>,
    visibleOctaveRef: React.MutableRefObject<Octaves>,

    keysPressed: React.MutableRefObject<string[]>,
    setKeyPresses: React.Dispatch<
      React.SetStateAction<{
        [key: string]: {
          currentlyPressed: boolean;
          height: number;
          bottom: number;
        }[];
      }>
    >,
    shiftPressed: React.MutableRefObject<boolean>,
    controlPressed: React.MutableRefObject<boolean>,

    keyVisualizerRef: React.RefObject<HTMLDivElement>,
    visualizerAnimationFrameRef: React.MutableRefObject<number | undefined>
  ) {
    this.isUser = isUser;
    this.userMedia = userMedia;
    this.scaleSectionContainerRef = scaleSectionContainerRef;
    this.scaleSectionRef = scaleSectionRef;
    this.keyWidth = keyWidth;
    this.setVisibleOctave = setVisibleOctave;
    this.visibleOctaveRef = visibleOctaveRef;
    this.keysPressed = keysPressed;
    this.setKeyPresses = setKeyPresses;
    this.shiftPressed = shiftPressed;
    this.controlPressed = controlPressed;
    this.keyVisualizerRef = keyVisualizerRef;
    this.visualizerAnimationFrameRef = visualizerAnimationFrameRef;
  }

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

  updateVisualizerAnimations = () => {
    this.setKeyPresses((prevKeyPresses) => {
      const updatedKeyPresses: typeof prevKeyPresses = {};

      Object.entries(prevKeyPresses).forEach(([key, keyPresses]) => {
        updatedKeyPresses[key] = updatedKeyPresses[key] || [];

        keyPresses.forEach((instance, index) => {
          if (!instance) return;

          let newHeight = instance.height;
          let newBottom = instance.bottom;

          if (instance.currentlyPressed) {
            newHeight += this.heightGrowFactor; // Grow height when pressed
          } else {
            newBottom += this.bottomGrowFactor; // Move upwards when released
          }

          // Only keep updating if it's within the bounds of the visualizer
          if (newBottom <= (this.keyVisualizerRef.current?.clientHeight ?? 0)) {
            updatedKeyPresses[key][index] = {
              ...keyPresses[index],
              height: newHeight,
              bottom: newBottom,
            };
          }
        });

        // Delete any empty keyPresses
        if (updatedKeyPresses[key].length === 0) {
          delete updatedKeyPresses[key];
        }
      });

      return updatedKeyPresses;
    });

    // Continue updating using requestAnimationFrame for smooth animation
    this.visualizerAnimationFrameRef.current = requestAnimationFrame(
      this.updateVisualizerAnimations
    );
  };
}

export default FgPianoController;
