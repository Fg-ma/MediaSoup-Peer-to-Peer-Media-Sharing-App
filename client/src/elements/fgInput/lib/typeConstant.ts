export const defaultInputOptions = {
  submitButton: true,
  autoFocus: false,
  autocomplete: "on",
};

export type InputOptionsType = {
  submitButton?: boolean;
  autoFocus?: boolean;
  autocomplete?: "off" | "on";
};
