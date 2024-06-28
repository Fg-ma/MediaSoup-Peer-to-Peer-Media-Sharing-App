import {
  TwoDimensionalVariableTypes,
  smoothedTwoDimensionalVariables,
} from "./updateFaceLandmarks";
import adaptiveSmoothingFactor from "./adaptiveSmoothingFactor";
import twoDimensionalSmoothWithDeadbanding from "./twoDimensionalSmoothWithDeadbanding";

const updateTwoDimensionalSmoothVariables = (
  featureType: TwoDimensionalVariableTypes,
  faceId: string,
  currentFeatureValue: number[]
) => {
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
