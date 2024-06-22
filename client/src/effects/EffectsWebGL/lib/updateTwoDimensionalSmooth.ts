import * as faceapi from "face-api.js";
import {
  TwoDimensionalVariableTypes,
  smoothedTwoDimensionalVariables,
} from "./updateFaceLandmarks";
import adaptiveSmoothingFactor from "./adaptiveSmoothingFactor";
import twoDimensionalSmoothWithDeadbanding from "./twoDimensionalSmoothWithDeadbanding";

const updateTwoDimensionalSmooth = (
  featureType: TwoDimensionalVariableTypes,
  faceId: string,
  featurePoints: faceapi.Point[],
  canvas: HTMLCanvasElement
) => {
  let currentFeaturePosition: number[];

  // Determine the current position based on feature type
  switch (featureType) {
    case "eyesCenterPosition":
      currentFeaturePosition = [
        featurePoints[0].x / canvas.width,
        featurePoints[0].y / canvas.height,
      ];
      break;
    case "leftEyePosition":
      currentFeaturePosition = [
        featurePoints[0].x / canvas.width,
        featurePoints[0].y / canvas.height,
      ];
      break;
    case "rightEyePosition":
      currentFeaturePosition = [
        featurePoints[3].x / canvas.width,
        featurePoints[3].y / canvas.height,
      ];
      break;
    case "nosePosition":
      currentFeaturePosition = [
        featurePoints[0].x / canvas.width,
        featurePoints[0].y / canvas.height,
      ];
      break;
    case "chinPosition":
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
  if (!smoothedTwoDimensionalVariables[featureType][faceId]) {
    smoothedTwoDimensionalVariables[featureType][faceId] =
      currentFeaturePosition.slice();
  }

  // Calculate distance
  const distance = Math.sqrt(
    Math.pow(
      currentFeaturePosition[0] -
        smoothedTwoDimensionalVariables[featureType][faceId][0],
      2
    ) +
      Math.pow(
        currentFeaturePosition[1] -
          smoothedTwoDimensionalVariables[featureType][faceId][1],
        2
      )
  );

  // Adaptive smoothing
  const smoothingFactor = adaptiveSmoothingFactor(distance);

  // Apply smoothing
  smoothedTwoDimensionalVariables[featureType][faceId] =
    twoDimensionalSmoothWithDeadbanding(
      featureType,
      smoothedTwoDimensionalVariables[featureType][faceId],
      currentFeaturePosition,
      smoothingFactor
    );
};

export default updateTwoDimensionalSmooth;
