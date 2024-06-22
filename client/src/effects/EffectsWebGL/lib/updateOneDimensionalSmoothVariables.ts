import adaptiveSmoothingFactor from "./adaptiveSmoothingFactor";
import oneDimensionalSmoothWithDeadbanding from "./oneDimensionalSmoothWithDeadbanding";
import {
  smoothedOneDimensionalVariables,
  OneDimensionalVariableTypes,
} from "./updateFaceLandmarks";

const updateOneDimensionalSmoothVariables = (
  featureType: OneDimensionalVariableTypes,
  faceId: string,
  value: number
) => {
  // Initialize smoothed width if not already initialized
  if (!smoothedOneDimensionalVariables[featureType][faceId]) {
    smoothedOneDimensionalVariables[featureType][faceId] = value;
  }

  // Calculate distance (in this case, difference in width values)
  const deltaWidth = Math.abs(
    value - smoothedOneDimensionalVariables[featureType][faceId]
  );

  // Adaptive smoothing factor calculation based on deltaWidth
  const smoothingFactor = adaptiveSmoothingFactor(deltaWidth);

  // Apply smoothing with deadbanding
  smoothedOneDimensionalVariables[featureType][faceId] =
    oneDimensionalSmoothWithDeadbanding(
      featureType,
      smoothedOneDimensionalVariables[featureType][faceId],
      value,
      smoothingFactor
    );
};

export default updateOneDimensionalSmoothVariables;
