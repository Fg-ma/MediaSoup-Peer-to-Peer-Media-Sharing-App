import { TableColors } from "../../../serverControllers/tableServer/lib/typeConstant";

export type FgAudioElementContainerOptionsType = {
  controlsVanishTime: number;
  springDuration: number;
  noiseThreshold: number;
  numFixedPoints: number;
  bellCurveAmplitude: number;
  bellCurveMean: number;
  bellCurveStdDev: number;
  shadowColor: TableColors;
  volumeColor: TableColors;
  primaryMuteColor: TableColors;
  secondaryMuteColor: TableColors;
  muteStyleOption: "morse" | "smile";
};

export const defaultFgAudioElementContainerOptions: FgAudioElementContainerOptionsType =
  {
    controlsVanishTime: 1250,
    springDuration: 250,
    noiseThreshold: 0.2,
    numFixedPoints: 14,
    bellCurveAmplitude: 1,
    bellCurveMean: 0.5,
    bellCurveStdDev: 0.4,
    shadowColor: "black",
    volumeColor: "tableTop",
    primaryMuteColor: "tableTop",
    secondaryMuteColor: "black",
    muteStyleOption: "smile",
  };

export interface ActivePages {
  envelopeType: {
    active: boolean;
  };
}

export type EnvelopeTypes =
  | "bell"
  | "catenoid"
  | "triangle"
  | "cone"
  | "mixGaussian";

export interface Settings {
  envelopeType: {
    value: EnvelopeTypes;
    mixGausianEnvelope: {
      value: { amplitude: number; mean: number; stdDev: number }[];
    };
  };
}

export const defaultSettings: Settings = Object.freeze({
  envelopeType: Object.freeze({
    value: "bell",
    mixGausianEnvelope: Object.freeze({
      value: [],
    }),
  }),
});

export const defaultActiveSettingsPages: ActivePages = {
  envelopeType: {
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
  mixGaussian: "Mix gaussian",
};
