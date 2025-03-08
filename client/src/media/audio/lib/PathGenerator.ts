class PathGenerator {
  constructor() {}

  generateBellCurve = (
    numPoints: number,
    amplitude: number,
    mean: number,
    stdDev: number
  ) => {
    const yCoordinates = [];
    const step = 1 / (numPoints - 1);

    for (let i = 0; i < numPoints; i++) {
      const x = i * step;
      const exponent = -Math.pow((x - mean) / stdDev, 2) / 2;
      const y = amplitude * Math.exp(exponent);
      yCoordinates.push(y);
    }

    return yCoordinates;
  };

  generateSineWave = (
    numPoints: number,
    amplitude: number,
    frequency: number,
    phase: number
  ) => {
    const yCoordinates = [];
    const step = Math.PI / (numPoints - 1);

    for (let i = 0; i < numPoints; i++) {
      const x = i * step;
      const y = amplitude * Math.sin(frequency * x + phase);
      yCoordinates.push(y);
    }

    return yCoordinates;
  };

  generateSymmetricExponentialDecay = (
    numPoints: number,
    startAmplitude: number, // Peak amplitude (e.g., 0.9)
    endAmplitude: number, // Final amplitude (e.g., 0.1)
    decayRate: number
  ) => {
    const yCoordinates = [];

    for (let i = 0; i < numPoints; i++) {
      const x = i / (numPoints - 1); // Normalize from 0 to 1

      // Standard exponential decay
      const decay = Math.exp(-decayRate * x);

      // Mirrored exponential decay
      const mirroredDecay = Math.exp(-decayRate * (1 - x));

      // Combine both (scale to range)
      const y =
        endAmplitude +
        (startAmplitude - endAmplitude) * (decay + mirroredDecay);

      yCoordinates.push(y);
    }

    return yCoordinates;
  };

  generateSigmoid = (
    numPoints: number,
    amplitude: number,
    steepness: number
  ) => {
    const yCoordinates = [];

    for (let i = 0; i < numPoints; i++) {
      const x = (i - numPoints / 2) / (numPoints / 10);
      const y = amplitude / (1 + Math.exp(-steepness * x));
      yCoordinates.push(y);
    }

    return yCoordinates;
  };

  generateTriangle = (numPoints: number, amplitude: number) => {
    const yCoordinates = [];

    for (let i = 0; i < numPoints; i++) {
      const x = i / (numPoints - 1);
      const y = x < 0.5 ? 2 * amplitude * x : 2 * amplitude * (1 - x);
      yCoordinates.push(y);
    }

    return yCoordinates;
  };

  generateGaussianMixture = (
    numPoints: number,
    mixtures: { amplitude: number; mean: number; stdDev: number }[]
  ) => {
    const yCoordinates = [];
    const step = 1 / (numPoints - 1);

    for (let i = 0; i < numPoints; i++) {
      const x = i * step;
      let y = 0;

      // Sum contributions from all Gaussian mixtures
      for (const { amplitude, mean, stdDev } of mixtures) {
        const exponent = -Math.pow((x - mean) / stdDev, 2) / 2;
        y += amplitude * Math.exp(exponent);
      }

      yCoordinates.push(y);
    }

    return yCoordinates;
  };

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
