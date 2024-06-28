import * as faceapi from "face-api.js";
import { Uniforms } from "./setUniforms";
import { EffectTypes } from "src/context/StreamsContext";
import { FaceLandmarks } from "../handleEffectWebGL";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import directionalShift from "./directionalShift";
import updateTwoDimensionalSmoothVariables from "./updateTwoDimensionalSmoothVariablesNew";
import updateOneDimensionalSmoothVariables from "./updateOneDimensionalSmoothVariables";
import updateUniforms from "./updateUniforms";
import toggleFaceTrackedEffects from "./toggleFaceTrackedEffects";
import {
  FaceMesh,
  NormalizedLandmarkList,
  Results,
} from "@mediapipe/face_mesh";
import {
  smoothedOneDimensionalVariables,
  smoothedTwoDimensionalVariables,
} from "./updateFaceLandmarks";
import overlayImageOnLiveVideo from "./overlayImageOnLiveVideo";
import { Attributes } from "./setAttributes";

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

// export const smoothedTwoDimensionalVariables: {
//   [featureType in TwoDimensionalVariableTypes]: { [id: string]: number[] };
// } = {
//   eyesCenterPosition: {},
//   leftEyePosition: {},
//   rightEyePosition: {},
//   nosePosition: {},
//   chinPosition: {},
// };
// export const smoothedOneDimensionalVariables: {
//   [featureType in OneDimensionalVariableTypes]: { [id: string]: number };
// } = {
//   leftEarWidth: {},
//   rightEarWidth: {},
//   eyesWidth: {},
//   chinWidth: {},
//   headRotationAngle: {},
//   headPitchAngle: {},
//   headYawAngle: {},
//   interocularDistance: {},
// };

let faceTrackers: {
  [id: string]: { position: faceapi.Point; lastSeen: number };
} = {};
const maxFaceTrackerAge = 5;
const detectionTimeout = 200;

let detectTimeout: NodeJS.Timeout | undefined;
let detectionTimedout = false;

const updateFaceLandmarksNew = async (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  videoProgram: WebGLProgram,
  triangleProgram: WebGLProgram,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  uniformLocations: {
    [uniform in Uniforms]: WebGLUniformLocation | null | undefined;
  },
  attributeLocations: {
    [uniform in Attributes]: number | null | undefined;
  },
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean },
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
  faceMesh: FaceMesh,
  faceMeshResults: Results[],
  // trianglePositionBuffer: WebGLBuffer,
  // triangleTexCoordBuffer: WebGLBuffer,
  triangleTexture: WebGLTexture
) => {
  await faceMesh.send({ image: video });
  if (!faceMeshResults[0]) {
    return;
  }
  const multiFaceLandmarks = faceMeshResults[0].multiFaceLandmarks;
  if (!multiFaceLandmarks) {
    return;
  }

  const faceCount = multiFaceLandmarks.length;

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

  multiFaceLandmarks.forEach((landmarks, faceIndex) => {
    overlayImageOnLiveVideo(
      gl,
      triangleProgram,
      landmarks.slice(0, -10),
      canvas,
      uniformLocations,
      attributeLocations,
      triangleTexture
    );
    const directions = calculateDirection(landmarks);
    const LEFT_EYE_INDEX = 33;
    const RIGHT_EYE_INDEX = 263;
    const NOSE_INDEX = 1;

    const leftEye = landmarks[LEFT_EYE_INDEX];
    const rightEye = landmarks[RIGHT_EYE_INDEX];
    const nose = landmarks[NOSE_INDEX];
    const jawOutline = landmarks[5];
    const leftmostJawPoint = landmarks[234];
    const rightmostJawPoint = landmarks[454];
    let updatedSmoothEyePosition = false;
    let updatedSmoothNosePosition = false;
    let updatedSmoothChinPosition = false;
    let updatedSmoothInterocularDistance = false;
    let updatedSmoothEyesCenterPosition = false;

    // Set the faceTracker based on which face is closest to which face in
    // the set of last seen faces
    const eyesCenterPosition = {
      x: (leftEye.x + rightEye.x) / 2,
      y: (leftEye.y + rightEye.y) / 2,
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
    const dx = rightEye.x - leftEye.x;
    const dy = rightEye.y - leftEye.y;
    const dz = rightEye.z - leftEye.z;

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
        updateTwoDimensionalSmoothVariables("leftEyePosition", faceId, [
          leftEye.x,
          leftEye.y,
        ]);
        updateTwoDimensionalSmoothVariables("rightEyePosition", faceId, [
          rightEye.x,
          rightEye.y,
        ]);
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
        updateTwoDimensionalSmoothVariables("leftEyePosition", faceId, [
          leftEye.x,
          leftEye.y,
        ]);
        updateTwoDimensionalSmoothVariables("rightEyePosition", faceId, [
          rightEye.x,
          rightEye.y,
        ]);
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
        updateTwoDimensionalSmoothVariables("eyesCenterPosition", faceId, [
          eyesCenterPosition.x,
          eyesCenterPosition.y,
        ]);
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
        updateTwoDimensionalSmoothVariables("chinPosition", faceId, [
          jawOutline.x,
          jawOutline.y,
        ]);
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
      const chinWidthFactor = 0.55;
      const dxJaw = rightmostJawPoint.x - leftmostJawPoint.x;
      const dyJaw = rightmostJawPoint.y - leftmostJawPoint.y;

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
        updateTwoDimensionalSmoothVariables("nosePosition", faceId, [
          nose.x,
          nose.y,
        ]);
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
        updateTwoDimensionalSmoothVariables("nosePosition", faceId, [
          nose.x,
          nose.y,
        ]);
        updatedSmoothNosePosition = true;
      }

      // Update smooth eyes center position if it hasn't already been done for this dection
      if (!updatedSmoothEyesCenterPosition) {
        updateTwoDimensionalSmoothVariables("eyesCenterPosition", faceId, [
          eyesCenterPosition.x,
          eyesCenterPosition.y,
        ]);
        updatedSmoothEyesCenterPosition = true;
      }

      // Calculate head tilt (pitch) angle
      // Calculate the difference in x, y, and z coordinates
      const dx =
        nose.x - smoothedTwoDimensionalVariables.eyesCenterPosition[faceId][0];
      const dy =
        nose.y - smoothedTwoDimensionalVariables.eyesCenterPosition[faceId][1];
      const dz = nose.z - leftEye.z;

      // Calculate head tilt (pitch) angle using 3D coordinates
      let headPitchAngle =
        (Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) - 0.8) * 2;

      if (headPitchAngle > Math.PI / 2) {
        headPitchAngle = Math.PI / 2;
      } else if (headPitchAngle < -Math.PI / 2) {
        headPitchAngle = -Math.PI / 2;
      }

      // Update smoothed variable for head angle
      updateOneDimensionalSmoothVariables(
        "headPitchAngle",
        faceId,
        -headPitchAngle
      );

      headPitchAngles.push(
        smoothedOneDimensionalVariables.headPitchAngle[faceId]
      );
    }

    // Calculate and set headYawAngle (for left/right head movement)
    if (faceLandmarks.headYawAngles) {
      // Using the difference in x-coordinates of eyes to estimate yaw angle
      const yawAngle = Math.atan2(
        rightEye.x - leftEye.x,
        rightEye.y - leftEye.y
      );

      // Normalize yaw angle to range -1 to 1
      const normalizedYawAngle = yawAngle / Math.PI;

      updateOneDimensionalSmoothVariables(
        "headYawAngle",
        faceId,
        (directions.turn * Math.PI) / 180 - Math.PI / 2
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
      videoProgram,
      triangleProgram,
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

export default updateFaceLandmarksNew;

function calculateDirection(keyPoints: NormalizedLandmarkList) {
  const noseTip = { ...keyPoints[1], name: "nose tip" };
  const leftNose = { ...keyPoints[279], name: "left nose" };
  const rightNose = { ...keyPoints[49], name: "right nose" };

  // MIDESCTION OF NOSE IS BACK OF NOSE PERPENDICULAR
  const midpoint = {
    x: (leftNose.x + rightNose.x) / 2,
    y: (leftNose.y + rightNose.y) / 2,
    z: (leftNose.z + rightNose.z) / 2,
  };
  const perpendicularUp = { x: midpoint.x, y: midpoint.y - 50, z: midpoint.z };

  // CALC ANGLES
  const yaw = getAngleBetweenLines(midpoint, noseTip, perpendicularUp);
  const turn = getAngleBetweenLines(midpoint, rightNose, noseTip);

  // CALC DISTANCE BETWEEN NOSE TIP AND MIDPOINT, AND LEFT AND RIGHT NOSE POINTS
  const zDistance = getDistanceBetweenPoints(noseTip, midpoint);
  const xDistance = getDistanceBetweenPoints(leftNose, rightNose);

  return { yaw, turn, zDistance, xDistance };
}

function getDistanceBetweenPoints(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
) {
  const xDistance = point1.x - point2.x;
  const yDistance = point1.y - point2.y;
  return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
}

function getAngleBetweenLines(
  midpoint: { x: number; y: number },
  point1: { x: number; y: number },
  point2: { x: number; y: number }
) {
  const vector1 = { x: point1.x - midpoint.x, y: point1.y - midpoint.y };
  const vector2 = { x: point2.x - midpoint.x, y: point2.y - midpoint.y };

  // Calculate the dot product of the two vectors
  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;

  // Calculate the magnitudes of the vectors
  const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
  const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

  // Calculate the cosine of the angle between the two vectors
  const cosineTheta = dotProduct / (magnitude1 * magnitude2);

  // Use the arccosine function to get the angle in radians
  const angleInRadians = Math.acos(cosineTheta);

  // Convert the angle to degrees
  const angleInDegrees = (angleInRadians * 180) / Math.PI;

  return angleInDegrees;
}
