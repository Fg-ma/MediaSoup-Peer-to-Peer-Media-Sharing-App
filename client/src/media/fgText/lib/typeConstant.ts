export interface ActivePages {
  colors: {
    active: boolean;
  };
  fontStyle: {
    active: boolean;
  };
}

export interface Settings {
  background: { value: boolean };
  synced: { value: boolean };
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
  background: Object.freeze({ value: false }),
  synced: Object.freeze({ value: false }),
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

export type FontStyles =
  | "AnnieUseYourTelescope"
  | "B612Mono"
  | "Ballet"
  | "Barrio"
  | "Borel"
  | "BrunoAceSC"
  | "Butcherman"
  | "CaesarDressing"
  | "Combo"
  | "Delius"
  | "EagleLake"
  | "Ewert"
  | "Flavors"
  | "FontdinerSwanky"
  | "FunnelSans"
  | "GrenzeGotisch"
  | "Honk"
  | "ImperialScript"
  | "Josefin"
  | "K2D"
  | "Kablammo"
  | "Knewave"
  | "Limelight"
  | "MacondoSwashCaps"
  | "MajorMonoDisplay"
  | "Mansalva"
  | "MarkaziText"
  | "MetalMania"
  | "Monofett"
  | "Nabla"
  | "Orbitron"
  | "PirataOne"
  | "Plaster"
  | "PlaywriteITModerna"
  | "PressStart2P"
  | "Quicksand"
  | "RampartOne"
  | "RedHatDisplay"
  | "Roboto"
  | "ShadowsIntoLightTwo"
  | "SixtyfourConvergence"
  | "Slackey"
  | "TiltPrism"
  | "Tourney"
  | "TradeWinds"
  | "UnifrakturMaguntia"
  | "Wallpoet"
  | "WalterTurncoat"
  | "ZenTokyoZoo";

export const fontStylesOptionsMeta: {
  [fontStyle in FontStyles]: { title: string; value: string };
} = {
  AnnieUseYourTelescope: {
    title: "Annie use your telescope",
    value: "AnnieUseYourTelescope, sans",
  },
  B612Mono: { title: "B612 monospace", value: "B612Mono, monospace" },
  Ballet: { title: "Ballet", value: "Ballet, sans" },
  Barrio: { title: "Barrio", value: "Barrio, sans" },
  Borel: { title: "Borel", value: "Borel, sans" },
  BrunoAceSC: { title: "Bruno Ace SC", value: "BrunoAceSC, sans" },
  Butcherman: { title: "Butcherman", value: "Butcherman, sans" },
  CaesarDressing: { title: "Caesar dressing", value: "CaesarDressing, sans" },
  Combo: { title: "Combo", value: "Combo, sans" },
  Delius: { title: "Delius", value: "Delius, sans" },
  EagleLake: { title: "Eagle lake", value: "EagleLake, sans" },
  Ewert: { title: "Ewert", value: "Ewert, sans" },
  Flavors: { title: "Flavors", value: "Flavors, sans" },
  FontdinerSwanky: {
    title: "Font diner Swanky",
    value: "FontdinerSwanky, sans",
  },
  FunnelSans: { title: "Funnel sans", value: "FunnelSans, sans" },
  GrenzeGotisch: { title: "Grenze Gotisch", value: "GrenzeGotisch, sans" },
  Honk: { title: "Honk", value: "Honk, sans" },
  ImperialScript: { title: "Imperial script", value: "ImperialScript, sans" },
  Josefin: { title: "Josefin", value: "Josefin, sans" },
  K2D: { title: "K2D", value: "K2D, sans" },
  Kablammo: { title: "Kablammo", value: "Kablammo, sans" },
  Knewave: { title: "Knewave", value: "Knewave, sans" },
  Limelight: { title: "Limelight", value: "Limelight, sans" },
  MacondoSwashCaps: {
    title: "Macondo swash caps",
    value: "MacondoSwashCaps, sans",
  },
  MajorMonoDisplay: {
    title: "Major mono",
    value: "MajorMonoDisplay, monospace",
  },
  Mansalva: { title: "Mansalva", value: "Mansalva, sans" },
  MarkaziText: { title: "Markazi text", value: "MarkaziText, sans" },
  MetalMania: { title: "Metal mania", value: "MetalMania, sans" },
  Monofett: { title: "Monofett", value: "Monofett, sans" },
  Nabla: { title: "Nabla", value: "Nabla, sans" },
  Orbitron: { title: "Orbitron", value: "Orbitron, sans" },
  PirataOne: { title: "Pirata one", value: "PirataOne, sans" },
  Plaster: { title: "Plaster", value: "Plaster, sans" },
  PlaywriteITModerna: {
    title: "Playwrite moderna",
    value: "PlaywriteITModerna, sans",
  },
  PressStart2P: { title: "Start 2P", value: "PressStart2P, sans" },
  Quicksand: { title: "Quicksand", value: "Quicksand, sans" },
  RampartOne: { title: "Rampart one", value: "RampartOne, sans" },
  RedHatDisplay: { title: "RedHat display", value: "RedHatDisplay, sans" },
  Roboto: { title: "Roboto", value: "Roboto, sans" },
  ShadowsIntoLightTwo: {
    title: "Shadows into light two",
    value: "ShadowsIntoLightTwo, sans",
  },
  SixtyfourConvergence: {
    title: "Sixty four convergence",
    value: "SixtyfourConvergence, sans",
  },
  Slackey: { title: "Slackey", value: "Slackey, sans" },
  TiltPrism: { title: "Tilt prism", value: "TiltPrism, sans" },
  Tourney: { title: "Tourney", value: "Tourney, sans" },
  TradeWinds: { title: "Trade winds", value: "TradeWinds, sans" },
  UnifrakturMaguntia: {
    title: "Unifraktur Maguntia",
    value: "UnifrakturMaguntia, sans",
  },
  Wallpoet: { title: "Wallpoet", value: "Wallpoet, sans" },
  WalterTurncoat: { title: "Walter turncoat", value: "WalterTurncoat, sans" },
  ZenTokyoZoo: { title: "Zen Tokyo zoo", value: "ZenTokyoZoo, sans" },
};
