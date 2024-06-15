import * as faceapi from "face-api.js";
import { Uniforms } from "./setUniforms";

const maxFaces = 8;
let smoothedNormalizedLeftEarPositions: { [id: string]: number[] } = {};
let smoothedNormalizedRightEarPositions: { [id: string]: number[] } = {};
const smoothingFactor = 0.4;

let faceTrackers: {
  [id: string]: { position: faceapi.Point; lastSeen: number };
} = {};
const maxTrackerAge = 5;
const detectionTimeout = 150;

let detectTimeout: NodeJS.Timeout | undefined;

const updateFaceLandmarks = async (
  gl: WebGLRenderingContext,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  uniformLocations: {
    [uniform in Uniforms]: WebGLUniformLocation | null | undefined;
  }
) => {
  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  if (detections.length !== 0 && uniformLocations.uDogEarsEffectLocation) {
    gl.uniform1i(uniformLocations.uDogEarsEffectLocation, 1);
  }

  const leftEarPositions: number[][] = [];
  const rightEarPositions: number[][] = [];
  const leftEarSizes: number[][] = [];
  const rightEarSizes: number[][] = [];
  const headRotationAngles: number[] = [];
  const faceCount = detections.length;

  const newFaceTrackers: {
    [id: string]: { position: faceapi.Point; lastSeen: number };
  } = {};

  detections.forEach((detection, faceIndex) => {
    const landmarks = detection.landmarks;
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    // Set the faceTracker based on which face is closest to which face in
    // the set of last seen faces
    const faceCenter = {
      x: (leftEye[0].x + rightEye[3].x) / 2,
      y: (leftEye[0].y + rightEye[3].y) / 2,
    };

    let closestTrackerId = null;
    let closestDistance = Infinity;

    for (const [id, tracker] of Object.entries(faceTrackers)) {
      const distance = Math.sqrt(
        Math.pow(faceCenter.x - tracker.position.x, 2) +
          Math.pow(faceCenter.y - tracker.position.y, 2)
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
      position: faceCenter as faceapi.Point,
      lastSeen: 0,
    };

    // Calculate the interocularDistance based on the positions of the eyes
    const dx = (rightEye[0].x - leftEye[0].x) / canvas.width;
    const dy = (rightEye[0].y - leftEye[0].y) / canvas.height;
    const interocularDistance = Math.sqrt(dx * dx + dy * dy);

    // Calculate head angle in plane
    const headAngle = Math.atan2(dy, dx);

    // Determines how far above the eyes the ears should be
    const shiftFactor = 2;

    // Calculate the shift distance for the ear position taking into account
    // headAngle for direction of shift and interocularDistance for scaling
    const shiftDistance = interocularDistance * shiftFactor;
    const perpendicularAngle = headAngle + Math.PI / 2;
    const shiftX = Math.cos(perpendicularAngle) * shiftDistance;
    const shiftY = Math.sin(perpendicularAngle) * shiftDistance;

    // Update or initialize smoothed positions for this face
    if (!smoothedNormalizedLeftEarPositions[faceId]) {
      smoothedNormalizedLeftEarPositions[faceId] = [
        leftEye[0].x / canvas.width - shiftX,
        leftEye[0].y / canvas.height - shiftY,
      ];
    }
    if (!smoothedNormalizedRightEarPositions[faceId]) {
      smoothedNormalizedRightEarPositions[faceId] = [
        rightEye[3].x / canvas.width - shiftX,
        rightEye[3].y / canvas.height - shiftY,
      ];
    }

    // Smoothing and normalizing the positions
    smoothedNormalizedLeftEarPositions[faceId][0] =
      smoothedNormalizedLeftEarPositions[faceId][0] * smoothingFactor +
      (leftEye[0].x / canvas.width - shiftX) * (1 - smoothingFactor);
    smoothedNormalizedLeftEarPositions[faceId][1] =
      smoothedNormalizedLeftEarPositions[faceId][1] * smoothingFactor +
      (leftEye[0].y / canvas.height - shiftY) * (1 - smoothingFactor);

    smoothedNormalizedRightEarPositions[faceId][0] =
      smoothedNormalizedRightEarPositions[faceId][0] * smoothingFactor +
      (rightEye[3].x / canvas.width - shiftX) * (1 - smoothingFactor);
    smoothedNormalizedRightEarPositions[faceId][1] =
      smoothedNormalizedRightEarPositions[faceId][1] * smoothingFactor +
      (rightEye[3].y / canvas.height - shiftY) * (1 - smoothingFactor);

    // Calculate ear size based on interocular distance
    const earSizeFactor = 300;
    const earWidth = interocularDistance * earSizeFactor;
    const earHeight = interocularDistance * earSizeFactor;
    const normalizedEarSize = [earWidth, earHeight];

    leftEarPositions.push(smoothedNormalizedLeftEarPositions[faceId]);
    rightEarPositions.push(smoothedNormalizedRightEarPositions[faceId]);
    leftEarSizes.push(normalizedEarSize);
    rightEarSizes.push(normalizedEarSize);
    headRotationAngles.push(headAngle);
  });

  // Remove old face trackers
  for (const [id, tracker] of Object.entries(faceTrackers)) {
    if (!newFaceTrackers[id]) {
      tracker.lastSeen++;
      if (tracker.lastSeen > maxTrackerAge) {
        delete smoothedNormalizedLeftEarPositions[id];
        delete smoothedNormalizedRightEarPositions[id];
      } else {
        newFaceTrackers[id] = tracker;
      }
    }
  }
  faceTrackers = newFaceTrackers;

  // Set timeout to turn off dog ears effect if no detections after a delay
  if (detections.length === 0 && !detectTimeout) {
    detectTimeout = setTimeout(() => {
      if (uniformLocations.uDogEarsEffectLocation) {
        gl.uniform1i(uniformLocations.uDogEarsEffectLocation, 0);
      }
      detectTimeout = undefined;
    }, detectionTimeout);
  }
  if (detections.length === 1 && detectTimeout) {
    clearTimeout(detectTimeout);
    detectTimeout = undefined;
  }

  // Update uniforms
  if (
    detections.length > 0 &&
    uniformLocations.uLeftEarPositionsLocation &&
    uniformLocations.uRightEarPositionsLocation &&
    uniformLocations.uHeadRotationAnglesLocation &&
    uniformLocations.uLeftEarSizesLocation &&
    uniformLocations.uRightEarSizesLocation &&
    uniformLocations.uFaceCountLocation
  ) {
    gl.uniform2fv(
      uniformLocations.uLeftEarPositionsLocation,
      flattenArray(leftEarPositions, maxFaces)
    );
    gl.uniform2fv(
      uniformLocations.uRightEarPositionsLocation,
      flattenArray(rightEarPositions, maxFaces)
    );
    gl.uniform2fv(
      uniformLocations.uLeftEarSizesLocation,
      flattenArray(leftEarSizes, maxFaces)
    );
    gl.uniform2fv(
      uniformLocations.uRightEarSizesLocation,
      flattenArray(rightEarSizes, maxFaces)
    );
    gl.uniform1fv(
      uniformLocations.uHeadRotationAnglesLocation,
      new Float32Array(headRotationAngles)
    );
    gl.uniform1i(uniformLocations.uFaceCountLocation, faceCount);
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
