import {
  NormalizedLandmarkList,
  NormalizedLandmarkListList,
} from "@mediapipe/face_mesh";
import { Point2D } from "./drawFaceMesh";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import { oneDimensionalDeadbandingMap } from "./updateDeadbandingMaps";

type OneDimensionalVariableTypes =
  | "leftEarWidth"
  | "rightEarWidth"
  | "eyesWidth"
  | "chinWidth"
  | "headRotationAngle"
  | "interocularDistance";

class FaceLandmarks {
  private faceIdLandmarksPairs: {
    faceId: string;
    landmarks: NormalizedLandmarkList;
  }[] = [];

  private faceCount = 0;

  private headRotationAngles: number[] = [];
  private leftEarWidths: number[] = [];
  private rightEarWidths: number[] = [];
  private eyesCenterPositions: [number, number][] = [];
  private eyesWidths: number[] = [];
  private chinWidths: number[] = [];
  private earsImageOffset: [number, number][] = [];
  private beardImageOffset: [number, number][] = [];
  private mustacheImageOffset: [number, number][] = [];

  private smoothedOneDimensionalVariables: {
    [featureType in OneDimensionalVariableTypes]: { [id: string]: number };
  } = {
    leftEarWidth: {},
    rightEarWidth: {},
    eyesWidth: {},
    chinWidth: {},
    headRotationAngle: {},
    interocularDistance: {},
  };

  private LEFT_EYE_INDEX = 468;
  private RIGHT_EYE_INDEX = 473;
  private NOSE_INDEX = 1;
  private JAW_MID_POINT_INDEX = 152;
  private LEFT_JAW_POINT = 172;
  private RIGHT_JAW_POINT = 397;

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
          Object.keys(this.smoothedOneDimensionalVariables).forEach(
            (featureType) => {
              const feature = featureType as OneDimensionalVariableTypes;
              delete this.smoothedOneDimensionalVariables[feature][id];
            }
          );
        } else {
          newFaceTrackers[id] = tracker;
        }
      }
    }
    this.faceTrackers = newFaceTrackers;

    this.faceIdLandmarksPairs = faceIdLandmarksPairs;
  }

  private smoothOneDimensionalVariableWithDeadbanding(
    featureType: OneDimensionalVariableTypes,
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
    featureType: OneDimensionalVariableTypes,
    faceId: string,
    value: number
  ) {
    // Initialize smoothed width if not already initialized
    if (!this.smoothedOneDimensionalVariables[featureType][faceId]) {
      this.smoothedOneDimensionalVariables[featureType][faceId] = value;
    }

    // Calculate distance (in this case, difference in width values)
    const deltaWidth = Math.abs(
      value - this.smoothedOneDimensionalVariables[featureType][faceId]
    );

    // Adaptive smoothing factor calculation based on deltaWidth
    const smoothingFactor = this.adaptiveSmoothingFactor(deltaWidth);

    // Apply smoothing with deadbanding
    this.smoothedOneDimensionalVariables[featureType][faceId] =
      this.smoothOneDimensionalVariableWithDeadbanding(
        featureType,
        this.smoothedOneDimensionalVariables[featureType][faceId],
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
      this.eyesCenterPositions.push(eyesCenterPosition);

      // Calculate the difference in coordinated of eyes
      const dx = rightEye.x - leftEye.x;
      const dy = rightEye.y - leftEye.y;
      const dz = rightEye.z - leftEye.z;

      // Calculate head angle in plane
      this.updateOneDimensionalSmoothVariables(
        "headRotationAngle",
        faceId,
        Math.atan2(dy, dx)
      );
      this.headRotationAngles.push(
        this.smoothedOneDimensionalVariables.headRotationAngle[faceId]
      );

      // Set left and right ear widths
      // Update InterocularDistance
      this.updateOneDimensionalSmoothVariables(
        "interocularDistance",
        faceId,
        Math.sqrt(dx * dx + dy * dy)
      );

      // Calculate ear size based on interocular distance
      this.updateOneDimensionalSmoothVariables(
        "leftEarWidth",
        faceId,
        this.smoothedOneDimensionalVariables.interocularDistance[faceId] *
          this.currentEffectsStyles.current.ears.leftEarWidthFactor
      );
      this.updateOneDimensionalSmoothVariables(
        "rightEarWidth",
        faceId,
        this.smoothedOneDimensionalVariables.interocularDistance[faceId] *
          this.currentEffectsStyles.current.ears.rightEarWidthFactor
      );

      this.leftEarWidths.push(
        this.smoothedOneDimensionalVariables.leftEarWidth[faceId]
      );
      this.rightEarWidths.push(
        this.smoothedOneDimensionalVariables.rightEarWidth[faceId]
      );

      // Set eye widths
      // Calculate eyes width based on interocular distance
      this.updateOneDimensionalSmoothVariables(
        "eyesWidth",
        faceId,
        this.smoothedOneDimensionalVariables.interocularDistance[faceId]
      );
      this.eyesWidths.push(
        this.smoothedOneDimensionalVariables.eyesWidth[faceId]
      );

      // Set chin widths
      // Calculate chin width based on jawline points
      const chinWidthFactor = 0.75;
      const dxJaw = rightJawPoint.x - leftJawPoint.x;
      const dyJaw = rightJawPoint.y - leftJawPoint.y;

      this.updateOneDimensionalSmoothVariables(
        "chinWidth",
        faceId,
        Math.sqrt(dxJaw * dxJaw + dyJaw * dyJaw) * chinWidthFactor
      );

      this.chinWidths.push(
        this.smoothedOneDimensionalVariables.chinWidth[faceId]
      );

      // Calculate the shift distance for the ear position taking into account
      // headAngle for direction of shift and interocularDistance for scaling
      const earsShiftFactor = 2;
      const { shiftX: earsShiftX, shiftY: earsShiftY } = this.directionalShift(
        this.smoothedOneDimensionalVariables.interocularDistance[faceId] *
          earsShiftFactor,
        this.smoothedOneDimensionalVariables.headRotationAngle[faceId]
      );
      this.earsImageOffset.push([earsShiftX * -1, earsShiftY * -1]);

      // Calculate the shift distance for the chin position taking into account
      // headAngle for direction of shift
      const { shiftX: beardShiftX, shiftY: beardShiftY } =
        this.directionalShift(
          this.currentEffectsStyles.current.beards.chinOffset,
          this.smoothedOneDimensionalVariables.headRotationAngle[faceId]
        );
      this.beardImageOffset.push([beardShiftX, beardShiftY]);

      // Calculate the shift distance for the nose position taking into account
      // headAngle for direction of shift
      const { shiftX: noseShiftX, shiftY: noseShiftY } = this.directionalShift(
        this.currentEffectsStyles.current.mustaches.noseOffset,
        this.smoothedOneDimensionalVariables.headRotationAngle[faceId]
      );
      this.mustacheImageOffset.push([noseShiftX, noseShiftY]);
    });
  }

  update(faceLandmarks: NormalizedLandmarkListList) {
    this.applyFaceTracker(faceLandmarks);
    this.smoothLandmarksWithDeadbanding();
    this.updateCalculatedLandmarks();
    this.faceCount = this.faceIdLandmarksPairs.length;
  }

  getFaceIdLandmarksPairs() {
    return this.faceIdLandmarksPairs;
  }

  getHeadRotationAngles() {
    return this.headRotationAngles;
  }
  getLeftEarWidths() {
    return this.leftEarWidths;
  }
  getRightEarWidths() {
    return this.rightEarWidths;
  }
  getEyesCenterPositions() {
    return this.eyesCenterPositions;
  }
  getEyesWidths() {
    return this.eyesWidths;
  }
  getChinWidths() {
    return this.chinWidths;
  }
  getEarsImageOffset() {
    return this.earsImageOffset;
  }
  getBeardImageOffset() {
    return this.beardImageOffset;
  }
  getMustacheImageOffset() {
    return this.mustacheImageOffset;
  }
}

export default FaceLandmarks;
