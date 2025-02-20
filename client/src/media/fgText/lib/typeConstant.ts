export interface ActivePages {
  colors: {
    active: boolean;
  };
}

export interface Settings {
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
}

export const defaultSettings: Settings = Object.freeze({
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
});

export const defaultActiveSettingsPages: ActivePages = {
  colors: {
    active: false,
  },
};

export type ColorTypes = "backgroundColor" | "textColor" | "indexColor";

export const colorsOptionsTitles: { [colorType in ColorTypes]: string } = {
  backgroundColor: "Background color",
  textColor: "Text color",
  indexColor: "Index color",
};
