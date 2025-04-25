export const defaultInputOptions = {
  submitButton: true,
  autoFocus: false,
  autocomplete: "on",
  padding: 0.5,
  centerText: false,
  backgroundColor: "#f2f2f2",
  noSpinner: true,
  min: undefined,
  max: undefined,
  step: undefined,
};

export type InputOptionsType = {
  submitButton?: boolean;
  autoFocus?: boolean;
  autocomplete?: "off" | "on";
  padding?: number;
  centerText?: boolean;
  backgroundColor?: string;
  noSpinner?: boolean;
  min?: undefined | number;
  max?: undefined | number;
  step?: undefined | number;
};
