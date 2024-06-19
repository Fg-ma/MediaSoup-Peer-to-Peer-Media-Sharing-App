import * as faceapi from "face-api.js";
import { Uniforms } from "./setUniforms";
import { EffectTypes } from "src/context/StreamsContext";
import { FaceLandmarks } from "../handleEffectWebGL";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import directionalShift from "./directionalShift";
import updateSmoothPosition from "./updateSmoothPosition";

export type FeatureTypes = "leftEye" | "rightEye" | "nose" | "chin";

const maxFaces = 8;
export const smoothedPositions: {
  [featureType in FeatureTypes]: { [id: string]: number[] };
} = {
  leftEye: {},
  rightEye: {},
  nose: {},
  chin: {},
};

let faceTrackers: {
  [id: string]: { position: faceapi.Point; lastSeen: number };
} = {};
const maxTrackerAge = 5;
const detectionTimeout = 200;

let detectTimeout: NodeJS.Timeout | undefined;

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

  if (detections.length !== 0) {
    if (effects.ears && uniformLocations.uEarsEffectLocation) {
      gl.uniform1i(uniformLocations.uEarsEffectLocation, 1);
    }
    if (effects.glasses && uniformLocations.uGlassesEffectLocation) {
      gl.uniform1i(uniformLocations.uGlassesEffectLocation, 1);
    }
    if (effects.beards && uniformLocations.uBeardEffectLocation) {
      gl.uniform1i(uniformLocations.uBeardEffectLocation, 1);
    }
    if (effects.mustaches && uniformLocations.uMustacheEffectLocation) {
      gl.uniform1i(uniformLocations.uMustacheEffectLocation, 1);
    }
  }

  const faceCount = detections.length;
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
  const earsImageOffset: number[] = [];
  const beardImageOffset: number[] = [];
  const mustacheImageOffset: number[] = [];

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

    // Set the faceTracker based on which face is closest to which face in
    // the set of last seen faces
    const eyeCenterPosition = {
      x: (leftEye[0].x + rightEye[3].x) / 2,
      y: (leftEye[0].y + rightEye[3].y) / 2,
    };

    let closestTrackerId = null;
    let closestDistance = Infinity;

    for (const [id, tracker] of Object.entries(faceTrackers)) {
      const distance = Math.sqrt(
        Math.pow(eyeCenterPosition.x - tracker.position.x, 2) +
          Math.pow(eyeCenterPosition.y - tracker.position.y, 2)
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
      position: eyeCenterPosition as faceapi.Point,
      lastSeen: 0,
    };

    // Calculate the interocularDistance based on the positions of the eyes
    const dx = (rightEye[0].x - leftEye[0].x) / canvas.width;
    const dy = (rightEye[0].y - leftEye[0].y) / canvas.height;
    const interocularDistance = Math.sqrt(dx * dx + dy * dy);

    // Calculate head angle in plane
    const headAngle = Math.atan2(dy, dx);
    if (faceLandmarks.headRotationAngles) {
      headRotationAngles.push(headAngle);
    }

    // Set left and right eye positions
    if (faceLandmarks.leftEyePositions || faceLandmarks.leftEyePositions) {
      // Update smooth eye position if it hasn't already been done for this dection
      if (!updatedSmoothEyePosition) {
        updateSmoothPosition("leftEye", faceId, leftEye, canvas);
        updateSmoothPosition("rightEye", faceId, rightEye, canvas);
        updatedSmoothEyePosition = true;
      }

      leftEyePositions.push(smoothedPositions.leftEye[faceId]);
      rightEyePositions.push(smoothedPositions.rightEye[faceId]);
    }

    // Set leftEarPositions and rightEarPositions
    if (faceLandmarks.leftEarPositions || faceLandmarks.rightEarPositions) {
      // Update smooth eye position if it hasn't already been done for this dection
      if (!updatedSmoothEyePosition) {
        updateSmoothPosition("leftEye", faceId, leftEye, canvas);
        updateSmoothPosition("rightEye", faceId, rightEye, canvas);
        updatedSmoothEyePosition = true;
      }

      leftEarPositions.push([
        smoothedPositions.leftEye[faceId][0],
        smoothedPositions.leftEye[faceId][1],
      ]);
      rightEarPositions.push([
        smoothedPositions.rightEye[faceId][0],
        smoothedPositions.rightEye[faceId][1],
      ]);
    }

    // Set left and right ear widths
    if (faceLandmarks.leftEarWidths || faceLandmarks.rightEarWidths) {
      // Calculate ear size based on interocular distance
      const earWidthFactor = 300;
      const normalizedEarWidth = interocularDistance * earWidthFactor;

      if (faceLandmarks.leftEarWidths) {
        leftEarWidths.push(normalizedEarWidth);
      }
      if (faceLandmarks.rightEarWidths) {
        rightEarWidths.push(normalizedEarWidth);
      }
    }

    // Set eye widths
    if (faceLandmarks.eyesWidths) {
      const normalizedEyesWidth = interocularDistance * canvas.width;

      eyesWidths.push(normalizedEyesWidth);
    }

    // Set eye center positions
    if (faceLandmarks.eyesCenterPositions) {
      const normalizedEyesCenterPosition = [
        eyeCenterPosition.x / canvas.width,
        eyeCenterPosition.y / canvas.height,
      ];

      eyesCenterPositions.push(normalizedEyesCenterPosition);
    }

    // Set chin positions
    if (faceLandmarks.chinPositions) {
      // Update smooth chin position if it hasn't already been done for this dection
      if (!updatedSmoothChinPosition) {
        updateSmoothPosition("chin", faceId, jawOutline, canvas);
        updatedSmoothChinPosition = true;
      }

      chinPositions.push([
        smoothedPositions.chin[faceId][0],
        smoothedPositions.chin[faceId][1],
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
      const chinWidth =
        Math.sqrt(dxJaw * dxJaw + dyJaw * dyJaw) * chinWidthFactor;
      chinWidths.push(chinWidth);
    }

    // Set nose positions
    if (faceLandmarks.nosePositions) {
      // Update smooth nose position if it hasn't already been done for this dection
      if (!updatedSmoothNosePosition) {
        updateSmoothPosition("nose", faceId, nose, canvas);
        updatedSmoothNosePosition = true;
      }

      nosePositions.push([
        smoothedPositions.nose[faceId][0],
        smoothedPositions.nose[faceId][1],
      ]);
    }

    if (effects.ears && !earsImageOffset[0]) {
      // Determines how far above the eyes the ears should be
      const shiftFactor = 2;

      // Calculate the shift distance for the ear position taking into account
      // headAngle for direction of shift and interocularDistance for scaling
      const { shiftX, shiftY } = directionalShift(
        interocularDistance * shiftFactor,
        headAngle
      );

      earsImageOffset.push(shiftX);
      earsImageOffset.push(shiftY);
    }

    if (effects.beards && !beardImageOffset[0]) {
      // Calculate the shift distance for the chin position taking into account
      // headAngle for direction of shift
      const { shiftX, shiftY } = directionalShift(
        currentEffectsStyles.current.beards.chinOffset,
        headAngle
      );

      beardImageOffset.push(shiftX);
      beardImageOffset.push(shiftY);
    }

    if (effects.mustaches && !mustacheImageOffset[0]) {
      // Calculate the shift distance for the nose position taking into account
      // headAngle for direction of shift
      const { shiftX, shiftY } = directionalShift(
        currentEffectsStyles.current.mustaches.noseOffset,
        headAngle
      );

      mustacheImageOffset.push(shiftX);
      mustacheImageOffset.push(shiftY);
    }
  });

  // Remove old face trackers
  for (const [id, tracker] of Object.entries(faceTrackers)) {
    if (!newFaceTrackers[id]) {
      tracker.lastSeen++;
      if (tracker.lastSeen > maxTrackerAge) {
        Object.keys(smoothedPositions).forEach((featureType) => {
          const feature = featureType as FeatureTypes;
          delete smoothedPositions[feature][id];
        });
      } else {
        newFaceTrackers[id] = tracker;
      }
    }
  }
  faceTrackers = newFaceTrackers;

  // Set timeout to turn off effects if no detections after a delay
  if (detections.length === 0 && !detectTimeout) {
    detectTimeout = setTimeout(() => {
      if (effects.ears && uniformLocations.uEarsEffectLocation) {
        gl.uniform1i(uniformLocations.uEarsEffectLocation, 0);
      }
      if (effects.glasses && uniformLocations.uGlassesEffectLocation) {
        gl.uniform1i(uniformLocations.uGlassesEffectLocation, 0);
      }
      if (effects.beards && uniformLocations.uBeardEffectLocation) {
        gl.uniform1i(uniformLocations.uBeardEffectLocation, 0);
      }
      if (effects.mustaches && uniformLocations.uMustacheEffectLocation) {
        gl.uniform1i(uniformLocations.uMustacheEffectLocation, 0);
      }
      detectTimeout = undefined;
    }, detectionTimeout);
  }
  if (detections.length === 1 && detectTimeout) {
    clearTimeout(detectTimeout);
    detectTimeout = undefined;
  }

  // Update uniforms
  if (detections.length > 0) {
    if (uniformLocations.uFaceCountLocation) {
      gl.uniform1i(uniformLocations.uFaceCountLocation, faceCount);
    }
    if (
      uniformLocations.uHeadRotationAnglesLocation &&
      faceLandmarks.headRotationAngles
    ) {
      gl.uniform1fv(
        uniformLocations.uHeadRotationAnglesLocation,
        new Float32Array(headRotationAngles)
      );
    }
    if (
      uniformLocations.uLeftEarPositionsLocation &&
      faceLandmarks.leftEarPositions
    ) {
      gl.uniform2fv(
        uniformLocations.uLeftEarPositionsLocation,
        flattenArray(leftEarPositions, maxFaces)
      );
    }
    if (
      uniformLocations.uRightEarPositionsLocation &&
      faceLandmarks.rightEarPositions
    ) {
      gl.uniform2fv(
        uniformLocations.uRightEarPositionsLocation,
        flattenArray(rightEarPositions, maxFaces)
      );
    }
    if (
      uniformLocations.uLeftEarWidthsLocation &&
      faceLandmarks.leftEarWidths
    ) {
      gl.uniform1fv(
        uniformLocations.uLeftEarWidthsLocation,
        new Float32Array(leftEarWidths)
      );
    }
    if (
      uniformLocations.uRightEarWidthsLocation &&
      faceLandmarks.rightEarWidths
    ) {
      gl.uniform1fv(
        uniformLocations.uRightEarWidthsLocation,
        new Float32Array(rightEarWidths)
      );
    }
    if (
      uniformLocations.uLeftEyePositionsLocation &&
      faceLandmarks.leftEyePositions
    ) {
      gl.uniform2fv(
        uniformLocations.uLeftEyePositionsLocation,
        flattenArray(leftEyePositions, maxFaces)
      );
    }
    if (
      uniformLocations.uRightEyePositionsLocation &&
      faceLandmarks.rightEyePositions
    ) {
      gl.uniform2fv(
        uniformLocations.uRightEyePositionsLocation,
        flattenArray(rightEyePositions, maxFaces)
      );
    }
    if (
      uniformLocations.uEyesCentersLocation &&
      faceLandmarks.eyesCenterPositions
    ) {
      gl.uniform2fv(
        uniformLocations.uEyesCentersLocation,
        flattenArray(eyesCenterPositions, maxFaces)
      );
    }
    if (uniformLocations.uEyesWidthsLocation && faceLandmarks.eyesWidths) {
      gl.uniform1fv(
        uniformLocations.uEyesWidthsLocation,
        new Float32Array(eyesWidths)
      );
    }
    if (
      uniformLocations.uChinPositionsLocation &&
      faceLandmarks.chinPositions
    ) {
      gl.uniform2fv(
        uniformLocations.uChinPositionsLocation,
        flattenArray(chinPositions, maxFaces)
      );
    }
    if (uniformLocations.uChinWidthsLocation && faceLandmarks.chinWidths) {
      gl.uniform1fv(
        uniformLocations.uChinWidthsLocation,
        new Float32Array(chinWidths)
      );
    }
    if (
      uniformLocations.uNosePositionsLocation &&
      faceLandmarks.nosePositions
    ) {
      gl.uniform2fv(
        uniformLocations.uNosePositionsLocation,
        flattenArray(nosePositions, maxFaces)
      );
    }
    if (uniformLocations.uEarsImageOffset && effects.ears) {
      gl.uniform2fv(uniformLocations.uEarsImageOffset, earsImageOffset);
    }
    if (uniformLocations.uBeardImageOffset && effects.beards) {
      gl.uniform2fv(uniformLocations.uBeardImageOffset, beardImageOffset);
    }
    if (uniformLocations.uMustacheImageOffset && effects.mustaches) {
      gl.uniform2fv(uniformLocations.uMustacheImageOffset, mustacheImageOffset);
    }
  }
};

const flattenArray = (arr: number[][], maxLength: number): Float32Array => {
  const result = new Float32Array(2 * maxLength);
  for (let i = 0; i < arr.length; i++) {
    result[i * 2] = arr[i][0];
    result[i * 2 + 1] = arr[i][1];
  }
  return result;
};

export default updateFaceLandmarks;
