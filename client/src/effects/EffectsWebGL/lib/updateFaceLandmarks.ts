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
  | "interocularDistance";

export const smoothedOneDimensionalVariables: {
  [featureType in OneDimensionalVariableTypes]: { [id: string]: number };
} = {
  leftEarWidth: {},
  rightEarWidth: {},
  eyesWidth: {},
  chinWidth: {},
  headRotationAngle: {},
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
  baseProgram: WebGLProgram,
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
  const earsImageOffset: number[][] = [];
  const beardImageOffset: number[][] = [];
  const mustacheImageOffset: number[][] = [];

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

    const leftEye = landmarks[LEFT_EYE_INDEX];
    const rightEye = landmarks[RIGHT_EYE_INDEX];
    const nose = landmarks[NOSE_INDEX];
    const jawMidPoint = landmarks[JAW_MID_POINT_INDEX];
    const leftJawPoint = landmarks[LEFT_JAW_POINT];
    const rightJawPoint = landmarks[RIGHT_JAW_POINT];

    let updatedSmoothInterocularDistance = false;

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
      const chinWidthFactor = 0.75;
      const dxJaw = rightJawPoint.x - leftJawPoint.x;
      const dyJaw = rightJawPoint.y - leftJawPoint.y;

      updateOneDimensionalSmoothVariables(
        "chinWidth",
        faceId,
        Math.sqrt(dxJaw * dxJaw + dyJaw * dyJaw) *
          canvas.width *
          chinWidthFactor
      );

      chinWidths.push(smoothedOneDimensionalVariables.chinWidth[faceId]);
    }

    // Set nose positions
    if (faceLandmarks.nosePositions) {
      nosePositions.push([nose.x, nose.y]);
    }

    if (effects.ears) {
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

      earsImageOffset.push([shiftX, shiftY]);
    }

    if (effects.beards) {
      // Calculate the shift distance for the chin position taking into account
      // headAngle for direction of shift
      const { shiftX, shiftY } = directionalShift(
        currentEffectsStyles.current.beards.chinOffset,
        smoothedOneDimensionalVariables.headRotationAngle[faceId]
      );

      beardImageOffset.push([shiftX, shiftY]);
    }

    if (effects.mustaches) {
      // Calculate the shift distance for the nose position taking into account
      // headAngle for direction of shift
      const { shiftX, shiftY } = directionalShift(
        currentEffectsStyles.current.mustaches.noseOffset,
        smoothedOneDimensionalVariables.headRotationAngle[faceId]
      );

      mustacheImageOffset.push([shiftX, shiftY]);
    }
  });

  // Update uniforms
  if (faceCount > 0) {
    updateBaseUniforms(
      gl,
      baseProgram,
      baseUniformLocations,
      faceLandmarks,
      effects,
      faceCount,
      headRotationAngles,
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
