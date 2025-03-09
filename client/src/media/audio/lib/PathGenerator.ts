class PathGenerator {
  constructor() {}

  // Bell
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

  // Catenoid
  generateSymmetricExponentialDecay = (
    numPoints: number,
    startAmplitude: number,
    endAmplitude: number,
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

  // Cone
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

  // Triangle
  generateTriangle = (numPoints: number, amplitude: number) => {
    const yCoordinates = [];

    for (let i = 0; i < numPoints; i++) {
      const x = i / (numPoints - 1);
      const y = x < 0.5 ? 2 * amplitude * x : 2 * amplitude * (1 - x);
      yCoordinates.push(y);
    }

    return yCoordinates;
  };

  // Gaussian mixture
  generateGaussianMixture = (
    numPoints: number,
    mixtures: { amplitude: number; mean: number; stdDev: number }[]
  ) => {
    const yCoordinates = [];
    const step = 1 / (numPoints - 1);

    let maxY = 0;

    // Generate raw values
    for (let i = 0; i < numPoints; i++) {
      const x = i * step;
      let y = 0;

      for (const { amplitude, mean, stdDev } of mixtures) {
        const exponent = -Math.pow((x - mean) / stdDev, 2) / 2;
        y += amplitude * Math.exp(exponent);
      }

      yCoordinates.push(y);
      if (y > maxY) maxY = y;
    }

    // Normalize to ensure max value is 1
    return yCoordinates.map((y) => y / maxY);
  };

  // Soft noise
  generateBrownianNoise = (numPoints: number, amplitude: number) => {
    const yCoordinates = [];
    let value = 0;

    for (let i = 0; i < numPoints; i++) {
      const randomStep = (Math.random() - 0.5) * amplitude;
      value += randomStep;
      yCoordinates.push(value);
    }

    // Normalize to max amplitude
    const max = Math.max(...yCoordinates.map(Math.abs));
    return yCoordinates.map((y) => (y / max) * amplitude);
  };

  // Sawtooth
  generateSawtoothWave = (
    numPoints: number,
    amplitude: number,
    frequency: number
  ) => {
    const yCoordinates = [];
    const step = 1 / (numPoints - 1);

    for (let i = 0; i < numPoints; i++) {
      const x = i * step;
      const y =
        amplitude * (2 * (x * frequency - Math.floor(x * frequency + 0.5)));
      yCoordinates.push(y);
    }

    return yCoordinates;
  };

  // Chaotic
  generateLogisticMap = (numPoints: number, amplitude: number) => {
    const yCoordinates = [];
    let x = Math.random();

    for (let i = 0; i < numPoints; i++) {
      x = 3.7 * x * (1 - x);
      yCoordinates.push((x - 0.5) * amplitude * 2);
    }

    return yCoordinates;
  };

  // Bumps
  generateHalfSineWave = (
    numPoints: number,
    amplitude: number,
    frequency: number
  ) => {
    const yCoordinates = [];
    const step = Math.PI / (numPoints - 1);

    for (let i = 0; i < numPoints; i++) {
      const x = i * step;
      const y = Math.abs(Math.sin(frequency * x)) * amplitude;
      yCoordinates.push(y);
    }

    return yCoordinates;
  };

  // Binary
  generateBinaryNoise = (numPoints: number, amplitude: number) => {
    const yCoordinates = [];

    for (let i = 0; i < numPoints; i++) {
      const y = Math.random() > 0.5 ? amplitude : -amplitude;
      yCoordinates.push(y);
    }

    return yCoordinates;
  };

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
      muteStyleOption === "morse"
    ) {
      for (let i = 1; i < fixedPointsX.current.length; i++) {
        const xMid =
          fixedPointsX.current[i - 1] +
          (fixedPointsX.current[i] - fixedPointsX.current[i - 1]) / 2;
        path.push(`Q${xMid} ${ySprings[i - 1]}, ${fixedPointsX.current[i]} 50`);
      }
    } else if (muteStyleOption === "smile") {
      // for (let i = 1; i < fixedPointsX.current.length; i++) {
      //   const xMid =
      //     fixedPointsX.current[i - 1] +
      //     (fixedPointsX.current[i] - fixedPointsX.current[i - 1]) / 2;
      //   path.push(
      //     `Q${xMid} ${ySprings[i - 1]}, ${fixedPointsX.current[i]} ${
      //       ySprings[fixedPointsX.current.length + i - 2]
      //     }`
      //   );
      // }
      path.push(
        "M 85.02016,50.020163 H 54.04015 C 59.159433,45.800853 69.236167,34.510612 71.028623,31.42689 74.613535,25.259449 73.007668,19.715727 71.891969,17.799221 70.776272,15.882714 67.83049,11.558596 60.931844,11.385648 54.0332,11.212703 49.980553,18.095781 49.980553,18.095781 M 14.97984,50.017793 H 45.905108 C 40.785827,45.798482 30.709092,34.508242 28.916635,31.424522 25.331722,25.257081 26.937592,19.713358 28.053289,17.796851 c 1.115698,-1.916507 4.061481,-6.240625 10.960125,-6.413572 6.898643,-0.172942 10.951293,6.71013 10.951293,6.71013"
      );
      path.push("M 84,50");
    }
    path.push(`Q 88 ${rightHandlePosition.y} 92 50`);

    return path.join(" ");
  };
}

export default PathGenerator;
