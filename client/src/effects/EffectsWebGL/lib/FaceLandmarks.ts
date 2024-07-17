import {
  NormalizedLandmarkList,
  NormalizedLandmarkListList,
} from "@mediapipe/face_mesh";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import { oneDimensionalDeadbandingMap } from "./updateDeadbandingMaps";
import { Point2D } from "./BaseShader";

export type OneDimensionalLandmarkTypes =
  | "headRotationAngles"
  | "headYawAngles"
  | "interocularDistances"
  | "leftEarWidths"
  | "rightEarWidths"
  | "eyesWidths"
  | "chinWidths";

interface OneDimensionalLandmarks {
  [id: string]: number;
}

interface TwoDimensionalLandmarks {
  [id: string]: [number, number];
}

interface CalculatedLandmarkInterface {
  headRotationAngles: OneDimensionalLandmarks;
  headYawAngles: OneDimensionalLandmarks;
  interocularDistances: OneDimensionalLandmarks;
  eyesCenterPositions: TwoDimensionalLandmarks;
  leftEarWidths: OneDimensionalLandmarks;
  rightEarWidths: OneDimensionalLandmarks;
  eyesWidths: OneDimensionalLandmarks;
  chinWidths: OneDimensionalLandmarks;
  twoDimEarsOffsets: TwoDimensionalLandmarks;
  twoDimBeardOffsets: TwoDimensionalLandmarks;
  twoDimMustacheOffsets: TwoDimensionalLandmarks;
  threeDimEarsOffsets: TwoDimensionalLandmarks;
  threeDimBeardOffsets: TwoDimensionalLandmarks;
  threeDimMustacheOffsets: TwoDimensionalLandmarks;
}

class FaceLandmarks {
  private faceIdLandmarksPairs: {
    faceId: string;
    landmarks: NormalizedLandmarkList;
  }[] = [];

  private calculatedLandmarks: CalculatedLandmarkInterface = {
    headRotationAngles: {},
    headYawAngles: {},

    interocularDistances: {},

    eyesCenterPositions: {},

    leftEarWidths: {},
    rightEarWidths: {},
    eyesWidths: {},
    chinWidths: {},

    twoDimEarsOffsets: {},
    twoDimBeardOffsets: {},
    twoDimMustacheOffsets: {},

    threeDimEarsOffsets: {},
    threeDimBeardOffsets: {},
    threeDimMustacheOffsets: {},
  };

  private faceCount = 0;
  private detectionTimeoutDuration = 50;
  private detectTimeout: NodeJS.Timeout | undefined = undefined;
  private detectionTimedOut = false;

  LEFT_EYE_INDEX = 468;
  RIGHT_EYE_INDEX = 473;
  NOSE_INDEX = 1;
  JAW_MID_POINT_INDEX = 152;
  LEFT_JAW_POINT = 172;
  RIGHT_JAW_POINT = 397;
  RIGHT_EAR_INDEX = 332;
  LEFT_EAR_INDEX = 103;

  private currentEffectsStyles;

  // Smoothing and deadbanding
  private legacySmoothedLandmarks: {
    [faceId: string]: NormalizedLandmarkList;
  } = {};
  private deadbandThreshold = 0.001;
  private minSmoothingFactor = 0.7;
  private maxSmoothingFactor = 0.3;
  private smoothingFactorThreshold = 0.001;

  // Face tracking
  private faceTrackers: {
    [id: string]: { position: Point2D; lastSeen: number };
  } = {};
  private maxFaceTrackerAge = 5;

  constructor(currentEffectsStyles: React.MutableRefObject<EffectStylesType>) {
    this.currentEffectsStyles = currentEffectsStyles;
  }

  private adaptiveSmoothingFactor(distance: number) {
    if (distance < this.smoothingFactorThreshold) {
      return this.maxSmoothingFactor;
    } else {
      return this.minSmoothingFactor;
    }
  }

  private applyDeadband(newValue: number, oldValue: number, threshold: number) {
    return Math.abs(newValue - oldValue) < threshold ? oldValue : newValue;
  }

  private smoothLandmark(
    newLandmark: { x: number; y: number; z: number },
    oldLandmark: { x: number; y: number; z: number }
  ) {
    const smoothingFactor = this.adaptiveSmoothingFactor(
      Math.abs(newLandmark.x - oldLandmark.x)
    );

    return {
      x: this.applyDeadband(
        newLandmark.x * smoothingFactor + oldLandmark.x * (1 - smoothingFactor),
        oldLandmark.x,
        this.deadbandThreshold
      ),
      y: this.applyDeadband(
        newLandmark.y * smoothingFactor + oldLandmark.y * (1 - smoothingFactor),
        oldLandmark.y,
        this.deadbandThreshold
      ),
      z: this.applyDeadband(
        newLandmark.z * smoothingFactor + oldLandmark.z * (1 - smoothingFactor),
        oldLandmark.z,
        this.deadbandThreshold
      ),
    };
  }

  private smoothLandmarksWithDeadbanding() {
    const newSmoothedLandmarks: {
      faceId: string;
      landmarks: NormalizedLandmarkList;
    }[] = [];

    this.faceIdLandmarksPairs.forEach(({ faceId, landmarks }) => {
      if (!this.legacySmoothedLandmarks[faceId]) {
        // Initialize with the first set of landmarks if not already present
        this.legacySmoothedLandmarks[faceId] = landmarks;
      } else {
        // Smooth each landmark
        landmarks.forEach((landmark, index) => {
          this.legacySmoothedLandmarks[faceId][index] = this.smoothLandmark(
            landmark,
            this.legacySmoothedLandmarks[faceId][index]
          );
        });
      }

      // Store the new smoothed landmarks
      newSmoothedLandmarks.push({
        faceId,
        landmarks: this.legacySmoothedLandmarks[faceId],
      });
    });

    this.faceIdLandmarksPairs = newSmoothedLandmarks;
  }

  private generateUniqueFaceId(existingIds: Set<string>, baseId: number) {
    let newId = baseId.toString();
    while (existingIds.has(newId)) {
      baseId++;
      newId = baseId.toString();
    }
    return newId;
  }

  private applyFaceTracker(multiFaceLandmarks: NormalizedLandmarkListList) {
    const faceIdLandmarksPairs: {
      faceId: string;
      landmarks: NormalizedLandmarkList;
    }[] = [];
    const newFaceTrackers: {
      [id: string]: { position: Point2D; lastSeen: number };
    } = {};

    const existingIds = new Set(Object.keys(this.faceTrackers));

    multiFaceLandmarks.forEach((landmarks, faceIndex) => {
      if (!landmarks[1]) {
        return;
      }
      const nosePosition = { x: landmarks[1].x, y: landmarks[1].y };

      let closestTrackerId: string | null = null;
      let closestDistance = Infinity;

      for (const [id, tracker] of Object.entries(this.faceTrackers)) {
        const distance = Math.sqrt(
          Math.pow(nosePosition.x - tracker.position.x, 2) +
            Math.pow(nosePosition.y - tracker.position.y, 2)
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closestTrackerId = id;
        }
      }

      let faceId: string;
      if (closestDistance < 0.075 && closestTrackerId) {
        faceId = closestTrackerId;
      } else {
        faceId = this.generateUniqueFaceId(existingIds, faceIndex);
        existingIds.add(faceId);
      }

      newFaceTrackers[faceId] = {
        position: nosePosition as Point2D,
        lastSeen: 0,
      };
      faceIdLandmarksPairs.push({ faceId, landmarks });
    });

    // Clean up old face trackers
    for (const [id, tracker] of Object.entries(this.faceTrackers)) {
      if (!newFaceTrackers[id]) {
        tracker.lastSeen++;
        if (tracker.lastSeen > this.maxFaceTrackerAge) {
          Object.keys(this.calculatedLandmarks).forEach((featureType) => {
            const feature = featureType as OneDimensionalLandmarkTypes;
            delete this.calculatedLandmarks[feature][id];
          });
        } else {
          newFaceTrackers[id] = tracker;
        }
      }
    }
    this.faceTrackers = newFaceTrackers;

    this.faceIdLandmarksPairs = faceIdLandmarksPairs;
  }

  private smoothOneDimensionalVariableWithDeadbanding(
    featureType: OneDimensionalLandmarkTypes,
    previousValue: number,
    currentValue: number,
    smoothingFactor: number
  ) {
    const deltaValue = currentValue - previousValue;

    if (Math.abs(deltaValue) < oneDimensionalDeadbandingMap[featureType]) {
      return previousValue;
    }

    return (
      previousValue * smoothingFactor + currentValue * (1 - smoothingFactor)
    );
  }

  private updateOneDimensionalSmoothVariables(
    featureType: OneDimensionalLandmarkTypes,
    faceId: string,
    value: number
  ) {
    if (Array.isArray(this.calculatedLandmarks[featureType][faceId])) {
      return;
    }

    // Initialize smoothed width if not already initialized
    if (!this.calculatedLandmarks[featureType][faceId]) {
      this.calculatedLandmarks[featureType][faceId] = value;
    }

    // Calculate distance (in this case, difference in width values)
    const deltaWidth = Math.abs(
      value - this.calculatedLandmarks[featureType][faceId]
    );

    // Adaptive smoothing factor calculation based on deltaWidth
    const smoothingFactor = this.adaptiveSmoothingFactor(deltaWidth);

    // Apply smoothing with deadbanding
    this.calculatedLandmarks[featureType][faceId] =
      this.smoothOneDimensionalVariableWithDeadbanding(
        featureType,
        this.calculatedLandmarks[featureType][faceId],
        value,
        smoothingFactor
      );
  }

  private directionalShift(shiftDistance: number, headAngle: number) {
    const perpendicularAngle = headAngle + Math.PI / 2;
    const shiftX = Math.cos(perpendicularAngle) * shiftDistance;
    const shiftY = Math.sin(perpendicularAngle) * shiftDistance;
    return { shiftX, shiftY };
  }

  private updateCalculatedLandmarks() {
    this.faceIdLandmarksPairs.forEach((faceIdLandmarksPair) => {
      const { faceId, landmarks } = faceIdLandmarksPair;

      const leftEye = landmarks[this.LEFT_EYE_INDEX];
      const rightEye = landmarks[this.RIGHT_EYE_INDEX];
      const nose = landmarks[this.NOSE_INDEX];
      const jawMidPoint = landmarks[this.JAW_MID_POINT_INDEX];
      const leftJawPoint = landmarks[this.LEFT_JAW_POINT];
      const rightJawPoint = landmarks[this.RIGHT_JAW_POINT];

      // Set eye center positions
      const eyesCenterPosition: [number, number] = [
        (leftEye.x + rightEye.x) / 2,
        (leftEye.y + rightEye.y) / 2,
      ];
      this.calculatedLandmarks.eyesCenterPositions[faceId] = eyesCenterPosition;

      // Calculate the difference in coordinated of eyes
      const dx = rightEye.x - leftEye.x;
      const dy = rightEye.y - leftEye.y;
      const dz = rightEye.z - leftEye.z;

      // Calculate head angle in plane
      this.updateOneDimensionalSmoothVariables(
        "headRotationAngles",
        faceId,
        -Math.atan2(dy, dx)
      );

      // Calculate head angle in plane
      this.updateOneDimensionalSmoothVariables(
        "headYawAngles",
        faceId,
        Math.atan2(dz, dx)
      );

      // Set left and right ear widths
      // Update InterocularDistance
      this.updateOneDimensionalSmoothVariables(
        "interocularDistances",
        faceId,
        Math.sqrt(dx * dx + dy * dy)
      );

      // Calculate ear size based on interocular distance
      this.updateOneDimensionalSmoothVariables(
        "leftEarWidths",
        faceId,
        this.calculatedLandmarks.interocularDistances[faceId] *
          this.currentEffectsStyles.current.ears.leftEarWidthFactor
      );
      this.updateOneDimensionalSmoothVariables(
        "rightEarWidths",
        faceId,
        this.calculatedLandmarks.interocularDistances[faceId] *
          this.currentEffectsStyles.current.ears.rightEarWidthFactor
      );

      // Set eye widths
      // Calculate eyes width based on interocular distance
      this.updateOneDimensionalSmoothVariables(
        "eyesWidths",
        faceId,
        this.calculatedLandmarks.interocularDistances[faceId]
      );

      // Set chin widths
      // Calculate chin width based on jawline points
      const chinWidthFactor = 0.75;
      const dxJaw = rightJawPoint.x - leftJawPoint.x;
      const dyJaw = rightJawPoint.y - leftJawPoint.y;

      this.updateOneDimensionalSmoothVariables(
        "chinWidths",
        faceId,
        Math.sqrt(dxJaw * dxJaw + dyJaw * dyJaw) * chinWidthFactor
      );

      // Calculate the shift distance for the ear position taking into account
      // headAngle for direction of shift and interocularDistance for scaling
      const earsShiftFactor = 1.75;
      const { shiftX: earsShiftX, shiftY: earsShiftY } = this.directionalShift(
        this.calculatedLandmarks.interocularDistances[faceId] * earsShiftFactor,
        this.calculatedLandmarks.headRotationAngles[faceId]
      );
      this.calculatedLandmarks.twoDimEarsOffsets[faceId] = [
        earsShiftX,
        earsShiftY,
      ];

      // Calculate the shift distance for the chin position taking into account
      // headAngle for direction of shift
      const { shiftX: beardShiftX, shiftY: beardShiftY } =
        this.directionalShift(
          this.currentEffectsStyles.current.beards.chinOffset,
          this.calculatedLandmarks.headRotationAngles[faceId]
        );
      this.calculatedLandmarks.twoDimBeardOffsets[faceId] = [
        beardShiftX,
        beardShiftY,
      ];

      // Calculate the shift distance for the nose position taking into account
      // headAngle for direction of shift
      const { shiftX: twoDimNoseShiftX, shiftY: twoDimNoseShiftY } =
        this.directionalShift(
          this.currentEffectsStyles.current.mustaches.noseOffset.twoDim,
          this.calculatedLandmarks.headRotationAngles[faceId]
        );
      this.calculatedLandmarks.twoDimMustacheOffsets[faceId] = [
        twoDimNoseShiftX,
        twoDimNoseShiftY,
      ];

      const { shiftX: threeDimNoseShiftX, shiftY: threeDimNoseShiftY } =
        this.directionalShift(
          this.currentEffectsStyles.current.mustaches.noseOffset.threeDim,
          this.calculatedLandmarks.headRotationAngles[faceId]
        );
      this.calculatedLandmarks.threeDimMustacheOffsets[faceId] = [
        threeDimNoseShiftX,
        threeDimNoseShiftY,
      ];
    });
  }

  update(faceLandmarks: NormalizedLandmarkListList) {
    this.applyFaceTracker(faceLandmarks);
    this.smoothLandmarksWithDeadbanding();
    this.updateCalculatedLandmarks();
    this.faceCount = this.faceIdLandmarksPairs.length;
  }

  startTimeout() {
    this.detectTimeout = setTimeout(() => {
      this.detectionTimedOut = true;
      this.detectTimeout = undefined;
    }, this.detectionTimeoutDuration);
  }

  getFaceIdLandmarksPairs() {
    return this.faceIdLandmarksPairs;
  }

  getCalculatedLandmarks() {
    return this.calculatedLandmarks;
  }

  getFaceCount() {
    return this.faceCount;
  }

  getTimedOut() {
    return this.detectionTimedOut;
  }

  getTimeoutTimer() {
    return this.detectTimeout;
  }

  setTimedOut(timedOut: boolean) {
    this.detectionTimedOut = timedOut;
  }
}

export default FaceLandmarks;
