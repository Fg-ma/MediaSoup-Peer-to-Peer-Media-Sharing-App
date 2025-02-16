import { closedCaptionsSelections } from "./lowerVideoControls/settingsButton/lib/ClosedCaptionsPage";

export interface VideoOptions {
  controlsVanishTime?: number;
  closedCaptionsDecoratorColor?: string;
  primaryVideoColor?: string;
  initialVolume?: "high" | "low" | "off";
}

export type DownloadTypes = "snapShot" | "original" | "record";

export type DownloadRecordingMimeTypes =
  | "webm/vp9"
  | "webm/vp8"
  | "webm/av1"
  | "ogg";

export type DownloadRecordingFPSTypes =
  | "24 fps"
  | "25 fps"
  | "30 fps"
  | "60 fps";

export interface Settings {
  closedCaption: {
    value: keyof typeof closedCaptionsSelections;
    closedCaptionOptionsActive: {
      value: "";
      fontFamily: { value: FontFamilies };
      fontColor: { value: FontColors };
      fontOpacity: { value: FontOpacities };
      fontSize: { value: FontSizes };
      backgroundColor: { value: BackgroundColors };
      backgroundOpacity: { value: BackgroundOpacities };
      characterEdgeStyle: { value: CharacterEdgeStyles };
    };
  };
  downloadType: {
    value: DownloadTypes;
    downloadTypeOptions: {
      value: "";
      fps: {
        value: DownloadRecordingFPSTypes;
      };
      mimeType: {
        value: DownloadRecordingMimeTypes;
      };
    };
  };
  videoSpeed: {
    value: number;
  };
}

export const defaultVideoOptions: {
  controlsVanishTime: number;
  closedCaptionsDecoratorColor: string;
  primaryVideoColor: string;
  initialVolume: "high" | "low" | "off";
} = {
  controlsVanishTime: 1250,
  closedCaptionsDecoratorColor: "rgba(30, 30, 30, 0.6)",
  primaryVideoColor: "#f56114",
  initialVolume: "high",
};

export type FontFamilies =
  | "K2D"
  | "Josephin"
  | "mono"
  | "sans"
  | "serif"
  | "thin"
  | "bold";

export type FontColors =
  | "white"
  | "black"
  | "red"
  | "green"
  | "blue"
  | "magenta"
  | "orange"
  | "cyan";

export type FontOpacities = "25%" | "50%" | "75%" | "100%";

export type FontSizes =
  | "xsmall"
  | "small"
  | "base"
  | "medium"
  | "large"
  | "xlarge";

export type BackgroundColors =
  | "white"
  | "black"
  | "red"
  | "green"
  | "blue"
  | "magenta"
  | "orange"
  | "cyan";

export type BackgroundOpacities = "25%" | "50%" | "75%" | "100%";

export type CharacterEdgeStyles =
  | "None"
  | "Shadow"
  | "Raised"
  | "Inset"
  | "Outline";

export const downloadRecordingMimeMap: {
  [downloadRecordingMimeType in DownloadRecordingMimeTypes]: string;
} = {
  "webm/vp9": "video/webm; codecs=vp9",
  "webm/vp8": "video/webm; codecs=vp8",
  "webm/av1": "video/webm; codecs=av1",
  ogg: "video/ogg",
};

export const downloadTypeSelections = {
  snapShot: "Snap shot",
  original: "Original",
  record: "Record",
};

export const downloadTypeOptions: DownloadTypeOptionsTypes[] = [
  "fps",
  "mimeType",
];

export interface DownloadTypeOptions {
  fps: DownloadRecordingFPSTypes;
  mimeType: DownloadRecordingMimeTypes;
}

export type DownloadTypeOptionsTypes = "fps" | "mimeType";

export const downloadTypeOptionsTitles = {
  fps: "FPS",
  mimeType: "Mime type",
};

export const downloadTypeOptionsArrays: {
  fps: DownloadRecordingFPSTypes[];
  mimeType: DownloadRecordingMimeTypes[];
} = {
  fps: ["24 fps", "25 fps", "30 fps", "60 fps"],
  mimeType: ["webm/vp9", "webm/vp8", "webm/av1", "ogg"],
};

export interface ActivePages {
  closedCaption: {
    active: boolean;
    closedCaptionOptionsActive: {
      active: boolean;
      fontFamily: { active: boolean };
      fontColor: { active: boolean };
      fontOpacity: { active: boolean };
      fontSize: { active: boolean };
      backgroundColor: { active: boolean };
      backgroundOpacity: { active: boolean };
      characterEdgeStyle: { active: boolean };
    };
  };
  downloadType: {
    active: boolean;
    downloadTypeOptions: {
      active: boolean;
      fps: {
        active: boolean;
      };
      mimeType: {
        active: boolean;
      };
    };
  };
  videoSpeed: {
    active: boolean;
  };
}

export const fontSizeMap = {
  xsmall: "0.75rem",
  small: "1.25rem",
  base: "1.5rem",
  medium: "2rem",
  large: "2.5rem",
  xlarge: "3rem",
};

export const opacityMap = {
  "25%": "0.25",
  "50%": "0.5",
  "75%": "0.75",
  "100%": "1",
};

export const colorMap = {
  white: "rgba(255, 255, 255,",
  black: "rgba(0, 0, 0,",
  red: "rgba(255, 0, 0,",
  green: "rgba(0, 255, 0,",
  blue: "rgba(0, 0, 255,",
  magenta: "rgba(255, 0, 255,",
  orange: "rgba(255, 165, 0,",
  cyan: "rgba(0, 255, 255,",
};

export const fontFamilyMap = {
  K2D: "'K2D', sans-serif",
  Josephin: "'Josefin Sans', sans-serif",
  mono: "'Courier New', monospace",
  sans: "'Arial', sans-serif",
  serif: "'Times New Roman', serif",
  thin: "'Montserrat Thin', sans-serif",
  bold: "'Noto Sans', sans-serif",
};

export const characterEdgeStyleMap = {
  None: "none",
  Shadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
  Raised: "1px 1px 2px rgba(0, 0, 0, 0.4)",
  Inset:
    "1px 1px 2px rgba(255, 255, 255, 0.5), -1px -1px 2px rgba(0, 0, 0, 0.4)",
  Outline:
    "-1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black, 1px 1px 0px black",
};

export const defaultActivePages: ActivePages = {
  closedCaption: {
    active: false,
    closedCaptionOptionsActive: {
      active: false,
      fontFamily: { active: false },
      fontColor: { active: false },
      fontOpacity: { active: false },
      fontSize: { active: false },
      backgroundColor: { active: false },
      backgroundOpacity: { active: false },
      characterEdgeStyle: { active: false },
    },
  },
  downloadType: {
    active: false,
    downloadTypeOptions: {
      active: false,
      fps: {
        active: false,
      },
      mimeType: {
        active: false,
      },
    },
  },
  videoSpeed: {
    active: false,
  },
};

export const defaultSettings = Object.freeze({
  closedCaption: Object.freeze({
    value: "en-US",
    closedCaptionOptionsActive: Object.freeze({
      value: "",
      fontFamily: Object.freeze({ value: "K2D" }),
      fontColor: Object.freeze({ value: "white" }),
      fontOpacity: Object.freeze({ value: "100%" }),
      fontSize: Object.freeze({ value: "base" }),
      backgroundColor: Object.freeze({ value: "black" }),
      backgroundOpacity: Object.freeze({ value: "75%" }),
      characterEdgeStyle: Object.freeze({ value: "None" }),
    }),
  }),
  downloadType: Object.freeze({
    value: "snapShot",
    downloadTypeOptions: Object.freeze({
      value: "",
      fps: Object.freeze({
        value: "30 fps",
      }),
      mimeType: Object.freeze({
        value: "webm/vp9",
      }),
    }),
  }),
  videoSpeed: {
    value: 1.0,
  },
});
