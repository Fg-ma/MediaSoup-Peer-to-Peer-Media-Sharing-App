import * as faceapi from "face-api.js";
import { Uniforms } from "./setUniforms";
import { EffectTypes } from "src/context/StreamsContext";
import { FaceLandmarks } from "../handleEffectWebGL";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import directionalShift from "./directionalShift";
import updateTwoDimensionalSmoothVariables from "./updateTwoDimensionalSmoothVariables";
import updateOneDimensionalSmoothVariables from "./updateOneDimensionalSmoothVariables";
import updateUniforms from "./updateUniforms";
import toggleFaceTrackedEffects from "./toggleFaceTrackedEffects";

export type TwoDimensionalVariableTypes =
  | "eyesCenterPosition"
  | "leftEyePosition"
  | "rightEyePosition"
  | "nosePosition"
  | "chinPosition";
export type OneDimensionalVariableTypes =
  | "leftEarWidth"
  | "rightEarWidth"
  | "eyesWidth"
  | "chinWidth"
  | "headRotationAngle"
  | "headPitchAngle"
  | "headYawAngle"
  | "interocularDistance";

export const smoothedTwoDimensionalVariables: {
  [featureType in TwoDimensionalVariableTypes]: { [id: string]: number[] };
} = {
  eyesCenterPosition: {},
  leftEyePosition: {},
  rightEyePosition: {},
  nosePosition: {},
  chinPosition: {},
};
export const smoothedOneDimensionalVariables: {
  [featureType in OneDimensionalVariableTypes]: { [id: string]: number };
} = {
  leftEarWidth: {},
  rightEarWidth: {},
  eyesWidth: {},
  chinWidth: {},
  headRotationAngle: {},
  headPitchAngle: {},
  headYawAngle: {},
  interocularDistance: {},
};

let faceTrackers: {
  [id: string]: { position: faceapi.Point; lastSeen: number };
} = {};
const maxFaceTrackerAge = 5;
const detectionTimeout = 200;

let detectTimeout: NodeJS.Timeout | undefined;
let detectionTimedout = false;

const updateFaceLandmarks = async (
  gl: WebGLRenderingContext,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  uniformLocations: {
    [uniform in Uniforms]: WebGLUniformLocation | null | undefined;
  },
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean },
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>
) => {
  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  const faceCount = detections.length;
  const headRotationAngles: number[] = [];
  const headPitchAngles: number[] = [];
  const headYawAngles: number[] = [];
  const leftEarPositions: number[][] = [];
  const rightEarPositions: number[][] = [];
  const leftEarWidths: number[] = [];
  const rightEarWidths: number[] = [];
  const leftEyePositions: number[][] = [];
  const rightEyePositions: number[][] = [];
  const eyesCenterPositions: number[][] = [];
  const eyesWidths: number[] = [];
  const chinPositions: number[][] = [];
  const nosePositions: number[][] = [];
  const chinWidths: number[] = [];
  const earsImageOffset: number[] = [];
  const beardImageOffset: number[] = [];
  const mustacheImageOffset: number[] = [];

  // Handle case of no dections
  if (detectionTimedout && faceCount !== 0) {
    detectionTimedout = false;
    toggleFaceTrackedEffects(1, gl, uniformLocations, effects);
  }
  if (faceCount === 0 && !detectTimeout) {
    detectTimeout = setTimeout(() => {
      detectionTimedout = true;
      toggleFaceTrackedEffects(0, gl, uniformLocations, effects);
      detectTimeout = undefined;
    }, detectionTimeout);
  }
  if (faceCount !== 0 && detectTimeout) {
    clearTimeout(detectTimeout);
    detectTimeout = undefined;
  }

  const newFaceTrackers: {
    [id: string]: { position: faceapi.Point; lastSeen: number };
  } = {};

  detections.forEach((detection, faceIndex) => {
    const landmarks = detection.landmarks;

    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const jawOutline = landmarks.getJawOutline();
    const nose = landmarks.getNose();
    let updatedSmoothEyePosition = false;
    let updatedSmoothNosePosition = false;
    let updatedSmoothChinPosition = false;
    let updatedSmoothInterocularDistance = false;
    let updatedSmoothEyesCenterPosition = false;

    // Set the faceTracker based on which face is closest to which face in
    // the set of last seen faces
    const eyesCenterPosition = {
      x: (leftEye[0].x + rightEye[3].x) / 2,
      y: (leftEye[0].y + rightEye[3].y) / 2,
    };

    let closestTrackerId = null;
    let closestDistance = Infinity;

    for (const [id, tracker] of Object.entries(faceTrackers)) {
      const distance = Math.sqrt(
        Math.pow(eyesCenterPosition.x - tracker.position.x, 2) +
          Math.pow(eyesCenterPosition.y - tracker.position.y, 2)
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestTrackerId = id;
      }
    }

    const faceId =
      closestDistance < 100 ? closestTrackerId : faceIndex.toString();
    if (!faceId) {
      return;
    }
    newFaceTrackers[faceId] = {
      position: eyesCenterPosition as faceapi.Point,
      lastSeen: 0,
    };

    // Calculate the difference in coordinated of eyes
    const dx = (rightEye[0].x - leftEye[0].x) / canvas.width;
    const dy = (rightEye[0].y - leftEye[0].y) / canvas.height;

    // Calculate head angle in plane
    if (faceLandmarks.headRotationAngles) {
      updateOneDimensionalSmoothVariables(
        "headRotationAngle",
        faceId,
        Math.atan2(dy, dx)
      );
      headRotationAngles.push(
        smoothedOneDimensionalVariables.headRotationAngle[faceId]
      );
    }

    // Set left and right eye positions
    if (faceLandmarks.leftEyePositions || faceLandmarks.leftEyePositions) {
      // Update smooth eye position if it hasn't already been done for this dection
      if (!updatedSmoothEyePosition) {
        updateTwoDimensionalSmoothVariables(
          "leftEyePosition",
          faceId,
          leftEye,
          canvas
        );
        updateTwoDimensionalSmoothVariables(
          "rightEyePosition",
          faceId,
          rightEye,
          canvas
        );
        updatedSmoothEyePosition = true;
      }

      leftEyePositions.push(
        smoothedTwoDimensionalVariables.leftEyePosition[faceId]
      );
      rightEyePositions.push(
        smoothedTwoDimensionalVariables.rightEyePosition[faceId]
      );
    }

    // Set leftEarPositions and rightEarPositions
    if (faceLandmarks.leftEarPositions || faceLandmarks.rightEarPositions) {
      // Update smooth eye position if it hasn't already been done for this dection
      if (!updatedSmoothEyePosition) {
        updateTwoDimensionalSmoothVariables(
          "leftEyePosition",
          faceId,
          leftEye,
          canvas
        );
        updateTwoDimensionalSmoothVariables(
          "rightEyePosition",
          faceId,
          rightEye,
          canvas
        );
        updatedSmoothEyePosition = true;
      }

      leftEarPositions.push([
        smoothedTwoDimensionalVariables.leftEyePosition[faceId][0],
        smoothedTwoDimensionalVariables.leftEyePosition[faceId][1],
      ]);
      rightEarPositions.push([
        smoothedTwoDimensionalVariables.rightEyePosition[faceId][0],
        smoothedTwoDimensionalVariables.rightEyePosition[faceId][1],
      ]);
    }

    // Set left and right ear widths
    if (faceLandmarks.leftEarWidths || faceLandmarks.rightEarWidths) {
      // Update InterocularDistance if needed
      if (!updatedSmoothInterocularDistance) {
        updateOneDimensionalSmoothVariables(
          "interocularDistance",
          faceId,
          Math.sqrt(dx * dx + dy * dy)
        );
      }

      // Calculate ear size based on interocular distance
      updateOneDimensionalSmoothVariables(
        "leftEarWidth",
        faceId,
        smoothedOneDimensionalVariables.interocularDistance[faceId] *
          currentEffectsStyles.current.ears.leftEarWidthFactor
      );
      updateOneDimensionalSmoothVariables(
        "rightEarWidth",
        faceId,
        smoothedOneDimensionalVariables.interocularDistance[faceId] *
          currentEffectsStyles.current.ears.rightEarWidthFactor
      );

      if (faceLandmarks.leftEarWidths) {
        leftEarWidths.push(
          smoothedOneDimensionalVariables.leftEarWidth[faceId]
        );
      }
      if (faceLandmarks.rightEarWidths) {
        rightEarWidths.push(
          smoothedOneDimensionalVariables.rightEarWidth[faceId]
        );
      }
    }

    // Set eye widths
    if (faceLandmarks.eyesWidths) {
      // Update InterocularDistance if needed
      if (!updatedSmoothInterocularDistance) {
        updateOneDimensionalSmoothVariables(
          "interocularDistance",
          faceId,
          Math.sqrt(dx * dx + dy * dy)
        );
      }

      // Calculate eyes width based on interocular distance
      updateOneDimensionalSmoothVariables(
        "eyesWidth",
        faceId,
        smoothedOneDimensionalVariables.interocularDistance[faceId] *
          canvas.width
      );

      eyesWidths.push(smoothedOneDimensionalVariables.eyesWidth[faceId]);
    }

    // Set eye center positions
    if (faceLandmarks.eyesCenterPositions) {
      // Update smooth eyes center position if it hasn't already been done for this dection
      if (!updatedSmoothEyesCenterPosition) {
        updateTwoDimensionalSmoothVariables(
          "eyesCenterPosition",
          faceId,
          [eyesCenterPosition as faceapi.Point],
          canvas
        );
        updatedSmoothEyesCenterPosition = true;
      }

      const normalizedEyesCenterPosition = [
        smoothedTwoDimensionalVariables.eyesCenterPosition[faceId][0],
        smoothedTwoDimensionalVariables.eyesCenterPosition[faceId][1],
      ];

      eyesCenterPositions.push(normalizedEyesCenterPosition);
    }

    // Set chin positions
    if (faceLandmarks.chinPositions) {
      // Update smooth chin position if it hasn't already been done for this dection
      if (!updatedSmoothChinPosition) {
        updateTwoDimensionalSmoothVariables(
          "chinPosition",
          faceId,
          jawOutline,
          canvas
        );
        updatedSmoothChinPosition = true;
      }

      chinPositions.push([
        smoothedTwoDimensionalVariables.chinPosition[faceId][0],
        smoothedTwoDimensionalVariables.chinPosition[faceId][1],
      ]);
    }

    // Set chin widths
    if (faceLandmarks.chinWidths) {
      // Calculate chin width based on jawline points
      const leftJawPoint = jawOutline[0];
      const rightJawPoint = jawOutline[jawOutline.length - 1];
      const chinWidthFactor = 0.55;
      const dxJaw = rightJawPoint.x - leftJawPoint.x;
      const dyJaw = rightJawPoint.y - leftJawPoint.y;

      updateOneDimensionalSmoothVariables(
        "chinWidth",
        faceId,
        Math.sqrt(dxJaw * dxJaw + dyJaw * dyJaw) * chinWidthFactor
      );

      chinWidths.push(smoothedOneDimensionalVariables.chinWidth[faceId]);
    }

    // Set nose positions
    if (faceLandmarks.nosePositions) {
      // Update smooth nose position if it hasn't already been done for this dection
      if (!updatedSmoothNosePosition) {
        updateTwoDimensionalSmoothVariables(
          "nosePosition",
          faceId,
          nose,
          canvas
        );
        updatedSmoothNosePosition = true;
      }

      nosePositions.push([
        smoothedTwoDimensionalVariables.nosePosition[faceId][0],
        smoothedTwoDimensionalVariables.nosePosition[faceId][1],
      ]);
    }

    // Calculate head pitch angle
    if (faceLandmarks.headPitchAngles) {
      // Update smooth nose position if it hasn't already been done for this dection
      if (!updatedSmoothNosePosition) {
        updateTwoDimensionalSmoothVariables(
          "nosePosition",
          faceId,
          nose,
          canvas
        );
        updatedSmoothNosePosition = true;
      }

      // Update smooth eyes center position if it hasn't already been done for this dection
      if (!updatedSmoothEyesCenterPosition) {
        updateTwoDimensionalSmoothVariables(
          "eyesCenterPosition",
          faceId,
          [eyesCenterPosition as faceapi.Point],
          canvas
        );
        updatedSmoothEyesCenterPosition = true;
      }

      // Calculate head tilt (pitch) angle
      const dx =
        nose[0].x / canvas.width -
        smoothedTwoDimensionalVariables.eyesCenterPosition[faceId][0];
      let dy =
        nose[0].y / canvas.height -
        smoothedTwoDimensionalVariables.eyesCenterPosition[faceId][1] -
        0.005;
      if (-0.005 < dy && dy < 0.005) {
        dy = 0;
      }
      console.log(dy);
      let headPitchAngle = Math.atan2(dy, dx);
      console.log(headPitchAngle);

      if (dy === 0) {
        headPitchAngle = 0;
      }

      // Update smoothed variable for head angle
      updateOneDimensionalSmoothVariables(
        "headPitchAngle",
        faceId,
        headPitchAngle
      );

      headPitchAngles.push(
        smoothedOneDimensionalVariables.headPitchAngle[faceId]
      );
    }

    // Calculate and set headYawAngle (for left/right head movement)
    if (faceLandmarks.headYawAngles) {
      // Using the difference in x-coordinates of eyes to estimate yaw angle
      const yawAngle = Math.atan2(
        rightEye[3].x - leftEye[0].x,
        rightEye[3].y - leftEye[0].y
      );

      // Normalize yaw angle to range -1 to 1
      const normalizedYawAngle = yawAngle / Math.PI;

      updateOneDimensionalSmoothVariables(
        "headYawAngle",
        faceId,
        normalizedYawAngle
      );
      headYawAngles.push(smoothedOneDimensionalVariables.headYawAngle[faceId]);
    }

    if (effects.ears && !earsImageOffset[0]) {
      // Update InterocularDistance if needed
      if (!updatedSmoothInterocularDistance) {
        updateOneDimensionalSmoothVariables(
          "interocularDistance",
          faceId,
          Math.sqrt(dx * dx + dy * dy)
        );
      }

      // Determines how far above the eyes the ears should be
      const shiftFactor = 2;

      // Calculate the shift distance for the ear position taking into account
      // headAngle for direction of shift and interocularDistance for scaling
      const { shiftX, shiftY } = directionalShift(
        smoothedOneDimensionalVariables.interocularDistance[faceId] *
          shiftFactor,
        smoothedOneDimensionalVariables.headRotationAngle[faceId]
      );

      earsImageOffset.push(shiftX);
      earsImageOffset.push(shiftY);
    }

    if (effects.beards && !beardImageOffset[0]) {
      // Calculate the shift distance for the chin position taking into account
      // headAngle for direction of shift
      const { shiftX, shiftY } = directionalShift(
        currentEffectsStyles.current.beards.chinOffset,
        smoothedOneDimensionalVariables.headRotationAngle[faceId]
      );

      beardImageOffset.push(shiftX);
      beardImageOffset.push(shiftY);
    }

    if (effects.mustaches && !mustacheImageOffset[0]) {
      // Calculate the shift distance for the nose position taking into account
      // headAngle for direction of shift
      const { shiftX, shiftY } = directionalShift(
        currentEffectsStyles.current.mustaches.noseOffset,
        smoothedOneDimensionalVariables.headRotationAngle[faceId]
      );

      mustacheImageOffset.push(shiftX);
      mustacheImageOffset.push(shiftY);
    }
  });

  // Clean up old face trackers
  for (const [id, tracker] of Object.entries(faceTrackers)) {
    if (!newFaceTrackers[id]) {
      tracker.lastSeen++;
      if (tracker.lastSeen > maxFaceTrackerAge) {
        Object.keys(smoothedTwoDimensionalVariables).forEach((featureType) => {
          const feature = featureType as TwoDimensionalVariableTypes;
          delete smoothedTwoDimensionalVariables[feature][id];
        });
        Object.keys(smoothedOneDimensionalVariables).forEach((featureType) => {
          const feature = featureType as OneDimensionalVariableTypes;
          delete smoothedOneDimensionalVariables[feature][id];
        });
      } else {
        newFaceTrackers[id] = tracker;
      }
    }
  }
  faceTrackers = newFaceTrackers;

  // Update uniforms
  if (faceCount > 0) {
    updateUniforms(
      gl,
      uniformLocations,
      faceLandmarks,
      effects,
      faceCount,
      headRotationAngles,
      headPitchAngles,
      headYawAngles,
      leftEarPositions,
      rightEarPositions,
      leftEarWidths,
      rightEarWidths,
      leftEyePositions,
      rightEyePositions,
      eyesCenterPositions,
      eyesWidths,
      chinPositions,
      chinWidths,
      nosePositions,
      earsImageOffset,
      beardImageOffset,
      mustacheImageOffset
    );
  }
};

export default updateFaceLandmarks;
