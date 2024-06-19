const deadbandingThreshold = 0.025;

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

export default smoothPositionWithDeadbanding;
