export const defaultInputOptions = {
  submitButton: true,
  autoFocus: false,
  autocomplete: "on",
  padding: 0.5,
  centerText: false,
};

export type InputOptionsType = {
  submitButton?: boolean;
  autoFocus?: boolean;
  autocomplete?: "off" | "on";
  padding?: number;
  centerText?: boolean;
};
