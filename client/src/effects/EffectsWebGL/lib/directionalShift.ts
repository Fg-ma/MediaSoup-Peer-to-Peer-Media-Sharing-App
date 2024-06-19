const directionalShift = (shiftDistance: number, headAngle: number) => {
  const perpendicularAngle = headAngle + Math.PI / 2;
  const shiftX = Math.cos(perpendicularAngle) * shiftDistance;
  const shiftY = Math.sin(perpendicularAngle) * shiftDistance;
  return { shiftX, shiftY };
};

export default directionalShift;
