import { BaseUniforms } from "./initializeBaseUniforms";
import { EffectTypes } from "src/context/StreamsContext";
import { FaceLandmarks } from "../handleEffectWebGL";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import directionalShift from "./directionalShift";
import updateOneDimensionalSmoothVariables from "./updateOneDimensionalSmoothVariables";
import updateBaseUniforms from "./updateBaseUniforms";
import toggleFaceTrackedEffects from "./toggleFaceTrackedEffects";
import { NormalizedLandmarkList } from "@mediapipe/face_mesh";

export type OneDimensionalVariableTypes =
  | "leftEarWidth"
  | "rightEarWidth"
  | "eyesWidth"
  | "chinWidth"
  | "headRotationAngle"
  | "headPitchAngle"
  | "headYawAngle"
  | "interocularDistance";

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

const detectionTimeout = 200;
let detectTimeout: NodeJS.Timeout | undefined;
let detectionTimedout = false;

const LEFT_EYE_INDEX = 468;
const RIGHT_EYE_INDEX = 473;
const NOSE_INDEX = 1;
const JAW_MID_POINT_INDEX = 152;
const LEFT_JAW_POINT = 172;
const RIGHT_JAW_POINT = 397;

const updateFaceLandmarks = async (
  smoothedFaceIdLandmarksPairs: {
    faceId: string;
    landmarks: NormalizedLandmarkList;
  }[],
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  videoProgram: WebGLProgram,
  canvas: HTMLCanvasElement,
  baseUniformLocations: {
    [uniform in BaseUniforms]: WebGLUniformLocation | null | undefined;
  },
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean },
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>
) => {
  const faceCount = smoothedFaceIdLandmarksPairs.length;

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
    toggleFaceTrackedEffects(1, gl, baseUniformLocations, effects);
  }
  if (faceCount === 0 && !detectTimeout) {
    detectTimeout = setTimeout(() => {
      detectionTimedout = true;
      toggleFaceTrackedEffects(0, gl, baseUniformLocations, effects);
      detectTimeout = undefined;
    }, detectionTimeout);
  }
  if (faceCount !== 0 && detectTimeout) {
    clearTimeout(detectTimeout);
    detectTimeout = undefined;
  }

  smoothedFaceIdLandmarksPairs.forEach((smoothedFaceIdLandmarksPair) => {
    const { faceId, landmarks } = smoothedFaceIdLandmarksPair;

    const directions = calculateDirection(landmarks);

    const leftEye = landmarks[LEFT_EYE_INDEX];
    const rightEye = landmarks[RIGHT_EYE_INDEX];
    const nose = landmarks[NOSE_INDEX];
    const jawMidPoint = landmarks[JAW_MID_POINT_INDEX];
    const leftJawPoint = landmarks[LEFT_JAW_POINT];
    const rightJawPoint = landmarks[RIGHT_JAW_POINT];

    let updatedSmoothInterocularDistance = false;

    // Set the faceTracker based on which face is closest to which face in
    // the set of last seen faces
    const eyesCenterPosition = [
      (leftEye.x + rightEye.x) / 2,
      (leftEye.y + rightEye.y) / 2,
    ];

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
      leftEyePositions.push([leftEye.x, leftEye.y]);
      rightEyePositions.push([rightEye.x, rightEye.y]);
    }

    // Set leftEarPositions and rightEarPositions
    if (faceLandmarks.leftEarPositions || faceLandmarks.rightEarPositions) {
      leftEarPositions.push([leftEye.x, leftEye.y]);
      rightEarPositions.push([rightEye.x, rightEye.y]);
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
        updatedSmoothInterocularDistance = true;
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
        updatedSmoothInterocularDistance = true;
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
      eyesCenterPositions.push(eyesCenterPosition);
    }

    // Set chin positions
    if (faceLandmarks.chinPositions) {
      chinPositions.push([jawMidPoint.x, jawMidPoint.y]);
    }

    // Set chin widths
    if (faceLandmarks.chinWidths) {
      // Calculate chin width based on jawline points
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
      nosePositions.push([nose.x, nose.y]);
    }

    // Calculate head pitch angle
    if (faceLandmarks.headPitchAngles) {
      // Calculate head tilt (pitch) angle
      // Calculate the difference in x, y, and z coordinates
      const dx = nose.x - eyesCenterPosition[0];
      const dy = nose.y - eyesCenterPosition[1];
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

  // Update uniforms
  if (faceCount > 0) {
    updateBaseUniforms(
      gl,
      videoProgram,
      baseUniformLocations,
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
