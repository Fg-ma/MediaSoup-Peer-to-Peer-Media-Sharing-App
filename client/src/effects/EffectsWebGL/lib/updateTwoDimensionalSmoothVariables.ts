import * as faceapi from "face-api.js";
import {
  TwoDimensionalVariableTypes,
  smoothedTwoDimensionalVariables,
} from "./updateFaceLandmarks";
import adaptiveSmoothingFactor from "./adaptiveSmoothingFactor";
import twoDimensionalSmoothWithDeadbanding from "./twoDimensionalSmoothWithDeadbanding";

const updateTwoDimensionalSmoothVariables = (
  featureType: TwoDimensionalVariableTypes,
  faceId: string,
  featurePoints: faceapi.Point[],
  canvas: HTMLCanvasElement
) => {
  let currentFeatureValue: number[];

  // Determine the current value based on feature type
  switch (featureType) {
    case "eyesCenterPosition":
      currentFeatureValue = [
        featurePoints[0].x / canvas.width,
        featurePoints[0].y / canvas.height,
      ];
      break;
    case "leftEyePosition":
      currentFeatureValue = [
        featurePoints[0].x / canvas.width,
        featurePoints[0].y / canvas.height,
      ];
      break;
    case "rightEyePosition":
      currentFeatureValue = [
        featurePoints[3].x / canvas.width,
        featurePoints[3].y / canvas.height,
      ];
      break;
    case "nosePosition":
      currentFeatureValue = [
        featurePoints[0].x / canvas.width,
        featurePoints[0].y / canvas.height,
      ];
      break;
    case "chinPosition":
      const chinValuePosition = Math.floor(featurePoints.length / 2);
      currentFeatureValue = [
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
      currentFeatureValue.slice();
  }

  // Calculate distance
  const distance = Math.sqrt(
    Math.pow(
      currentFeatureValue[0] -
        smoothedTwoDimensionalVariables[featureType][faceId][0],
      2
    ) +
      Math.pow(
        currentFeatureValue[1] -
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
      currentFeatureValue,
      smoothingFactor
    );
};

export default updateTwoDimensionalSmoothVariables;
