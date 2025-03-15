import PathGenerator from "./PathGenerator";
import { Settings } from "./typeConstant";

class FgAudioElementController {
  constructor(
    private isUser: boolean,
    private localMute: React.MutableRefObject<boolean>,
    private clientMute: React.MutableRefObject<boolean>,
    private fixedPointsX: React.MutableRefObject<number[]>,
    private sineCurveY: React.MutableRefObject<number[]>,
    private envelopeY: React.MutableRefObject<number[]>,
    private setMovingY: React.Dispatch<React.SetStateAction<number[]>>,
    private svgRef: React.RefObject<SVGSVGElement>,
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
    private handleMute: (
      producerType: "audio" | "screenAudio",
      producerId: string | undefined
    ) => void,
    private settings: Settings,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
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
    const step = usableWidth / (this.settings.numFixedPoints.value - 1);

    this.fixedPointsX.current = Array.from(
      { length: this.settings.numFixedPoints.value },
      (_, i) => startOffset + i * step
    );

    this.sineCurveY.current = this.pathGenerator.current.generateSineWave(
      this.settings.numFixedPoints.value * 2 - 3,
      1,
      1,
      0
    );

    this.handleEnvelopeChange();
  };

  handleEnvelopeChange = () => {
    if (!this.pathGenerator.current) return;

    switch (this.settings.envelopeType.value) {
      case "bell":
        this.envelopeY.current = this.pathGenerator.current.generateBellCurve(
          this.settings.numFixedPoints.value - 1,
          this.settings.envelopeType.bellOptions.amplitude.value,
          this.settings.envelopeType.bellOptions.mean.value,
          this.settings.envelopeType.bellOptions.stdDev.value
        );
        break;
      case "catenoid":
        this.envelopeY.current =
          this.pathGenerator.current.generateSymmetricExponentialDecay(
            this.settings.numFixedPoints.value - 1,
            this.settings.envelopeType.catenoidOptions.startAmplitude.value,
            this.settings.envelopeType.catenoidOptions.endAmplitude.value,
            this.settings.envelopeType.catenoidOptions.decayRate.value
          );
        break;
      case "cone":
        this.envelopeY.current = this.pathGenerator.current.generateSigmoid(
          this.settings.numFixedPoints.value - 1,
          this.settings.envelopeType.coneOptions.amplitude.value,
          this.settings.envelopeType.coneOptions.steepness.value
        );
        break;
      case "triangle":
        this.envelopeY.current = this.pathGenerator.current.generateTriangle(
          this.settings.numFixedPoints.value - 1,
          this.settings.envelopeType.triangleOptions.amplitude.value
        );
        break;
      case "mixGaussian":
        this.envelopeY.current =
          this.pathGenerator.current.generateGaussianMixture(
            this.settings.numFixedPoints.value - 1,
            this.settings.envelopeType.mixGausianEnvelope.value
          );
        break;
      case "smoothNoise":
        this.envelopeY.current =
          this.pathGenerator.current.generateBrownianNoise(
            this.settings.numFixedPoints.value - 1,
            this.settings.envelopeType.smoothNoiseOptions.amplitude.value
          );
        break;
      case "sawtooth":
        this.envelopeY.current =
          this.pathGenerator.current.generateSawtoothWave(
            this.settings.numFixedPoints.value - 1,
            this.settings.envelopeType.sawtoothOptions.amplitude.value,
            this.settings.envelopeType.sawtoothOptions.frequency.value
          );
        break;
      case "chaotic":
        this.envelopeY.current = this.pathGenerator.current.generateLogisticMap(
          this.settings.numFixedPoints.value - 1,
          this.settings.envelopeType.chaoticOptions.amplitude.value
        );
        break;
      case "binary":
        this.envelopeY.current = this.pathGenerator.current.generateBinaryNoise(
          this.settings.numFixedPoints.value - 1,
          this.settings.envelopeType.binaryOptions.amplitude.value
        );
        break;
      case "bumps":
        this.envelopeY.current =
          this.pathGenerator.current.generateHalfSineWave(
            this.settings.numFixedPoints.value - 1,
            this.settings.envelopeType.bumpsOptions.amplitude.value,
            this.settings.envelopeType.bumpsOptions.frequency.value
          );
        break;
      default:
        break;
    }
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
    const svgElement = this.svgRef.current;

    if (!svgElement || this.clientMute.current) return false;

    // Get all path elements in the SVG
    const pathElements = svgElement.querySelectorAll("path");

    // Create an SVG point in client coordinates
    const svgPoint = svgElement.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;

    // Transform the client point to SVG coordinates
    const svgPointTransformed = svgPoint.matrixTransform(
      svgElement.getScreenCTM()?.inverse()
    );

    // Loop through each path and check if the point is inside the stroke
    for (const pathElement of pathElements) {
      if (pathElement.isPointInStroke(svgPointTransformed)) {
        return true; // Return true if the point is on any of the paths
      }
    }

    // Return false if no path contains the point
    return false;
  };

  onClick = (event: React.MouseEvent) => {
    const validClick = this.isOnPath(event as unknown as React.PointerEvent);

    if (validClick) {
      this.handleMute("audio", undefined);

      this.setRerender((prev) => !prev);
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

  updateMovingY = (volumeLevel: number) => {
    let movingYArray;
    if (
      (!this.localMute.current && !this.clientMute.current) ||
      this.settings.muteStyle.value !== "smile"
    ) {
      movingYArray = this.envelopeY.current.map(
        (value, index) => value * volumeLevel * 84 * (-1) ** index + 50
      );
    } else if (this.settings.muteStyle.value === "smile") {
      movingYArray = this.sineCurveY.current
        .filter((_, index) => index % 2 === 0)
        .map((value) => value * 10 + 50);
    }

    if (movingYArray) {
      this.setMovingY(movingYArray);
    }
  };
}

export default FgAudioElementController;
