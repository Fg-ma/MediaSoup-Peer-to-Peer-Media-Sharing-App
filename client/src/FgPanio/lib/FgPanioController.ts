class FgPanioController {
  private scaleSectionRef: React.RefObject<HTMLDivElement>;
  private keyWidth: React.MutableRefObject<number>;
  private setVisibleOctave: React.Dispatch<React.SetStateAction<number>>;
  private visibleOctaveRef: React.MutableRefObject<number>;

  constructor(
    scaleSectionRef: React.RefObject<HTMLDivElement>,
    keyWidth: React.MutableRefObject<number>,
    setVisibleOctave: React.Dispatch<React.SetStateAction<number>>,
    visibleOctaveRef: React.MutableRefObject<number>
  ) {
    this.scaleSectionRef = scaleSectionRef;
    this.keyWidth = keyWidth;
    this.setVisibleOctave = setVisibleOctave;
    this.visibleOctaveRef = visibleOctaveRef;
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
}

export default FgPanioController;
