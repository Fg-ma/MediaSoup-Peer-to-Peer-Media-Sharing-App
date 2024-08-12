class PathGenerator {
  constructor() {}

  // Envelope bell curve
  generateBellCurve(
    numPoints: number,
    amplitude: number,
    mean: number,
    stdDev: number
  ) {
    const yCoordinates = [];
    const step = 1 / (numPoints - 1);

    for (let i = 0; i < numPoints; i++) {
      const x = i * step;
      const exponent = -Math.pow((x - mean) / stdDev, 2) / 2;
      const y = amplitude * Math.exp(exponent);
      yCoordinates.push(y);
    }

    return yCoordinates;
  }

  // Envelope Sine curve
  generateSineWave(
    numPoints: number,
    amplitude: number,
    frequency: number,
    phase: number
  ) {
    const yCoordinates = [];
    const step = Math.PI / (numPoints - 1);

    for (let i = 0; i < numPoints; i++) {
      const x = i * step;
      const y = amplitude * Math.sin(frequency * x + phase);
      yCoordinates.push(y);
    }

    return yCoordinates;
  }

  // Generate the path data using the fixed and moving points
  generatePathData = (
    ySprings: number[],
    muteStyleOption: "morse" | "smile",
    fixedPointsX: React.MutableRefObject<number[]>,
    localMute: React.MutableRefObject<boolean>,
    clientMute: React.MutableRefObject<boolean>,
    leftHandlePosition: {
      x: number;
      y: number;
    },
    rightHandlePosition: {
      x: number;
      y: number;
    }
  ) => {
    const path = [`M8 50`];
    path.push(`Q 12 ${leftHandlePosition.y} 16 50`);
    if (
      (!localMute.current && !clientMute.current) ||
      muteStyleOption !== "smile"
    ) {
      for (let i = 1; i < fixedPointsX.current.length; i++) {
        const xMid =
          fixedPointsX.current[i - 1] +
          (fixedPointsX.current[i] - fixedPointsX.current[i - 1]) / 2;
        path.push(`Q${xMid} ${ySprings[i - 1]}, ${fixedPointsX.current[i]} 50`);
      }
    } else if (muteStyleOption === "smile") {
      for (let i = 1; i < fixedPointsX.current.length; i++) {
        const xMid =
          fixedPointsX.current[i - 1] +
          (fixedPointsX.current[i] - fixedPointsX.current[i - 1]) / 2;
        path.push(
          `Q${xMid} ${ySprings[i - 1]}, ${fixedPointsX.current[i]} ${
            ySprings[fixedPointsX.current.length + i - 2]
          }`
        );
      }
    }
    path.push(`Q 88 ${rightHandlePosition.y} 92 50`);

    return path.join(" ");
  };
}

export default PathGenerator;
