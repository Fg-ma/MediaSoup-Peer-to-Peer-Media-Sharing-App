export interface ActivePages {
  colors: {
    active: boolean;
  };
  fontStyle: {
    active: boolean;
  };
}

export interface Settings {
  background: { value: "true" | "false" };
  colors: {
    value: "";
    backgroundColor: {
      value: string;
    };
    textColor: {
      value: string;
    };
    indexColor: {
      value: string;
    };
  };
  fontSize: {
    value: string;
  };
  fontStyle: {
    value: string;
  };
}

export const defaultSettings: Settings = Object.freeze({
  background: Object.freeze({ value: "false" }),
  colors: Object.freeze({
    value: "",
    backgroundColor: {
      value: "#090909",
    },
    textColor: {
      value: "#f2f2f2",
    },
    indexColor: {
      value: "#22c55e",
    },
  }),
  fontSize: Object.freeze({
    value: "16px",
  }),
  fontStyle: Object.freeze({
    value: "K2D, sans",
  }),
});

export const defaultActiveSettingsPages: ActivePages = {
  colors: {
    active: false,
  },
  fontStyle: {
    active: false,
  },
};

export type ColorTypes = "backgroundColor" | "textColor" | "indexColor";

export const colorsOptionsTitles: { [colorType in ColorTypes]: string } = {
  backgroundColor: "Background color",
  textColor: "Text color",
  indexColor: "Index color",
};

export type FontStyles = "K2D" | "josefin" | "B612Mono";

export const fontStylesOptionsMeta: {
  [fontStyle in FontStyles]: { title: string; value: string };
} = {
  K2D: { title: "K2D", value: "K2D, sans" },
  josefin: { title: "Josefin", value: "Josefin, sans" },
  B612Mono: { title: "B612 Monospace", value: "B612Mono, monospace" },
};
