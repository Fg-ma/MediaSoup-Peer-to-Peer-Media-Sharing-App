import { oneDimensionalDeadbandingMap } from "./updateDeadbandingMaps";
import { OneDimensionalVariableTypes } from "./updateFaceLandmarks";

const oneDimensionalSmoothWithDeadbanding = (
  featureType: OneDimensionalVariableTypes,
  previousValue: number,
  currentValue: number,
  smoothingFactor: number
): number => {
  const deltaValue = currentValue - previousValue;

  if (Math.abs(deltaValue) < oneDimensionalDeadbandingMap[featureType]) {
    return previousValue;
  }

  return previousValue * smoothingFactor + currentValue * (1 - smoothingFactor);
};

export default oneDimensionalSmoothWithDeadbanding;
