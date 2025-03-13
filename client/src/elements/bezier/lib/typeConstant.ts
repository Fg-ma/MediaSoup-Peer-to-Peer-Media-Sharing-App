export type ControlTypes = "inlineSymmetric" | "inline" | "free";

export interface ControlPoint {
  x: number;
  y: number;
  dragging: boolean;
}

export interface BezierPoint {
  type: "endPoint" | "splitPoint";
  x: number;
  y: number;
  selected: boolean;
  inSelectionBox: boolean;
  dragging: boolean;
  hovering: boolean;
  controlType: ControlTypes;
  controls: {
    controlOne: ControlPoint;
    controlTwo?: ControlPoint;
  };
}

export const cycleControlTypeMap: {
  [controlTypes in ControlTypes]: ControlTypes;
} = {
  free: "inlineSymmetric",
  inlineSymmetric: "inline",
  inline: "free",
};

export type BezierColorTypes =
  | "backgroundColor"
  | "color"
  | "shadowColor"
  | "overlayColor"
  | "neonColor";

export interface ActivePages {
  filters: {
    active: boolean;
  };
  downloadOptions: {
    active: boolean;
    mimeType: {
      active: boolean;
    };
    size: {
      active: boolean;
    };
    compression: {
      active: boolean;
    };
  };
}

export type FiltersTypes =
  | "shadow"
  | "blur"
  | "grayscale"
  | "saturate"
  | "edgeDetection"
  | "colorOverlay"
  | "waveDistortion"
  | "crackedGlass"
  | "neonGlow";

export interface Settings {
  filters: {
    shadow: { value: boolean; shadowColor: { value: string } };
    blur: { value: boolean };
    grayscale: { value: boolean };
    saturate: { value: boolean };
    edgeDetection: { value: boolean };
    colorOverlay: { value: boolean; overlayColor: { value: string } };
    waveDistortion: { value: boolean };
    crackedGlass: { value: boolean };
    neonGlow: { value: boolean; neonColor: { value: string } };
  };
  backgroundColor: { value: string };
  color: {
    value: string;
  };
  downloadOptions: {
    mimeType: {
      value: DownloadMimeTypes;
    };
    size: {
      value: number;
    };
    compression: {
      value: DownloadCompressionTypes;
    };
  };
}

export const defaultSettings: Settings = Object.freeze({
  filters: Object.freeze({
    shadow: Object.freeze({
      value: false,
      shadowColor: Object.freeze({ value: "#f2f2f2" }),
    }),
    blur: Object.freeze({ value: false }),
    grayscale: Object.freeze({ value: false }),
    saturate: Object.freeze({ value: false }),
    edgeDetection: Object.freeze({ value: false }),
    colorOverlay: Object.freeze({
      value: false,
      overlayColor: Object.freeze({ value: "#d40213" }),
    }),
    waveDistortion: Object.freeze({ value: false }),
    crackedGlass: Object.freeze({ value: false }),
    neonGlow: Object.freeze({
      value: false,
      neonColor: Object.freeze({ value: "#d40213" }),
    }),
  }),
  backgroundColor: Object.freeze({ value: "#090909" }),
  color: Object.freeze({
    value: "#f2f2f2",
  }),
  downloadOptions: Object.freeze({
    mimeType: Object.freeze({
      value: "svg",
    }),
    size: Object.freeze({
      value: 1024,
    }),
    compression: Object.freeze({
      value: "Plain",
    }),
  }),
});

export const defaultActivePages: ActivePages = {
  filters: Object.freeze({ active: false }),
  downloadOptions: Object.freeze({
    active: false,
    mimeType: Object.freeze({
      active: false,
    }),
    size: Object.freeze({
      active: false,
    }),
    compression: Object.freeze({
      active: false,
    }),
  }),
};

export type DownloadMimeTypes =
  | "svg"
  | "svgz"
  | "jpg"
  | "png"
  | "webp"
  | "tiff"
  | "heic";

export type DownloadSizeTypes =
  | "256"
  | "512"
  | "1024"
  | "2048"
  | "4096"
  | "16384";

export type DownloadCompressionTypes = "Minified" | "Plain" | "Zipped";

export const downloadOptionsTitles = {
  mimeType: "Mime type",
  size: "Size",
  compression: "Compression",
};

export const downloadOptionsArrays: {
  mimeType: DownloadMimeTypes[];
  size: DownloadSizeTypes[];
  compression: DownloadCompressionTypes[];
} = {
  mimeType: ["svg", "svgz", "jpg", "png", "webp", "tiff", "heic"],
  size: ["256", "512", "1024", "2048", "4096", "16384"],
  compression: ["Minified", "Plain", "Zipped"],
};

export const filtersMeta: { [filtersType in FiltersTypes]: { title: string } } =
  {
    shadow: { title: "Shadow" },
    blur: { title: "Blur" },
    grayscale: { title: "Grayscale" },
    saturate: { title: "Saturate" },
    edgeDetection: { title: "Edge detection" },
    colorOverlay: { title: "Color overlay" },
    waveDistortion: { title: "Wave distortion" },
    crackedGlass: { title: "Cracked glass" },
    neonGlow: { title: "Neon glow" },
  };
