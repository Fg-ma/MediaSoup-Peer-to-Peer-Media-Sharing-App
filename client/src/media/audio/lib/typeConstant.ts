export type FgAudioElementContainerOptionsType = {
  controlsVanishTime: number;
  springDuration: number;
  noiseThreshold: number;
};

export const defaultFgAudioElementContainerOptions: FgAudioElementContainerOptionsType =
  {
    controlsVanishTime: 1250,
    springDuration: 250,
    noiseThreshold: 0.2,
  };

export interface ActivePages {
  envelopeType: {
    active: boolean;
    bellOptions: {
      active: boolean;
    };
    catenoidOptions: {
      active: boolean;
    };
    triangleOptions: {
      active: boolean;
    };
    coneOptions: {
      active: boolean;
    };
    binaryOptions: {
      active: boolean;
    };
    sawtoothOptions: {
      active: boolean;
    };
    bumpsOptions: {
      active: boolean;
    };
    chaoticOptions: {
      active: boolean;
    };
    smoothNoiseOptions: {
      active: boolean;
    };
  };
  muteStyle: {
    active: boolean;
  };
}

export type EnvelopeTypes =
  | "bell"
  | "catenoid"
  | "triangle"
  | "cone"
  | "binary"
  | "sawtooth"
  | "bumps"
  | "chaotic"
  | "smoothNoise"
  | "mixGaussian";

export type EnvelopeOptionTypes =
  | "bellOptions"
  | "catenoidOptions"
  | "triangleOptions"
  | "coneOptions"
  | "binaryOptions"
  | "sawtoothOptions"
  | "bumpsOptions"
  | "chaoticOptions"
  | "smoothNoiseOptions";

export type MuteStyleTypes = "smile" | "morse";

export interface Settings {
  numFixedPoints: {
    value: number;
  };
  envelopeType: {
    value: EnvelopeTypes;
    mixGausianEnvelope: {
      value: { amplitude: number; mean: number; stdDev: number }[];
    };
    bellOptions: {
      amplitude: { value: number };
      mean: { value: number };
      stdDev: { value: number };
    };
    catenoidOptions: {
      startAmplitude: { value: number };
      endAmplitude: { value: number };
      decayRate: { value: number };
    };
    triangleOptions: {
      amplitude: { value: number };
    };
    coneOptions: {
      amplitude: { value: number };
      steepness: { value: number };
    };
    binaryOptions: {
      amplitude: { value: number };
    };
    sawtoothOptions: {
      amplitude: { value: number };
      frequency: { value: number };
    };
    bumpsOptions: {
      amplitude: { value: number };
      frequency: { value: number };
    };
    chaoticOptions: {
      amplitude: { value: number };
    };
    smoothNoiseOptions: {
      amplitude: { value: number };
    };
  };
  muteStyle: {
    value: MuteStyleTypes;
  };
  color: {
    value: string;
  };
  shadowColor: { value: string };
  volumeHandleColor: { value: string };
  primaryMuteColor: { value: string };
  secondaryMuteColor: { value: string };
}

export const defaultSettings: Settings = Object.freeze({
  numFixedPoints: Object.freeze({
    value: 14,
  }),
  envelopeType: Object.freeze({
    value: "bell",
    mixGausianEnvelope: Object.freeze({
      value: [],
    }),
    bellOptions: Object.freeze({
      amplitude: Object.freeze({ value: 1 }),
      mean: Object.freeze({ value: 0.5 }),
      stdDev: Object.freeze({ value: 0.4 }),
    }),
    catenoidOptions: Object.freeze({
      startAmplitude: Object.freeze({ value: 1 }),
      endAmplitude: Object.freeze({ value: 0 }),
      decayRate: Object.freeze({ value: 4 }),
    }),
    triangleOptions: Object.freeze({
      amplitude: Object.freeze({ value: 1 }),
    }),
    coneOptions: Object.freeze({
      amplitude: Object.freeze({ value: 1 }),
      steepness: Object.freeze({ value: 0.5 }),
    }),
    binaryOptions: Object.freeze({
      amplitude: Object.freeze({ value: 1 }),
    }),
    sawtoothOptions: Object.freeze({
      amplitude: Object.freeze({ value: 1 }),
      frequency: Object.freeze({ value: 4 }),
    }),
    bumpsOptions: Object.freeze({
      amplitude: Object.freeze({ value: 1 }),
      frequency: Object.freeze({ value: 4 }),
    }),
    chaoticOptions: Object.freeze({
      amplitude: Object.freeze({ value: 1 }),
    }),
    smoothNoiseOptions: Object.freeze({
      amplitude: Object.freeze({ value: 1 }),
    }),
  }),
  muteStyle: Object.freeze({
    value: "smile",
  }),
  color: Object.freeze({
    value: "#f2f2f2",
  }),
  shadowColor: Object.freeze({ value: "#090909" }),
  volumeHandleColor: Object.freeze({ value: "#d40213" }),
  primaryMuteColor: Object.freeze({ value: "#d40213" }),
  secondaryMuteColor: Object.freeze({ value: "#f2f2f2" }),
});

export const defaultActiveSettingsPages: ActivePages = {
  envelopeType: {
    active: false,
    bellOptions: {
      active: false,
    },
    catenoidOptions: {
      active: false,
    },
    triangleOptions: {
      active: false,
    },
    coneOptions: {
      active: false,
    },
    binaryOptions: {
      active: false,
    },
    sawtoothOptions: {
      active: false,
    },
    bumpsOptions: {
      active: false,
    },
    chaoticOptions: {
      active: false,
    },
    smoothNoiseOptions: {
      active: false,
    },
  },
  muteStyle: {
    active: false,
  },
};

export const envelopeTypesTitles: {
  [envelopeType in EnvelopeTypes]: string;
} = {
  bell: "Bell",
  catenoid: "Catenoid",
  triangle: "Triangle",
  cone: "Cone",
  binary: "Binary",
  sawtooth: "Sawtooth",
  bumps: "Bumps",
  chaotic: "Chaotic",
  smoothNoise: "Smooth noise",
  mixGaussian: "Mix gaussian",
};

export const muteStyleTitles: {
  [muteStyleType in MuteStyleTypes]: string;
} = {
  smile: "Smile",
  morse: "Morse code",
};

export type ColorSettingsTypes =
  | "color"
  | "shadowColor"
  | "volumeHandleColor"
  | "primaryMuteColor"
  | "secondaryMuteColor";

export const colorSettingsTitles: {
  [colorSettingsType in ColorSettingsTypes]: string;
} = {
  color: "Color",
  shadowColor: "Shadow",
  volumeHandleColor: "Volume handle",
  primaryMuteColor: "Primary mute",
  secondaryMuteColor: "Secondary mute",
};

export const envelopeTypesSliderOptions: {
  [envelopeOptionType in EnvelopeOptionTypes]: {
    [option: string]: {
      ticks: number;
      rangeMax: number;
      rangeMin: number;
      precision: number;
      topLabel: string;
    };
  };
} = {
  bellOptions: {
    amplitude: {
      ticks: 6,
      rangeMax: 1,
      rangeMin: 0,
      precision: 2,
      topLabel: "Amplitude",
    },
    mean: {
      ticks: 6,
      rangeMax: 1,
      rangeMin: 0,
      precision: 2,
      topLabel: "Mean",
    },
    stdDev: {
      ticks: 6,
      rangeMax: 1,
      rangeMin: 0,
      precision: 2,
      topLabel: "Standard deviation",
    },
  },
  catenoidOptions: {
    startAmplitude: {
      ticks: 6,
      rangeMax: 1,
      rangeMin: 0,
      precision: 2,
      topLabel: "Initial amplitude",
    },
    endAmplitude: {
      ticks: 6,
      rangeMax: 1,
      rangeMin: 0,
      precision: 2,
      topLabel: "Final amplitude",
    },
    decayRate: {
      ticks: 5,
      rangeMax: 10,
      rangeMin: 2,
      precision: 1,
      topLabel: "Decay rate",
    },
  },
  triangleOptions: {
    amplitude: {
      ticks: 6,
      rangeMax: 1,
      rangeMin: 0,
      precision: 2,
      topLabel: "Amplitude",
    },
  },
  coneOptions: {
    amplitude: {
      ticks: 6,
      rangeMax: 1,
      rangeMin: 0,
      precision: 2,
      topLabel: "Amplitude",
    },
    steepness: {
      ticks: 5,
      rangeMax: 10,
      rangeMin: 0,
      precision: 1,
      topLabel: "Steepness",
    },
  },
  binaryOptions: {
    amplitude: {
      ticks: 6,
      rangeMax: 1,
      rangeMin: 0,
      precision: 2,
      topLabel: "Amplitude",
    },
  },
  sawtoothOptions: {
    amplitude: {
      ticks: 6,
      rangeMax: 1,
      rangeMin: 0,
      precision: 2,
      topLabel: "Amplitude",
    },
    frequency: {
      ticks: 6,
      rangeMax: 10,
      rangeMin: 0,
      precision: 1,
      topLabel: "Frequency",
    },
  },
  bumpsOptions: {
    amplitude: {
      ticks: 6,
      rangeMax: 1,
      rangeMin: 0,
      precision: 2,
      topLabel: "Amplitude",
    },
    frequency: {
      ticks: 6,
      rangeMax: 10,
      rangeMin: 0,
      precision: 1,
      topLabel: "Frequency",
    },
  },
  chaoticOptions: {
    amplitude: {
      ticks: 6,
      rangeMax: 1,
      rangeMin: 0,
      precision: 2,
      topLabel: "Amplitude",
    },
  },
  smoothNoiseOptions: {
    amplitude: {
      ticks: 6,
      rangeMax: 1,
      rangeMin: 0,
      precision: 2,
      topLabel: "Amplitude",
    },
  },
};
