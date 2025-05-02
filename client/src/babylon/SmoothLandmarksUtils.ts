import Deadbanding, { DeadbandingMediaTypes } from "./Deadbanding";
import {
  CalculatedLandmarkInterface,
  LandmarkTypes,
  OneDimLandmarkTypes,
  TwoDimLandmarkTypes,
} from "./FaceLandmarks";

class SmoothLandmarksUtils {
  private minSmoothingFactor = 0.7;
  private maxSmoothingFactor = 0.3;
  private smoothingFactorThreshold = 0.001;

  constructor(
    private type: DeadbandingMediaTypes,
    private id: string,
    private calculatedLandmarks: CalculatedLandmarkInterface,
    private deadbanding: React.MutableRefObject<Deadbanding>,
  ) {}

  getAdaptiveSmoothingFactor = (distance: number) => {
    if (distance < this.smoothingFactorThreshold) {
      return this.maxSmoothingFactor;
    } else {
      return this.minSmoothingFactor;
    }
  };

  applyDeadbanding = (
    featureType: LandmarkTypes,
    previousValue: number,
    currentValue: number,
    smoothingFactor: number,
  ) => {
    const deltaValue = currentValue - previousValue;

    if (
      Math.abs(deltaValue) <
      (this.deadbanding.current.getDeadbandingMapById(this.type, this.id)?.[
        featureType
      ] ?? Infinity)
    ) {
      return previousValue;
    }

    return (
      previousValue * smoothingFactor + currentValue * (1 - smoothingFactor)
    );
  };

  smoothOneDimVariables = (
    featureType: OneDimLandmarkTypes,
    faceId: number,
    value: number,
  ) => {
    if (Array.isArray(this.calculatedLandmarks[featureType][faceId])) {
      return;
    }

    // Initialize smoothed width if not already initialized
    if (!this.calculatedLandmarks[featureType][faceId]) {
      this.calculatedLandmarks[featureType][faceId] = value;
    }

    // Calculate distance (in this case, difference in width values)
    const deltaWidth = Math.abs(
      value - this.calculatedLandmarks[featureType][faceId],
    );

    // Adaptive smoothing factor calculation based on deltaWidth
    const smoothingFactor = this.getAdaptiveSmoothingFactor(deltaWidth);

    // Apply smoothing with deadbanding
    this.calculatedLandmarks[featureType][faceId] = this.applyDeadbanding(
      featureType,
      this.calculatedLandmarks[featureType][faceId],
      value,
      smoothingFactor,
    );
  };

  smoothTwoDimVariables = (
    featureType: TwoDimLandmarkTypes,
    faceId: number,
    value: [number, number],
  ) => {
    // Initialize smoothed width if not already initialized
    if (!this.calculatedLandmarks[featureType][faceId]) {
      this.calculatedLandmarks[featureType][faceId] = value;
    }

    const previousValue = this.calculatedLandmarks[featureType][faceId];
    const [prevX, prevY] = previousValue;
    const [currentX, currentY] = value;

    // Calculate the delta for both X and Y axes
    const deltaX = Math.abs(currentX - prevX);
    const deltaY = Math.abs(currentY - prevY);

    // Get the adaptive smoothing factor based on the distance for each axis
    const smoothingFactorX = this.getAdaptiveSmoothingFactor(deltaX);
    const smoothingFactorY = this.getAdaptiveSmoothingFactor(deltaY);

    // Apply deadbanding and smoothing to both X and Y values
    const smoothedX = this.applyDeadbanding(
      featureType,
      prevX,
      currentX,
      smoothingFactorX,
    );
    const smoothedY = this.applyDeadbanding(
      featureType,
      prevY,
      currentY,
      smoothingFactorY,
    );

    // Store the smoothed value back into the calculatedLandmarks object
    this.calculatedLandmarks[featureType][faceId] = [smoothedX, smoothedY];
  };
}

export default SmoothLandmarksUtils;
