export const defaultInputOptions = {
  submitButton: true,
  autoFocus: false,
  autocomplete: "on",
  padding: 0.5,
  centerText: false,
  backgroundColor: "#f2f2f2",
};

export type InputOptionsType = {
  submitButton?: boolean;
  autoFocus?: boolean;
  autocomplete?: "off" | "on";
  padding?: number;
  centerText?: boolean;
  backgroundColor?: string;
};
