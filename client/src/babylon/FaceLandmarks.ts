import {
  NormalizedLandmark,
  NormalizedLandmarkList,
  NormalizedLandmarkListList,
} from "@mediapipe/face_mesh";
import Deadbanding, { DeadbandingMediaTypes } from "./Deadbanding";
import SmoothLandmarksUtils from "./SmoothLandmarksUtils";
import { Point2D } from "../../../universal/babylonTypeContant";

export type LandmarkTypes =
  | "headRotationAngles"
  | "headYawAngles"
  | "headPitchAngles"
  | "interocularDistances"
  | "eyesCenterPositions"
  | "chinPositions"
  | "nosePositions"
  | "foreheadPositions";

export type OneDimLandmarkTypes =
  | "headRotationAngles"
  | "headYawAngles"
  | "headPitchAngles"
  | "interocularDistances";

export type TwoDimLandmarkTypes =
  | "eyesCenterPositions"
  | "chinPositions"
  | "nosePositions"
  | "foreheadPositions";

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
}

class FaceLandmarks {
  private faceIdLandmarksPairs: {
    faceId: number;
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

  private smoothLandmarksUtils: SmoothLandmarksUtils;

  // Face tracking
  private faceTrackers: Point2D[] = [{ x: 0, y: 0 }];

  constructor(
    private flip: boolean,
    private type: DeadbandingMediaTypes,
    private id: string,
    private deadbanding: React.MutableRefObject<Deadbanding>,
  ) {
    this.smoothLandmarksUtils = new SmoothLandmarksUtils(
      this.type,
      this.id,
      this.calculatedLandmarks,
      this.deadbanding,
    );
  }

  addTracker = () => {
    this.faceTrackers.push({ x: 0, y: 0 });
  };

  applyFaceTracker = (multiFaceLandmarks: NormalizedLandmarkListList) => {
    const faceIdLandmarksPairs: {
      faceId: number;
      landmarks: NormalizedLandmarkList;
    }[] = [];

    const disconnectedFaces: number[] = [];
    const foundFaces: number[] = [];

    multiFaceLandmarks.forEach((landmarks, faceIndex) => {
      if (!landmarks[1]) {
        return;
      }
      const nosePosition = { x: landmarks[1].x, y: landmarks[1].y };

      let closestTrackerIndex: number | null = null;
      let closestDistance = Infinity;

      for (const tracker of this.faceTrackers) {
        const distance = Math.sqrt(
          Math.pow(nosePosition.x - tracker.x, 2) +
            Math.pow(nosePosition.y - tracker.y, 2),
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closestTrackerIndex = this.faceTrackers.indexOf(tracker);
        }
      }

      if (closestDistance < 0.075 && closestTrackerIndex) {
        foundFaces.push(closestTrackerIndex);

        faceIdLandmarksPairs.push({ faceId: closestTrackerIndex, landmarks });
      } else {
        disconnectedFaces.push(faceIndex);
      }
    });

    // Second pass: Handle disconnected faces
    disconnectedFaces.forEach((disconnectedFaceIndex) => {
      const landmarks = multiFaceLandmarks[disconnectedFaceIndex];
      const nosePosition = { x: landmarks[1].x, y: landmarks[1].y };

      let closestUnclaimedTrackerIndex: number | null = null;
      let closestDistance = Infinity;

      // Find the closest unclaimed tracker (one that hasn't been assigned to foundFaces)
      this.faceTrackers.forEach((tracker, trackerIndex) => {
        if (!foundFaces.includes(this.faceTrackers.indexOf(tracker))) {
          const distance = Math.sqrt(
            Math.pow(nosePosition.x - tracker.x, 2) +
              Math.pow(nosePosition.y - tracker.y, 2),
          );

          if (distance < closestDistance) {
            closestDistance = distance;
            closestUnclaimedTrackerIndex = trackerIndex;
          }
        }
      });

      let faceId: number;
      if (closestUnclaimedTrackerIndex !== null) {
        // Assign the closest unclaimed tracker
        faceId = closestUnclaimedTrackerIndex;
        foundFaces.push(faceId);
      } else {
        // If no close unclaimed tracker is found, create a new tracker
        this.addTracker();
        faceId = this.faceTrackers.length - 1; // The new tracker index
      }

      faceIdLandmarksPairs.push({ faceId, landmarks });
    });

    this.faceIdLandmarksPairs = faceIdLandmarksPairs;
  };

  private updateHeadRotations = (
    faceId: number,
    rightEye: NormalizedLandmark,
    leftEye: NormalizedLandmark,
    noseBridge: NormalizedLandmark,
    leftNoseBase: NormalizedLandmark,
    rightNoseBase: NormalizedLandmark,
  ) => {
    // Calculate the difference in coordinated of eyes
    const dxEyes = (leftEye.x - rightEye.x) * (this.flip ? -1 : 1);
    const dyEyes = rightEye.y - leftEye.y;
    const dzEyes = leftEye.z - rightEye.z;

    // Calculate head angle z axis
    this.smoothLandmarksUtils.smoothOneDimVariables(
      "headRotationAngles",
      faceId,
      Math.atan2(dyEyes, dxEyes) / 1.35,
    );

    // Calculate head angle y axis
    this.smoothLandmarksUtils.smoothOneDimVariables(
      "headYawAngles",
      faceId,
      (Math.atan2(dzEyes, dxEyes) / 1.4) * (this.flip ? -1 : 1),
    );

    // Calculate the pitch using the distances between points
    const depthDistance = noseBridge.z - (leftNoseBase.z + rightNoseBase.z) / 2;
    const verticalDistance = Math.abs(
      noseBridge.y - (leftNoseBase.y + rightNoseBase.y) / 2,
    );

    let headPitchAngle = Math.atan2(depthDistance, verticalDistance);
    if (headPitchAngle > 0) {
      headPitchAngle /= 1.5;
    } else {
      headPitchAngle /= 1.1;
    }

    // Calculate head angle x axis
    this.smoothLandmarksUtils.smoothOneDimVariables(
      "headPitchAngles",
      faceId,
      headPitchAngle,
    );

    return [dxEyes, dyEyes, dzEyes];
  };

  private updateEyes = (
    faceId: number,
    leftEye: NormalizedLandmark,
    rightEye: NormalizedLandmark,
    dxEyes: number,
    dyEyes: number,
    dzEyes: number,
  ) => {
    // Set eye center positions
    const eyesCenterPosition: [number, number] = [
      (leftEye.x + rightEye.x) / 2,
      (leftEye.y + rightEye.y) / 2,
    ];
    this.smoothLandmarksUtils.smoothTwoDimVariables(
      "eyesCenterPositions",
      faceId,
      eyesCenterPosition,
    );

    // Calculate the basic 2D interocular distance
    const interocularDistance2D = Math.sqrt(
      dxEyes * dxEyes +
        (dyEyes / 2) * (dyEyes / 2) +
        (dzEyes / 2.5) * (dzEyes / 2.5),
    );

    // Update InterocularDistance
    this.smoothLandmarksUtils.smoothOneDimVariables(
      "interocularDistances",
      faceId,
      interocularDistance2D,
    );
  };

  private updateChin = (faceId: number, chin: NormalizedLandmark) => {
    this.smoothLandmarksUtils.smoothTwoDimVariables("chinPositions", faceId, [
      chin.x,
      chin.y,
    ]);
  };

  private updateNose = (faceId: number, nose: NormalizedLandmark) => {
    this.smoothLandmarksUtils.smoothTwoDimVariables("nosePositions", faceId, [
      nose.x,
      nose.y,
    ]);
  };

  private updateForehead = (faceId: number, forehead: NormalizedLandmark) => {
    this.smoothLandmarksUtils.smoothTwoDimVariables(
      "foreheadPositions",
      faceId,
      [forehead.x, forehead.y],
    );
  };

  private updateCalculatedLandmarks = () => {
    this.faceIdLandmarksPairs.forEach((faceIdLandmarksPair) => {
      const { faceId, landmarks } = faceIdLandmarksPair;

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
        rightNoseBase,
      );

      this.updateEyes(faceId, rightEye, leftEye, dxEyes, dyEyes, dzEyes);

      this.updateChin(faceId, chin);

      this.updateNose(faceId, nose);

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
