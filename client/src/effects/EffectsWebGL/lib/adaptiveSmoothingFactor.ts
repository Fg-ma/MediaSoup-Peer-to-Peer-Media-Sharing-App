const adaptiveSmoothingFactor = (distance: number) => {
  const minFactor = 0.4;
  const maxFactor = 0.75;
  const threshold = 0.08;

  if (distance < threshold) {
    return maxFactor;
  } else {
    return minFactor;
  }
};

export default adaptiveSmoothingFactor;
