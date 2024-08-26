import { keys } from "./Scale";

class FgPanioController {
  private scaleSectionRef: React.RefObject<HTMLDivElement>;
  private keyWidth: React.MutableRefObject<number>;
  private setVisibleOctave: React.Dispatch<React.SetStateAction<number>>;
  private visibleOctaveRef: React.MutableRefObject<number>;
  private keysPressed: React.MutableRefObject<string[]>;
  private shiftPressed: React.MutableRefObject<boolean>;
  private controlPressed: React.MutableRefObject<boolean>;

  constructor(
    scaleSectionRef: React.RefObject<HTMLDivElement>,
    keyWidth: React.MutableRefObject<number>,
    setVisibleOctave: React.Dispatch<React.SetStateAction<number>>,
    visibleOctaveRef: React.MutableRefObject<number>,
    keysPressed: React.MutableRefObject<string[]>,
    shiftPressed: React.MutableRefObject<boolean>,
    controlPressed: React.MutableRefObject<boolean>
  ) {
    this.scaleSectionRef = scaleSectionRef;
    this.keyWidth = keyWidth;
    this.setVisibleOctave = setVisibleOctave;
    this.visibleOctaveRef = visibleOctaveRef;
    this.keysPressed = keysPressed;
    this.shiftPressed = shiftPressed;
    this.controlPressed = controlPressed;
  }

  getVisibleOctave = () => {
    if (!this.scaleSectionRef.current) {
      return;
    }

    const octaveWidth = this.keyWidth.current * 7 + 6;
    const left = this.scaleSectionRef.current.scrollLeft;
    const halfWidth = this.scaleSectionRef.current.clientWidth / 4;

    const octave = Math.round((left + halfWidth) / octaveWidth);

    this.setVisibleOctave(octave);
    this.visibleOctaveRef.current = octave;
  };

  unpressOctave = (octave: number) => {
    for (const key in keys.naturalKeys) {
      const keyElement = document.getElementById(`paino_key_${octave}_${key}`);
      keyElement?.classList.remove("pressed");
    }

    for (const key in keys.accidentalKeys) {
      const keyElement = document.getElementById(`paino_key_${octave}_${key}`);
      keyElement?.classList.remove("pressed");
    }
  };

  handleKeyUp = (eventKey: string, octave: number) => {
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
        key = document.getElementById(`paino_key_${octave}_C`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "C"
        );
        break;
      case "d":
        key = document.getElementById(`paino_key_${octave}_D`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "D"
        );
        break;
      case "f":
        key = document.getElementById(`paino_key_${octave}_E`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "E"
        );
        break;
      case "j":
        key = document.getElementById(`paino_key_${octave}_F`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "F"
        );
        break;
      case "k":
        key = document.getElementById(`paino_key_${octave}_G`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "G"
        );
        break;
      case "l":
        key = document.getElementById(`paino_key_${octave}_A`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "A"
        );
        break;
      case ";":
        key = document.getElementById(`paino_key_${octave}_B`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "B"
        );
        break;
      case "e":
        key = document.getElementById(`paino_key_${octave}_CSharpDb`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "CSharpDb"
        );
        break;
      case "r":
        key = document.getElementById(`paino_key_${octave}_DSharpEb`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "DSharpEb"
        );
        break;
      case "i":
        key = document.getElementById(`paino_key_${octave}_FSharpGb`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "FSharpGb"
        );
        break;
      case "o":
        key = document.getElementById(`paino_key_${octave}_GSharpAb`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "GSharpAb"
        );
        break;
      case "p":
        key = document.getElementById(`paino_key_${octave}_ASharpBb`);
        key?.classList.remove("pressed");
        this.keysPressed.current = this.keysPressed.current.filter(
          (k) => k !== "ASharpBb"
        );
        break;
      default:
        break;
    }
  };

  handleKeyDown = (eventKey: string, octave: number) => {
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
          key = document.getElementById(`paino_key_${octave}_C`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "C"];
        }
        break;
      case "d":
        if (!this.keysPressed.current.includes("D")) {
          key = document.getElementById(`paino_key_${octave}_D`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "D"];
        }
        break;
      case "f":
        if (!this.keysPressed.current.includes("E")) {
          key = document.getElementById(`paino_key_${octave}_E`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "E"];
        }
        break;
      case "j":
        if (!this.keysPressed.current.includes("F")) {
          key = document.getElementById(`paino_key_${octave}_F`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "F"];
        }
        break;
      case "k":
        if (!this.keysPressed.current.includes("G")) {
          key = document.getElementById(`paino_key_${octave}_G`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "G"];
        }
        break;
      case "l":
        if (!this.keysPressed.current.includes("A")) {
          key = document.getElementById(`paino_key_${octave}_A`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "A"];
        }
        break;
      case ";":
        if (!this.keysPressed.current.includes("B")) {
          key = document.getElementById(`paino_key_${octave}_B`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "B"];
        }
        break;
      case "e":
        if (!this.keysPressed.current.includes("CSharpDb")) {
          key = document.getElementById(`paino_key_${octave}_CSharpDb`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "CSharpDb"];
        }
        break;
      case "r":
        if (!this.keysPressed.current.includes("DSharpEb")) {
          key = document.getElementById(`paino_key_${octave}_DSharpEb`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "DSharpEb"];
        }
        break;
      case "i":
        if (!this.keysPressed.current.includes("FSharpGb")) {
          key = document.getElementById(`paino_key_${octave}_FSharpGb`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "FSharpGb"];
        }
        break;
      case "o":
        if (!this.keysPressed.current.includes("GSharpAb")) {
          key = document.getElementById(`paino_key_${octave}_GSharpAb`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "GSharpAb"];
        }
        break;
      case "p":
        if (!this.keysPressed.current.includes("ASharpBb")) {
          key = document.getElementById(`paino_key_${octave}_ASharpBb`);
          key?.classList.add("pressed");
          this.keysPressed.current = [...this.keysPressed.current, "ASharpBb"];
        }
        break;
      default:
        break;
    }
  };
}

export default FgPanioController;
