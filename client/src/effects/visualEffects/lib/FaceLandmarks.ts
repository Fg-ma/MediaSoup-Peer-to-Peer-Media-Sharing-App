import {
  NormalizedLandmark,
  NormalizedLandmarkList,
  NormalizedLandmarkListList,
} from "@mediapipe/face_mesh";
import {
  CameraEffectStylesType,
  EffectStylesType,
} from "../../../context/CurrentEffectsStylesContext";
import { Point2D } from "./BaseShader";
import Deadbanding from "./Deadbanding";

export type LandmarkTypes =
  | "headRotationAngles"
  | "headYawAngles"
  | "headPitchAngles"
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

export interface CalculatedLandmarkInterface {
  headRotationAngles: OneDimensionalLandmarks;
  headYawAngles: OneDimensionalLandmarks;
  headPitchAngles: OneDimensionalLandmarks;
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
  private id: string;

  private faceIdLandmarksPairs: {
    faceId: string;
    landmarks: NormalizedLandmarkList;
  }[] = [];

  private calculatedLandmarks: CalculatedLandmarkInterface = {
    headRotationAngles: {},
    headYawAngles: {},
    headPitchAngles: {},

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
  LEFT_JAW_INDEX = 172;
  RIGHT_JAW_INDEX = 397;
  RIGHT_EAR_INDEX = 332;
  LEFT_EAR_INDEX = 103;
  NOSE_BRIDGE_INDEX = 6;
  LEFT_NOSE_BASE_INDEX = 219;
  RIGHT_NOSE_BASE_INDEX = 439;

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

  private deadbanding: Deadbanding;

  constructor(
    id: string,
    currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    deadbanding: Deadbanding
  ) {
    this.id = id;
    this.currentEffectsStyles = currentEffectsStyles;
    this.deadbanding = deadbanding;
  }

  private adaptiveSmoothingFactor = (distance: number) => {
    if (distance < this.smoothingFactorThreshold) {
      return this.maxSmoothingFactor;
    } else {
      return this.minSmoothingFactor;
    }
  };

  private generateUniqueFaceId = (existingIds: Set<string>, baseId: number) => {
    let newId = baseId.toString();
    while (existingIds.has(newId)) {
      baseId++;
      newId = baseId.toString();
    }
    return newId;
  };

  private applyFaceTracker = (
    multiFaceLandmarks: NormalizedLandmarkListList
  ) => {
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
            const feature = featureType as LandmarkTypes;
            delete this.calculatedLandmarks[feature][id];
          });
        } else {
          newFaceTrackers[id] = tracker;
        }
      }
    }
    this.faceTrackers = newFaceTrackers;

    this.faceIdLandmarksPairs = faceIdLandmarksPairs;
  };

  private smoothVariableWithDeadbanding = (
    featureType: LandmarkTypes,
    previousValue: number,
    currentValue: number,
    smoothingFactor: number
  ) => {
    const deltaValue = currentValue - previousValue;

    if (
      Math.abs(deltaValue) <
      this.deadbanding.getDeadbandingMapById(this.id)[featureType]
    ) {
      return previousValue;
    }

    return (
      previousValue * smoothingFactor + currentValue * (1 - smoothingFactor)
    );
  };

  private updateSmoothVariables = (
    featureType: LandmarkTypes,
    faceId: string,
    value: number
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
      value - this.calculatedLandmarks[featureType][faceId]
    );

    // Adaptive smoothing factor calculation based on deltaWidth
    const smoothingFactor = this.adaptiveSmoothingFactor(deltaWidth);

    // Apply smoothing with deadbanding
    this.calculatedLandmarks[featureType][faceId] =
      this.smoothVariableWithDeadbanding(
        featureType,
        this.calculatedLandmarks[featureType][faceId],
        value,
        smoothingFactor
      );
  };

  private directionalShift = (shiftDistance: number, headAngle: number) => {
    const perpendicularAngle = headAngle + Math.PI / 2;
    const shiftX = Math.cos(perpendicularAngle) * shiftDistance;
    const shiftY = Math.sin(perpendicularAngle) * shiftDistance;
    return { shiftX, shiftY };
  };

  private updateHeadRotations = (
    faceId: string,
    rightEye: NormalizedLandmark,
    leftEye: NormalizedLandmark,
    noseBridge: NormalizedLandmark,
    leftNoseBase: NormalizedLandmark,
    rightNoseBase: NormalizedLandmark
  ) => {
    // Calculate the difference in coordinated of eyes
    const dxEyes = rightEye.x - leftEye.x;
    const dyEyes = rightEye.y - leftEye.y;
    const dzEyes = rightEye.z - leftEye.z;

    // Calculate head angle z axis
    this.updateSmoothVariables(
      "headRotationAngles",
      faceId,
      -Math.atan2(dyEyes, dxEyes)
    );

    // Calculate head angle y axis
    this.updateSmoothVariables(
      "headYawAngles",
      faceId,
      Math.atan2(dzEyes, dxEyes)
    );

    // Calculate the pitch using the distances between points
    const depthDistance = noseBridge.z - (leftNoseBase.z + rightNoseBase.z) / 2;
    const verticalDistance = Math.abs(
      noseBridge.y - (leftNoseBase.y + rightNoseBase.y) / 2
    );

    let pitchAngle;
    if (depthDistance < 0) {
      pitchAngle = Math.atan2(-depthDistance, verticalDistance);
    } else {
      pitchAngle = -Math.atan2(depthDistance, verticalDistance);
    }

    // Calculate head angle x axis
    this.updateSmoothVariables("headPitchAngles", faceId, pitchAngle);

    return [dxEyes, dyEyes, dzEyes];
  };

  private updateEyes = (
    faceId: string,
    leftEye: NormalizedLandmark,
    rightEye: NormalizedLandmark,
    dxEyes: number,
    dyEyes: number
  ) => {
    // Set eye center positions
    const eyesCenterPosition: [number, number] = [
      (leftEye.x + rightEye.x) / 2,
      (leftEye.y + rightEye.y) / 2,
    ];
    this.calculatedLandmarks.eyesCenterPositions[faceId] = eyesCenterPosition;

    // Update InterocularDistance
    this.updateSmoothVariables(
      "interocularDistances",
      faceId,
      Math.sqrt(dxEyes * dxEyes + dyEyes * dyEyes)
    );

    // Set eye widths
    // Calculate eyes width based on interocular distance
    this.updateSmoothVariables(
      "eyesWidths",
      faceId,
      this.calculatedLandmarks.interocularDistances[faceId]
    );
  };

  private updateEars = (
    faceId: string,
    effectsStyles: CameraEffectStylesType
  ) => {
    // Calculate ear size based on interocular distance
    if (effectsStyles && effectsStyles.ears) {
      this.updateSmoothVariables(
        "leftEarWidths",
        faceId,
        this.calculatedLandmarks.interocularDistances[faceId] *
          effectsStyles.ears!.leftEarWidthFactor
      );
      this.updateSmoothVariables(
        "rightEarWidths",
        faceId,
        this.calculatedLandmarks.interocularDistances[faceId] *
          effectsStyles.ears!.rightEarWidthFactor
      );
    }

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
  };

  private updateChin = (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    leftJawPoint: NormalizedLandmark,
    rightJawPoint: NormalizedLandmark
  ) => {
    // Set chin widths calculate chin width based on jawline points
    const chinWidthFactor = 0.8;
    const dxJaw = rightJawPoint.x - leftJawPoint.x;
    const dyJaw = rightJawPoint.y - leftJawPoint.y;

    this.updateSmoothVariables(
      "chinWidths",
      faceId,
      Math.sqrt(dxJaw * dxJaw + dyJaw * dyJaw) * chinWidthFactor
    );

    // Calculate the shift distance for the chin position taking into account
    // headAngle for direction of shift
    if (!effectsStyles || !effectsStyles.beards) {
      return;
    }

    const { shiftX: twoDimBeardShiftX, shiftY: twoDimBeardShiftY } =
      this.directionalShift(
        effectsStyles.beards!.chinOffset.twoDim,
        this.calculatedLandmarks.headRotationAngles[faceId]
      );
    this.calculatedLandmarks.twoDimBeardOffsets[faceId] = [
      twoDimBeardShiftX,
      twoDimBeardShiftY,
    ];

    const { shiftX: threeDimBeardShiftX, shiftY: threeDimBeardShiftY } =
      this.directionalShift(
        effectsStyles.beards!.chinOffset.threeDim,
        this.calculatedLandmarks.headRotationAngles[faceId]
      );
    this.calculatedLandmarks.threeDimBeardOffsets[faceId] = [
      threeDimBeardShiftX,
      threeDimBeardShiftY,
    ];
  };

  private updateNose = (
    faceId: string,
    effectsStyles: CameraEffectStylesType
  ) => {
    // Calculate the shift distance for the nose position taking into account
    // headAngle for direction of shift
    if (!effectsStyles || !effectsStyles.mustaches) {
      return;
    }

    const { shiftX: twoDimNoseShiftX, shiftY: twoDimNoseShiftY } =
      this.directionalShift(
        effectsStyles.mustaches!.noseOffset.twoDim,
        this.calculatedLandmarks.headRotationAngles[faceId]
      );
    this.calculatedLandmarks.twoDimMustacheOffsets[faceId] = [
      twoDimNoseShiftX,
      twoDimNoseShiftY,
    ];

    const { shiftX: threeDimNoseShiftX, shiftY: threeDimNoseShiftY } =
      this.directionalShift(
        effectsStyles.mustaches!.noseOffset.threeDim,
        this.calculatedLandmarks.headRotationAngles[faceId]
      );
    this.calculatedLandmarks.threeDimMustacheOffsets[faceId] = [
      threeDimNoseShiftX,
      threeDimNoseShiftY,
    ];
  };

  private updateCalculatedLandmarks = (canvas: HTMLCanvasElement) => {
    this.faceIdLandmarksPairs.forEach((faceIdLandmarksPair) => {
      const { faceId, landmarks } = faceIdLandmarksPair;

      const effectsStyles = this.currentEffectsStyles.current.camera[this.id];

      const leftEye = landmarks[this.LEFT_EYE_INDEX];
      const rightEye = landmarks[this.RIGHT_EYE_INDEX];
      const leftJawPoint = landmarks[this.LEFT_JAW_INDEX];
      const rightJawPoint = landmarks[this.RIGHT_JAW_INDEX];
      const noseBridge = landmarks[this.NOSE_BRIDGE_INDEX];
      const leftNoseBase = landmarks[this.LEFT_NOSE_BASE_INDEX];
      const rightNoseBase = landmarks[this.RIGHT_NOSE_BASE_INDEX];

      const [dxEyes, dyEyes, dzEyes] = this.updateHeadRotations(
        faceId,
        rightEye,
        leftEye,
        noseBridge,
        leftNoseBase,
        rightNoseBase
      );

      this.updateEyes(faceId, rightEye, leftEye, dxEyes, dyEyes);

      this.updateEars(faceId, effectsStyles);

      this.updateChin(faceId, effectsStyles, leftJawPoint, rightJawPoint);

      this.updateNose(faceId, effectsStyles);
    });
  };

  update = (
    faceLandmarks: NormalizedLandmarkListList,
    canvas: HTMLCanvasElement
  ) => {
    this.applyFaceTracker(faceLandmarks);
    this.updateCalculatedLandmarks(canvas);
    this.faceCount = this.faceIdLandmarksPairs.length;
  };

  startTimeout = () => {
    this.detectTimeout = setTimeout(() => {
      this.detectionTimedOut = true;
      this.detectTimeout = undefined;
    }, this.detectionTimeoutDuration);
  };

  getFaceIdLandmarksPairs = () => {
    return this.faceIdLandmarksPairs;
  };

  getCalculatedLandmarks = () => {
    return this.calculatedLandmarks;
  };

  getFaceCount = () => {
    return this.faceCount;
  };

  getTimedOut = () => {
    return this.detectionTimedOut;
  };

  getTimeoutTimer = () => {
    return this.detectTimeout;
  };

  setTimedOut = (timedOut: boolean) => {
    this.detectionTimedOut = timedOut;
  };
}

export default FaceLandmarks;
