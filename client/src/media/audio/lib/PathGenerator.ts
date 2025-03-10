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

      // path.push(
      //   "M 85.02016,50.020163 H 54.04015 C 59.159433,45.800853 69.236167,34.510612 71.028623,31.42689 74.613535,25.259449 73.007668,19.715727 71.891969,17.799221 70.776272,15.882714 67.83049,11.558596 60.931844,11.385648 54.0332,11.212703 49.980553,18.095781 49.980553,18.095781 M 14.97984,50.017793 H 45.905108 C 40.785827,45.798482 30.709092,34.508242 28.916635,31.424522 25.331722,25.257081 26.937592,19.713358 28.053289,17.796851 c 1.115698,-1.916507 4.061481,-6.240625 10.960125,-6.413572 6.898643,-0.172942 10.951293,6.71013 10.951293,6.71013"
      // );
      // path.push(
      //   "h 17.390146 c 0,-6.063758 0.0437,-20.66485 0.0437,-25.761898 8.95174,-8.763971 9.084837,-9.288659 12.540048,-12.578464 2.702903,-2.4416739 2.626448,0.105733 1.909464,3.758819 -0.716974,3.653085 -0.196043,0.608656 -1.996394,9.540718 5.205782,0 17.26349,-0.08237 22.699206,-0.125974 0,1.795216 -3.3e-5,3.130836 -3.3e-5,4.97162 -5.133746,11.696811 -4.933527,11.156076 -8.765372,20.195179 h 26.174492"
      // );
      // path.push(
      //   "m 70,0 -31.550128,0.0027 V 36.81193 c 4.791565,-2.786094 4.851499,-3.092086 7.10572,-7.145654 4.558726,-1.291275 6.398454,-1.731574 8.907984,-5.229231 1.64117,-2.287377 1.839107,-5.807437 1.683115,-8.228271 -0.101953,-1.582066 -0.544793,-1.961203 -1.927527,-2.580538 h -7.400029 c -2.138558,-1.482039 0.293029,-5.1157351 -3.381481,-5.2079961 -2.283322,0 -5.332653,-0.01098 -8.458329,-0.02239 -3.125669,0.01142 -6.175008,0.02239 -8.458322,0.02239 -3.674511,0.09225 -1.242923,3.7259571 -3.381488,5.2079961 h -7.400022 c -1.382734,0.619335 -1.82558,0.998472 -1.927526,2.580538 -0.155999,2.420834 0.04193,5.940894 1.683108,8.228271 2.50953,3.497657 4.349264,3.937956 8.90799,5.229231 2.25422,4.053568 2.314154,4.35956 7.105713,7.145654 V 50.011412 H 14.997851"
      // );
      // path.push(
      //   "c 6.1126,0 11.789987,0 11.789987,0 l 0.0099,-38.808208 H 14.995904 85.004125 72.897131 l -0.0079,38.808208 h 12.114866"
      // );
      // path.push(
      //   "M 37.666124,50.003006 H 14.94569 45.908941 c -3.570334,-2.032975 -5.219701,-5.147308 -5.013625,-9.130836 0.206073,-3.983524 3.980261,-7.841724 8.231224,-7.954381 4.250965,-0.112661 8.003109,1.578931 9.777601,7.226619 0,-7.746578 -0.09143,-26.068092 -0.09143,-32.347413 h 11.692447 v 6.800558 H 58.812699 c 0,5.453923 0.09143,24.40353 0.09143,26.988066 -0.362273,4.061492 -1.160938,5.58358 -4.892502,8.417387 h 30.924581"
      // );
      // path.push(
      //   "c 0,0 20.307218,0.09885 29.772127,0.09885 -3.68393,0.106027 -6.986389,-1.968148 -8.11849,-5.616227 -1.651245,-5.10107 2.738245,-7.892286 4.442177,-9.846861 1.703931,-1.954575 1.777227,-2.131913 1.637197,-2.448079 -3.554889,-4.885379 -6.947268,-13.094564 -6.35436,-20.136291 0.166664,-2.6386345 1.108352,-3.7365455 3.058523,-3.1951229 1.950168,0.5414305 4.27135,2.4771849 6.733056,7.4883109 2.461708,5.011129 3.888994,13.093202 3.888994,13.093202 0,0 1.427287,-8.079889 3.888992,-13.091027 2.461707,-5.011127 4.782888,-6.946871 6.733058,-7.4883016 1.950169,-0.5414315 2.891857,0.5564895 3.058522,3.1951226 0.592908,7.041718 -2.799472,15.250912 -6.354361,20.136284 -0.09278,0.209491 -0.09192,0.358024 0.414876,1.002952 0.0448,0.05698 0.09356,0.117917 0.146555,0.183069 0.252285,0.310191 0.600631,0.717034 1.075767,1.262057 1.703932,1.954574 6.093422,4.745799 4.442176,9.84687 -1.132101,3.648079 -4.434559,5.722246 -8.118489,5.616226 9.464909,0 29.739778,-0.09885 29.739778,-0.09885"
      // );
      // path.push(
      //   "M 14.486591,50.003019 H 49.48943 V 30.134048 C 42.538748,30.545101 37.471852,28.480775 33.668522,23.931002 31.778531,21.670079 30.252603,18.635653 29.874179,15.984291 29.522281,13.518768 29.434713,13.18123 29.375975,9.9969784 35.11167,10.04861 39.549088,10.993007 43.35631,14.393395 c 1.898965,1.696037 4.379501,4.55208 5.50286,8.508535 1.128857,3.97582 0.895252,9.055484 0.63026,12.152016 0.335052,-4.94771 1.724798,-7.717596 3.031139,-9.622271 1.696355,-2.473331 2.912084,-3.586366 4.695069,-4.821404 4.537043,-3.142704 7.841699,-3.206764 12.236177,-3.060176 0.233547,4.843002 -0.483784,9.937693 -4.533157,14.328422 -4.049378,4.390722 -8.381133,5.790062 -15.429229,5.741726 l -0.01127,12.382776 h 35.014472"
      // );
      // next
      // path.push(
      //   "M 15.003504,49.996495 H 28.646775 C 28.464031,42.308121 28.555925,40.450933 34.938638,37.892141 41.32135,35.33334 46.459118,34.892707 50,34.892327 c 3.540883,-3.8e-4 8.67865,0.439823 15.061363,2.998624 6.382713,2.558802 6.474606,4.41597 6.291862,12.104364 h 13.643271"
      // );
      // path.push(
      //   "M 50,26 c -5.578148,0 -8.802006,-4.442979 -8.901908,-9.312341 -0.0999,-4.869343 3.862065,-8.9402764 8.901908,-8.9402764 5.039844,0 9.288936,3.6738084 9.288936,8.9402764 0,5.266477 -3.710787,9.312341 -9.288936,9.312341 z"
      // );
      // next
      // path.push(
      //   "h 29.045506 c 4.543298,-6.013598 3.700102,-4.868464 5.79049,-7.707759 h -6.791428 c 0.0354,-3.776581 1.103239,-6.954765 1.774948,-9.006954 0.671712,-2.052188 1.256826,-4.031861 3.015564,-7.627047 1.758739,-3.595194 3.438988,-5.797696 5.064668,-6.534134 1.62568,-0.736437 2.073745,0.378332 2.761157,1.672606 0.68741,1.294283 4.057284,7.358234 7.504418,8.872858 1.667946,0.963644 1.514756,2.083498 1.514756,3.732982 0,-2.5129 -0.506419,-4.702365 2.06407,-4.702365 2.570489,0 2.001274,2.585399 2.001274,8.943617 0,6.358225 0.12334,9.753421 0.12334,12.217109 0,-4.368043 -0.136173,-10.108032 -0.136173,-12.245868 0,-2.137828 0.508095,-8.926392 -2.013059,-8.926392 -2.521155,0 -0.390854,1.760276 -2.333599,1.728462 -4.022973,-2.225719 -5.611026,-3.782689 -8.951574,-10.089593 -2.336641,9.088507 -0.871146,3.998875 -2.53961,11.567184 1.385496,3.768197 1.355215,3.794579 2.165053,6.244772 0.85015,2.572158 1.088204,3.175893 2.175438,5.946019 0,3.13223 -0.0028,2.087883 -0.0028,5.730077 H 85.63897"
      // );
      // path.push(
      //   "M 56,12 c 0,1.044559 1.026927,1.905669 2.119812,1.905669 1.092885,0 2.111496,-0.931428 2.111496,-2.054613 0,-1.123184 -0.552263,-2.165681 -2.097963,-2.165681 -0.295347,0 -1.371708,0.180394 -2.036974,-0.1604937 -0.715203,-0.366467 -0.999834,-1.2738918 -1.262592,-1.0783021 -0.198876,0.1480382 0.884987,0.71781 1.074858,1.2242308 0.33883,0.903732 0.09136,1.925186 0.09136,2.32919 z"
      // );
      // next
      // path.push(
      //   "M 15.141989,49.988668 H 30.848836 L 27.35428,28.290258 38.60515,33.284124 50.130656,17.59722 61.656162,33.283763 72.907032,28.289896 69.412476,49.988305 h 15.706847"
      // );
      // next
      path.push(
        "h 30.419555 c -4.704212,-1.573992 -8.902261,-6.256798 -8.902261,-12.990478 0,-6.73368 6.351205,-12.73154 12.96409,-12.73154 1.177807,0 0.550642,0.0528 2.134838,-0.0387 1.620664,-2.728345 1.158329,-2.25774 2.531533,-4.280285 0.77629,0.465789 2.011334,1.218847 3.921853,2.327264 1.824914,-2.708885 1.87197,-3.207967 3.748938,-3.940856 1.876968,-0.732888 3.28232,0.342576 5.117534,1.335371 -1.101217,-0.606248 -3.537362,-2.111307 -5.153529,-1.33122 -1.616167,0.780087 -2.146268,1.337637 -3.712308,3.942199 1.714183,0.909675 4.657076,2.734815 4.776859,2.817388 -1.180546,2.074374 -1.066212,2.018254 -2.467673,4.263292 1.536956,2.740331 2.675349,3.496579 2.675349,9.240448 0,5.743869 -4.255367,8.975616 -8.445146,11.387115 h 30.427374"
      );
      // next
      path.push("M 84,50");
    }
    path.push(`Q 88 ${rightHandlePosition.y} 92 50`);

    return path.join(" ");
  };
}

export default PathGenerator;
