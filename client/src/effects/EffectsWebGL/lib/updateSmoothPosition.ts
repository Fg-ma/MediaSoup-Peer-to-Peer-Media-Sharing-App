import * as faceapi from "face-api.js";
import { FeatureTypes, smoothedPositions } from "./updateFaceLandmarks";
import adaptiveSmoothingFactor from "./adaptiveSmoothingFactor";
import smoothPositionWithDeadbanding from "./smoothPositionWithDeadbanding";

const updateSmoothPosition = (
  featureType: FeatureTypes,
  faceId: string,
  featurePoints: faceapi.Point[],
  canvas: HTMLCanvasElement
) => {
  let currentFeaturePosition: number[];

  // Determine the current position based on feature type
  switch (featureType) {
    case "leftEye":
      currentFeaturePosition = [
        featurePoints[0].x / canvas.width,
        featurePoints[0].y / canvas.height,
      ];
      break;
    case "rightEye":
      currentFeaturePosition = [
        featurePoints[3].x / canvas.width,
        featurePoints[3].y / canvas.height,
      ];
      break;
    case "nose":
      currentFeaturePosition = [
        featurePoints[0].x / canvas.width,
        featurePoints[0].y / canvas.height,
      ];
      break;
    case "chin":
      const chinValuePosition = Math.floor(featurePoints.length / 2);
      currentFeaturePosition = [
        featurePoints[chinValuePosition].x / canvas.width,
        featurePoints[chinValuePosition].y / canvas.height,
      ];
      break;
    default:
      return;
  }

  // Initialize smoothed position if not already initialized
  if (!smoothedPositions[featureType][faceId]) {
    smoothedPositions[featureType][faceId] = currentFeaturePosition.slice();
  }

  // Calculate distance
  const distance = Math.sqrt(
    Math.pow(
      currentFeaturePosition[0] - smoothedPositions[featureType][faceId][0],
      2
    ) +
      Math.pow(
        currentFeaturePosition[1] - smoothedPositions[featureType][faceId][1],
        2
      )
  );

  // Adaptive smoothing
  const smoothingFactor = adaptiveSmoothingFactor(distance);

  // Apply smoothing
  smoothedPositions[featureType][faceId] = smoothPositionWithDeadbanding(
    smoothedPositions[featureType][faceId],
    currentFeaturePosition,
    smoothingFactor
  );
};

export default updateSmoothPosition;
