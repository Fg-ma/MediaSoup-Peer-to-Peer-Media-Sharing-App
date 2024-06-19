import * as faceapi from "face-api.js";
import { Uniforms } from "./setUniforms";
import { EffectTypes } from "src/context/StreamsContext";
import { FaceLandmarks } from "../handleEffectWebGL";

const maxFaces = 8;
let smoothedNormalizedLeftEyePositions: { [id: string]: number[] } = {};
let smoothedNormalizedRightEyePositions: { [id: string]: number[] } = {};
let smoothedNormalizedNosePositions: { [id: string]: number[] } = {};
const deadbandingThreshold = 0.035;

let faceTrackers: {
  [id: string]: { position: faceapi.Point; lastSeen: number };
} = {};
const maxTrackerAge = 5;
const detectionTimeout = 200;

let detectTimeout: NodeJS.Timeout | undefined;

const adaptiveSmoothingFactor = (distance: number) => {
  const minFactor = 0.4;
  const maxFactor = 0.9;
  const threshold = 0.08;

  if (distance < threshold) {
    return maxFactor;
  } else {
    return minFactor;
  }
};

const smoothPositionWithDeadbanding = (
  previous: number[],
  current: number[],
  smoothingFactor: number
): number[] => {
  const deltaX = current[0] - previous[0];
  const deltaY = current[1] - previous[1];

  if (
    Math.abs(deltaX) < deadbandingThreshold &&
    Math.abs(deltaY) < deadbandingThreshold
  ) {
    return previous;
  }

  return [
    previous[0] * smoothingFactor + current[0] * (1 - smoothingFactor),
    previous[1] * smoothingFactor + current[1] * (1 - smoothingFactor),
  ];
};

const updateSmoothEyePosition = (
  faceId: string,
  leftEye: faceapi.Point[],
  rightEye: faceapi.Point[],
  canvas: HTMLCanvasElement
) => {
  // Initialize smoothed positions
  if (!smoothedNormalizedLeftEyePositions[faceId]) {
    smoothedNormalizedLeftEyePositions[faceId] = [
      leftEye[0].x / canvas.width,
      leftEye[0].y / canvas.height,
    ];
  }
  if (!smoothedNormalizedRightEyePositions[faceId]) {
    smoothedNormalizedRightEyePositions[faceId] = [
      rightEye[3].x / canvas.width,
      rightEye[3].y / canvas.height,
    ];
  }

  const leftEyeCurrentPosition = [
    leftEye[0].x / canvas.width,
    leftEye[0].y / canvas.height,
  ];
  const rightEyeCurrentPosition = [
    rightEye[3].x / canvas.width,
    rightEye[3].y / canvas.height,
  ];

  // Calculate distances
  const leftEyeDistance = Math.sqrt(
    Math.pow(
      leftEyeCurrentPosition[0] - smoothedNormalizedLeftEyePositions[faceId][0],
      2
    ) +
      Math.pow(
        leftEyeCurrentPosition[1] -
          smoothedNormalizedLeftEyePositions[faceId][1],
        2
      )
  );
  const rightEyeDistance = Math.sqrt(
    Math.pow(
      rightEyeCurrentPosition[0] -
        smoothedNormalizedRightEyePositions[faceId][0],
      2
    ) +
      Math.pow(
        rightEyeCurrentPosition[1] -
          smoothedNormalizedRightEyePositions[faceId][1],
        2
      )
  );

  // Adaptive smoothing
  const leftEyeSmoothingFactor = adaptiveSmoothingFactor(leftEyeDistance);
  const rightEyeSmoothingFactor = adaptiveSmoothingFactor(rightEyeDistance);

  // Apply smoothing
  smoothedNormalizedLeftEyePositions[faceId] = smoothPositionWithDeadbanding(
    smoothedNormalizedLeftEyePositions[faceId],
    leftEyeCurrentPosition,
    leftEyeSmoothingFactor
  );

  smoothedNormalizedRightEyePositions[faceId] = smoothPositionWithDeadbanding(
    smoothedNormalizedRightEyePositions[faceId],
    rightEyeCurrentPosition,
    rightEyeSmoothingFactor
  );
};

const updateSmoothNosePosition = (
  faceId: string,
  nose: faceapi.Point[],
  canvas: HTMLCanvasElement
) => {
  // Initialize smoothed positions
  if (!smoothedNormalizedNosePositions[faceId]) {
    smoothedNormalizedNosePositions[faceId] = [
      nose[0].x / canvas.width,
      nose[0].y / canvas.height,
    ];
  }

  const noseCurrentPosition = [
    nose[0].x / canvas.width,
    nose[0].y / canvas.height,
  ];

  // Calculate distance
  const noseDistance = Math.sqrt(
    Math.pow(
      noseCurrentPosition[0] - smoothedNormalizedNosePositions[faceId][0],
      2
    ) +
      Math.pow(
        noseCurrentPosition[1] - smoothedNormalizedNosePositions[faceId][1],
        2
      )
  );

  // Adaptive smoothing
  const noseSmoothingFactor = adaptiveSmoothingFactor(noseDistance);

  // Apply smoothing
  smoothedNormalizedNosePositions[faceId] = smoothPositionWithDeadbanding(
    smoothedNormalizedNosePositions[faceId],
    noseCurrentPosition,
    noseSmoothingFactor
  );
};

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
  faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean }
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
    if (effects.beard && uniformLocations.uBeardEffectLocation) {
      gl.uniform1i(uniformLocations.uBeardEffectLocation, 1);
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
  const nosePositions: number[][] = [];
  const chinWidths: number[] = [];

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
        updateSmoothEyePosition(faceId, leftEye, rightEye, canvas);
        updatedSmoothEyePosition = true;
      }

      leftEyePositions.push(smoothedNormalizedLeftEyePositions[faceId]);
      rightEyePositions.push(smoothedNormalizedRightEyePositions[faceId]);
    }

    // Set leftEarPositions and rightEarPositions
    if (faceLandmarks.leftEarPositions || faceLandmarks.rightEarPositions) {
      // Determines how far above the eyes the ears should be
      const shiftFactor = 2;

      // Calculate the shift distance for the ear position taking into account
      // headAngle for direction of shift and interocularDistance for scaling
      const shiftDistance = interocularDistance * shiftFactor;
      const perpendicularAngle = headAngle + Math.PI / 2;
      const shiftX = Math.cos(perpendicularAngle) * shiftDistance;
      const shiftY = Math.sin(perpendicularAngle) * shiftDistance;

      // Update smooth eye position if it hasn't already been done for this dection
      if (!updatedSmoothEyePosition) {
        updateSmoothEyePosition(faceId, leftEye, rightEye, canvas);
        updatedSmoothEyePosition = true;
      }

      leftEarPositions.push([
        smoothedNormalizedLeftEyePositions[faceId][0] - shiftX,
        smoothedNormalizedLeftEyePositions[faceId][1] - shiftY,
      ]);
      rightEarPositions.push([
        smoothedNormalizedRightEyePositions[faceId][0] - shiftX,
        smoothedNormalizedRightEyePositions[faceId][1] - shiftY,
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
      const eyesWidthSizeFactor = 700;
      const normalizedEyesWidth = interocularDistance * eyesWidthSizeFactor;

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

    // Set nose positions
    if (faceLandmarks.nosePositions) {
      // Update smooth nose position if it hasn't already been done for this dection
      if (!updatedSmoothNosePosition) {
        updateSmoothNosePosition(faceId, nose, canvas);
        updatedSmoothNosePosition = true;
      }

      nosePositions.push([
        smoothedNormalizedNosePositions[faceId][0],
        smoothedNormalizedNosePositions[faceId][1] + 0.24,
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
  });

  // Remove old face trackers
  for (const [id, tracker] of Object.entries(faceTrackers)) {
    if (!newFaceTrackers[id]) {
      tracker.lastSeen++;
      if (tracker.lastSeen > maxTrackerAge) {
        delete smoothedNormalizedLeftEyePositions[id];
        delete smoothedNormalizedRightEyePositions[id];
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
      if (effects.beard && uniformLocations.uBeardEffectLocation) {
        gl.uniform1i(uniformLocations.uBeardEffectLocation, 0);
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
      uniformLocations.uNosePositionsLocation &&
      faceLandmarks.nosePositions
    ) {
      gl.uniform2fv(
        uniformLocations.uNosePositionsLocation,
        flattenArray(nosePositions, maxFaces)
      );
    }
    if (uniformLocations.uChinWidthsLocation && faceLandmarks.chinWidths) {
      gl.uniform1fv(
        uniformLocations.uChinWidthsLocation,
        new Float32Array(chinWidths)
      );
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
