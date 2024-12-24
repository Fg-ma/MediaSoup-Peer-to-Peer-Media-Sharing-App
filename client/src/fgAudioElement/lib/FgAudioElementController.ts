import { FgAudioElementContainerOptionsType } from "../FgAudioElementContainer";
import PathGenerator from "./PathGenerator";

class FgAudioElementController {
  constructor(
    private isUser: boolean,
    private fgAudioElementContainerOptions: FgAudioElementContainerOptionsType,
    private localMute: React.MutableRefObject<boolean>,
    private clientMute: React.MutableRefObject<boolean>,
    private fixedPointsX: React.MutableRefObject<number[]>,
    private sineCurveY: React.MutableRefObject<number[]>,
    private bellCurveY: React.MutableRefObject<number[]>,
    private setMovingY: React.Dispatch<React.SetStateAction<number[]>>,
    private setFixedY: React.Dispatch<React.SetStateAction<number[]>>,
    private svgRef: React.RefObject<SVGSVGElement>,
    private pathRef: React.RefObject<SVGPathElement>,
    private audioRef: React.RefObject<HTMLAudioElement>,
    private pathGenerator: React.MutableRefObject<PathGenerator | undefined>,
    private timerRef: React.MutableRefObject<NodeJS.Timeout | null>,
    private sideDragging: React.MutableRefObject<"left" | "right" | null>,
    private setLeftHandlePosition: React.Dispatch<
      React.SetStateAction<{
        x: number;
        y: number;
      }>
    >,
    private setRightHandlePosition: React.Dispatch<
      React.SetStateAction<{
        x: number;
        y: number;
      }>
    >,
    private setPopupVisible: React.Dispatch<React.SetStateAction<boolean>>,
    private handleMute: () => void
  ) {}

  init = () => {
    if (!this.pathGenerator.current) {
      return;
    }

    // X points
    const totalWidth = 100;
    const startOffset = 16;
    const endOffset = 16;
    const usableWidth = totalWidth - startOffset - endOffset;
    const step =
      usableWidth / (this.fgAudioElementContainerOptions.numFixedPoints - 1);

    this.fixedPointsX.current = Array.from(
      { length: this.fgAudioElementContainerOptions.numFixedPoints },
      (_, i) => startOffset + i * step
    );

    this.sineCurveY.current = this.pathGenerator.current.generateSineWave(
      this.fgAudioElementContainerOptions.numFixedPoints * 2 - 3,
      1,
      1,
      0
    );

    this.bellCurveY.current = this.pathGenerator.current.generateBellCurve(
      this.fgAudioElementContainerOptions.numFixedPoints - 1,
      this.fgAudioElementContainerOptions.bellCurveAmplitude,
      this.fgAudioElementContainerOptions.bellCurveMean,
      this.fgAudioElementContainerOptions.bellCurveStdDev
    );
  };

  handleVolumeSlider = (volume: number) => {
    if (this.audioRef.current) {
      this.audioRef.current.volume = volume;
      if (!this.isUser) {
        this.audioRef.current.muted = volume === 0;
      }
    }
  };

  startDrag = (event: React.PointerEvent, side: "left" | "right") => {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isUser) {
      window.addEventListener("pointermove", this.drag);
      window.addEventListener("pointerup", this.stopDrag);
    }

    this.sideDragging.current = side;
  };

  drag = (event: PointerEvent) => {
    if (!this.svgRef.current || !this.sideDragging.current) return;

    const svgPoint = this.svgRef.current.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;

    const cursorPoint = svgPoint.matrixTransform(
      this.svgRef.current.getScreenCTM()?.inverse()
    );

    const newY = Math.max(-34, Math.min(134, cursorPoint.y));

    if (this.sideDragging.current === "left") {
      this.setLeftHandlePosition((prevState) => ({ ...prevState, y: newY }));
    } else if (this.sideDragging.current === "right") {
      this.setRightHandlePosition((prevState) => ({ ...prevState, y: newY }));
    }

    const newVol = Math.abs(newY - 50) / 84;

    this.handleVolumeSlider(newVol);
  };

  stopDrag = (event: PointerEvent) => {
    event.stopPropagation();

    if (!this.isUser) {
      window.removeEventListener("pointermove", this.drag);
      window.removeEventListener("pointerup", this.stopDrag);
    }

    this.setLeftHandlePosition((prevState) => ({ ...prevState, y: 50 }));
    this.setRightHandlePosition((prevState) => ({ ...prevState, y: 50 }));
    this.sideDragging.current = null;
  };

  isOnPath = (event: React.PointerEvent) => {
    const pathElement = this.pathRef.current;
    const svgElement = this.svgRef.current;

    if (!pathElement || !svgElement || this.clientMute.current) return false;

    // Create an SVG point in client coordinates
    const svgPoint = svgElement.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;

    // Transform the client point to SVG coordinates
    const svgPointTransformed = svgPoint.matrixTransform(
      svgElement.getScreenCTM()?.inverse()
    );

    // Check if the point is on the stroke of the path
    return pathElement.isPointInStroke(svgPointTransformed);
  };

  onClick = (event: React.MouseEvent) => {
    const validClick = this.isOnPath(event as unknown as React.PointerEvent);

    if (validClick) {
      this.handleMute();
    }
  };

  onPointerMove = (event: PointerEvent) => {
    const validMove = this.isOnPath(event as unknown as React.PointerEvent);

    if (validMove) {
      if (!this.svgRef.current?.classList.contains("cursor-pointer")) {
        this.svgRef.current?.classList.add("cursor-pointer");
      }

      if (!this.timerRef.current) {
        this.timerRef.current = setTimeout(() => {
          this.setPopupVisible(true);
        }, 2500);
      }
    } else {
      if (this.svgRef.current?.classList.contains("cursor-pointer")) {
        this.svgRef.current?.classList.remove("cursor-pointer");
      }

      if (this.timerRef.current) {
        this.setPopupVisible(false);
        clearTimeout(this.timerRef.current);
        this.timerRef.current = null;
      }
    }
  };

  // Function to update the moving points' Y values
  updateMovingY = (volumeLevel: number) => {
    let movingYArray;
    let fixedYArray;
    if (
      (!this.localMute.current && !this.clientMute.current) ||
      this.fgAudioElementContainerOptions.muteStyleOption !== "smile"
    ) {
      movingYArray = this.bellCurveY.current.map(
        (value, index) => value * volumeLevel * 84 * (-1) ** index + 50
      );
      fixedYArray = Array(
        this.fgAudioElementContainerOptions.numFixedPoints - 1
      ).fill(50);
    } else if (
      this.fgAudioElementContainerOptions.muteStyleOption === "smile"
    ) {
      movingYArray = this.sineCurveY.current
        .filter((_, index) => index % 2 === 0)
        .map((value) => value * 10 + 50);
      fixedYArray = this.sineCurveY.current
        .filter((_, index) => index % 2 === 1)
        .map((value) => value * 10 + 50);
      fixedYArray.push(50);
    }

    if (movingYArray) {
      this.setMovingY(movingYArray);
    }
    if (fixedYArray) {
      this.setFixedY(fixedYArray);
    }
  };
}

export default FgAudioElementController;
