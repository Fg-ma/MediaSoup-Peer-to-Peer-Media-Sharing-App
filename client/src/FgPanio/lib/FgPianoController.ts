import { keys } from "./Scale";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import AudioMedia from "../../lib/AudioMedia";
import { Octaves } from "../FgPiano";

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

  private scaleSectionRef: React.RefObject<HTMLDivElement>;

  private keyWidth: React.MutableRefObject<number>;

  private setVisibleOctave: React.Dispatch<React.SetStateAction<Octaves>>;
  private visibleOctaveRef: React.MutableRefObject<Octaves>;

  private keysPressed: React.MutableRefObject<string[]>;
  private shiftPressed: React.MutableRefObject<boolean>;
  private controlPressed: React.MutableRefObject<boolean>;

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

    scaleSectionRef: React.RefObject<HTMLDivElement>,

    keyWidth: React.MutableRefObject<number>,

    setVisibleOctave: React.Dispatch<React.SetStateAction<Octaves>>,
    visibleOctaveRef: React.MutableRefObject<Octaves>,

    keysPressed: React.MutableRefObject<string[]>,
    shiftPressed: React.MutableRefObject<boolean>,
    controlPressed: React.MutableRefObject<boolean>
  ) {
    this.isUser = isUser;
    this.userMedia = userMedia;
    this.scaleSectionRef = scaleSectionRef;
    this.keyWidth = keyWidth;
    this.setVisibleOctave = setVisibleOctave;
    this.visibleOctaveRef = visibleOctaveRef;
    this.keysPressed = keysPressed;
    this.shiftPressed = shiftPressed;
    this.controlPressed = controlPressed;
  }

  playNote = (note: string, octave: number, isPress: boolean) => {
    if (this.isUser) {
      this.userMedia.current.audio?.playNote(`${note}${octave}`, isPress);
    }
  };

  getVisibleOctave = () => {
    if (!this.scaleSectionRef.current) {
      return;
    }

    const octaveWidth = this.keyWidth.current * 7 + 6;
    const left = this.scaleSectionRef.current.scrollLeft;
    const halfWidth = this.scaleSectionRef.current.clientWidth / 4;

    const octave = Math.round((left + halfWidth) / octaveWidth);

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
    if (!this.scaleSectionRef.current) {
      return;
    }

    const octaveWidth = this.keyWidth.current * 7 + 6;
    const octaveLeftPosition = octaveWidth * octave;

    this.scaleSectionRef.current.scrollTo({
      left: octaveLeftPosition,
      behavior: "instant",
    });

    this.getVisibleOctave();
  };

  handleKeyUp = (eventKey: string, octave: Octaves) => {
    let key;

    switch (eventKey) {
      case "shift":
        this.unpressOctave(octave);
        this.shiftPressed.current = false;
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "shift"
        );
        break;
      case "control":
        this.unpressOctave(octave);
        this.controlPressed.current = false;
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "control"
        );
        break;
      case "s":
        key = document.getElementById(`piano_key_${octave}_C`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "C"
        );
        this.playNote("C", octave, false);
        break;
      case "d":
        key = document.getElementById(`piano_key_${octave}_D`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "D"
        );
        this.playNote("D", octave, false);
        break;
      case "f":
        key = document.getElementById(`piano_key_${octave}_E`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "E"
        );
        this.playNote("E", octave, false);
        break;
      case "j":
        key = document.getElementById(`piano_key_${octave}_F`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "F"
        );
        this.playNote("F", octave, false);
        break;
      case "k":
        key = document.getElementById(`piano_key_${octave}_G`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "G"
        );
        this.playNote("G", octave, false);
        break;
      case "l":
        key = document.getElementById(`piano_key_${octave}_A`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "A"
        );
        this.playNote("A", octave, false);
        break;
      case ";":
        key = document.getElementById(`piano_key_${octave}_B`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "B"
        );
        this.playNote("B", octave, false);
        break;
      case "e":
        key = document.getElementById(`piano_key_${octave}_CSharpDb`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "CSharpDb"
        );
        this.playNote("C#", octave, false);
        break;
      case "r":
        key = document.getElementById(`piano_key_${octave}_DSharpEb`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "DSharpEb"
        );
        this.playNote("D#", octave, false);
        break;
      case "i":
        key = document.getElementById(`piano_key_${octave}_FSharpGb`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "FSharpGb"
        );
        this.playNote("F#", octave, false);
        break;
      case "o":
        key = document.getElementById(`piano_key_${octave}_GSharpAb`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "GSharpAb"
        );
        this.playNote("G#", octave, false);
        break;
      case "p":
        key = document.getElementById(`piano_key_${octave}_ASharpBb`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "ASharpBb"
        );
        this.playNote("A#", octave, false);
        break;
      default:
        break;
    }
  };

  handleKeyDown = (eventKey: string, octave: Octaves) => {
    let key;

    switch (eventKey) {
      case "shift":
        this.unpressOctave(octave);
        this.shiftPressed.current = true;
        this.keysPressed.current = [...this.keysPressed.current, "shift"];
        break;
      case "control":
        this.unpressOctave(octave);
        this.controlPressed.current = true;
        this.keysPressed.current = [...this.keysPressed.current, "control"];
        break;
      case "s":
        if (!this.keysPressed.current.includes("C")) {
          key = document.getElementById(`piano_key_${octave}_C`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "C"];
          this.playNote("C", octave, true);
        }
        break;
      case "d":
        if (!this.keysPressed.current.includes("D")) {
          key = document.getElementById(`piano_key_${octave}_D`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "D"];
          this.playNote("D", octave, true);
        }
        break;
      case "f":
        if (!this.keysPressed.current.includes("E")) {
          key = document.getElementById(`piano_key_${octave}_E`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "E"];
          this.playNote("E", octave, true);
        }
        break;
      case "j":
        if (!this.keysPressed.current.includes("F")) {
          key = document.getElementById(`piano_key_${octave}_F`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "F"];
          this.playNote("F", octave, true);
        }
        break;
      case "k":
        if (!this.keysPressed.current.includes("G")) {
          key = document.getElementById(`piano_key_${octave}_G`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "G"];
          this.playNote("G", octave, true);
        }
        break;
      case "l":
        if (!this.keysPressed.current.includes("A")) {
          key = document.getElementById(`piano_key_${octave}_A`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "A"];
          this.playNote("A", octave, true);
        }
        break;
      case ";":
        if (!this.keysPressed.current.includes("B")) {
          key = document.getElementById(`piano_key_${octave}_B`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "B"];
          this.playNote("B", octave, true);
        }
        break;
      case "e":
        if (!this.keysPressed.current.includes("CSharpDb")) {
          key = document.getElementById(`piano_key_${octave}_CSharpDb`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "CSharpDb"];
          this.playNote("C#", octave, true);
        }
        break;
      case "r":
        if (!this.keysPressed.current.includes("DSharpEb")) {
          key = document.getElementById(`piano_key_${octave}_DSharpEb`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "DSharpEb"];
          this.playNote("D#", octave, true);
        }
        break;
      case "i":
        if (!this.keysPressed.current.includes("FSharpGb")) {
          key = document.getElementById(`piano_key_${octave}_FSharpGb`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "FSharpGb"];
          this.playNote("F#", octave, true);
        }
        break;
      case "o":
        if (!this.keysPressed.current.includes("GSharpAb")) {
          key = document.getElementById(`piano_key_${octave}_GSharpAb`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "GSharpAb"];
          this.playNote("G#", octave, true);
        }
        break;
      case "p":
        if (!this.keysPressed.current.includes("ASharpBb")) {
          key = document.getElementById(`piano_key_${octave}_ASharpBb`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "ASharpBb"];
          this.playNote("A#", octave, true);
        }
        break;
      default:
        break;
    }
  };

  resize = () => {
    if (!this.scaleSectionRef.current) {
      return;
    }

    const heightInPixels = this.scaleSectionRef.current.offsetHeight;
    const newKeyWidth = heightInPixels * 0.15;

    this.keyWidth.current = newKeyWidth;

    this.scaleSectionRef.current.style.setProperty(
      "--key-width",
      `${this.keyWidth.current}px`
    );
    this.scaleSectionRef.current.style.setProperty(
      "--key-border-style",
      this.keyWidth.current > 32 ? "solid" : "none"
    );

    this.getVisibleOctave();
  };
}

export default FgPianoController;
