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
import SmoothLandmarksUtils from "./SmoothLandmarksUtils";

export type LandmarkTypes =
  | "headRotationAngles"
  | "headYawAngles"
  | "headPitchAngles"
  | "interocularDistances"
  | "eyesCenterPositions"
  | "chinPositions"
  | "nosePositions"
  | "foreheadPositions"
  | "twoDimBeardOffsets"
  | "twoDimMustacheOffsets"
  | "threeDimBeardOffsets"
  | "threeDimMustacheOffsets";

export type OneDimLandmarkTypes =
  | "headRotationAngles"
  | "headYawAngles"
  | "headPitchAngles"
  | "interocularDistances";

export type TwoDimLandmarkTypes =
  | "eyesCenterPositions"
  | "chinPositions"
  | "nosePositions"
  | "foreheadPositions"
  | "twoDimBeardOffsets"
  | "twoDimMustacheOffsets"
  | "threeDimBeardOffsets"
  | "threeDimMustacheOffsets";

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
  chinPositions: TwoDimensionalLandmarks;
  nosePositions: TwoDimensionalLandmarks;
  foreheadPositions: TwoDimensionalLandmarks;
  twoDimBeardOffsets: TwoDimensionalLandmarks;
  twoDimMustacheOffsets: TwoDimensionalLandmarks;
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
    headPitchAngles: {},

    interocularDistances: {},

    eyesCenterPositions: {},

    chinPositions: {},

    nosePositions: {},

    foreheadPositions: {},

    twoDimBeardOffsets: {},
    twoDimMustacheOffsets: {},

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
  FOREHEAD_INDEX = 10;

  // Face tracking
  private faceTrackers: {
    [id: string]: { position: Point2D; lastSeen: number };
  } = {};
  private maxFaceTrackerAge = 5;

  private smoothLandmarksUtils: SmoothLandmarksUtils;

  constructor(
    private id: string,
    private currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    private deadbanding: Deadbanding
  ) {
    this.smoothLandmarksUtils = new SmoothLandmarksUtils(
      this.id,
      this.calculatedLandmarks,
      this.deadbanding
    );
  }

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
    const dxEyes = -1 * (rightEye.x - leftEye.x);
    const dyEyes = rightEye.y - leftEye.y;
    const dzEyes = -1 * (rightEye.z - leftEye.z);

    // Calculate head angle z axis
    this.smoothLandmarksUtils.smoothOneDimVariables(
      "headRotationAngles",
      faceId,
      -Math.atan2(dyEyes, dxEyes)
    );

    // Calculate head angle y axis
    this.smoothLandmarksUtils.smoothOneDimVariables(
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
    this.smoothLandmarksUtils.smoothOneDimVariables(
      "headPitchAngles",
      faceId,
      pitchAngle
    );

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
    this.smoothLandmarksUtils.smoothTwoDimVariables(
      "eyesCenterPositions",
      faceId,
      eyesCenterPosition
    );

    // Update InterocularDistance
    this.smoothLandmarksUtils.smoothOneDimVariables(
      "interocularDistances",
      faceId,
      Math.sqrt(dxEyes * dxEyes + dyEyes * dyEyes)
    );
  };

  private updateChin = (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    chin: NormalizedLandmark
  ) => {
    this.smoothLandmarksUtils.smoothTwoDimVariables("chinPositions", faceId, [
      chin.x,
      chin.y,
    ]);

    // Calculate the shift distance for the chin position taking into account
    // headAngle for direction of shift
    if (effectsStyles && effectsStyles.beards) {
      const { shiftX: twoDimBeardShiftX, shiftY: twoDimBeardShiftY } =
        this.directionalShift(
          effectsStyles.beards.transforms.twoDimOffset,
          this.calculatedLandmarks.headRotationAngles[faceId]
        );
      this.calculatedLandmarks.twoDimBeardOffsets[faceId] = [
        twoDimBeardShiftX,
        twoDimBeardShiftY,
      ];

      const { shiftX: threeDimBeardShiftX, shiftY: threeDimBeardShiftY } =
        this.directionalShift(
          effectsStyles.beards.transforms.threeDimOffset,
          this.calculatedLandmarks.headRotationAngles[faceId]
        );
      this.calculatedLandmarks.threeDimBeardOffsets[faceId] = [
        threeDimBeardShiftX,
        threeDimBeardShiftY,
      ];
    }
  };

  private updateNose = (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    nose: NormalizedLandmark
  ) => {
    this.smoothLandmarksUtils.smoothTwoDimVariables("nosePositions", faceId, [
      nose.x,
      nose.y,
    ]);

    // Calculate the shift distance for the nose position taking into account
    // headAngle for direction of shift
    if (effectsStyles && effectsStyles.mustaches) {
      const { shiftX: twoDimNoseShiftX, shiftY: twoDimNoseShiftY } =
        this.directionalShift(
          effectsStyles.mustaches!.transforms.twoDimOffset,
          this.calculatedLandmarks.headRotationAngles[faceId]
        );
      this.calculatedLandmarks.twoDimMustacheOffsets[faceId] = [
        twoDimNoseShiftX,
        twoDimNoseShiftY,
      ];

      const { shiftX: threeDimNoseShiftX, shiftY: threeDimNoseShiftY } =
        this.directionalShift(
          effectsStyles.mustaches!.transforms.threeDimOffset,
          this.calculatedLandmarks.headRotationAngles[faceId]
        );
      this.calculatedLandmarks.threeDimMustacheOffsets[faceId] = [
        threeDimNoseShiftX,
        threeDimNoseShiftY,
      ];
    }
  };

  private updateForehead = (faceId: string, forehead: NormalizedLandmark) => {
    this.smoothLandmarksUtils.smoothTwoDimVariables(
      "foreheadPositions",
      faceId,
      [forehead.x, forehead.y]
    );
  };

  private updateCalculatedLandmarks = () => {
    this.faceIdLandmarksPairs.forEach((faceIdLandmarksPair) => {
      const { faceId, landmarks } = faceIdLandmarksPair;

      const effectsStyles = this.currentEffectsStyles.current.camera[this.id];

      const leftEye = landmarks[this.LEFT_EYE_INDEX];
      const rightEye = landmarks[this.RIGHT_EYE_INDEX];
      const nose = landmarks[this.NOSE_INDEX];
      const noseBridge = landmarks[this.NOSE_BRIDGE_INDEX];
      const leftNoseBase = landmarks[this.LEFT_NOSE_BASE_INDEX];
      const rightNoseBase = landmarks[this.RIGHT_NOSE_BASE_INDEX];
      const chin = landmarks[this.JAW_MID_POINT_INDEX];
      const forehead = landmarks[this.FOREHEAD_INDEX];

      const [dxEyes, dyEyes, dzEyes] = this.updateHeadRotations(
        faceId,
        rightEye,
        leftEye,
        noseBridge,
        leftNoseBase,
        rightNoseBase
      );

      this.updateEyes(faceId, rightEye, leftEye, dxEyes, dyEyes);

      this.updateChin(faceId, effectsStyles, chin);

      this.updateNose(faceId, effectsStyles, nose);

      this.updateForehead(faceId, forehead);
    });
  };

  update = (faceLandmarks: NormalizedLandmarkListList) => {
    this.applyFaceTracker(faceLandmarks);
    this.updateCalculatedLandmarks();
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
