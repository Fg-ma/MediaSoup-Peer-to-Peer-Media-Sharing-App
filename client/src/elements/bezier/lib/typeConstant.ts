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
    shadow: {
      value: boolean;
      shadowColor: { value: string };
      strength: {
        value: number;
      };
      offsetX: {
        value: number;
      };
      offsetY: {
        value: number;
      };
    };
    blur: {
      value: boolean;
      strength: {
        value: number;
      };
    };
    grayscale: {
      value: boolean;
      scale: {
        value: number;
      };
    };
    saturate: {
      value: boolean;
      saturation: {
        value: number;
      };
    };
    edgeDetection: {
      value: boolean;
    };
    colorOverlay: {
      value: boolean;
      overlayColor: { value: string };
    };
    waveDistortion: {
      value: boolean;
      frequency: {
        value: number;
      };
      strength: {
        value: number;
      };
    };
    crackedGlass: {
      value: boolean;
      density: {
        value: number;
      };
      detail: {
        value: number;
      };
      strength: {
        value: number;
      };
    };
    neonGlow: {
      value: boolean;
      neonColor: { value: string };
    };
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
      strength: Object.freeze({
        value: 0.75,
      }),
      offsetX: Object.freeze({
        value: 0.25,
      }),
      offsetY: Object.freeze({
        value: 0.5,
      }),
    }),
    blur: Object.freeze({
      value: false,
      strength: Object.freeze({
        value: 2,
      }),
    }),
    grayscale: Object.freeze({
      value: false,
      scale: Object.freeze({
        value: 0,
      }),
    }),
    saturate: Object.freeze({
      value: false,
      saturation: Object.freeze({
        value: 2,
      }),
    }),
    edgeDetection: Object.freeze({
      value: false,
    }),
    colorOverlay: Object.freeze({
      value: false,
      overlayColor: Object.freeze({ value: "#d40213" }),
    }),
    waveDistortion: Object.freeze({
      value: false,
      frequency: Object.freeze({
        value: 0.05,
      }),
      strength: Object.freeze({
        value: 30,
      }),
    }),
    crackedGlass: Object.freeze({
      value: false,
      density: Object.freeze({
        value: 0.2,
      }),
      detail: Object.freeze({
        value: 2,
      }),
      strength: Object.freeze({
        value: 15,
      }),
    }),
    neonGlow: Object.freeze({
      value: false,
      neonColor: Object.freeze({ value: "#d40213" }),
    }),
  }),
  backgroundColor: Object.freeze({ value: "transparent" }),
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

export const filtersMeta: {
  [filtersType in FiltersTypes]: {
    title: string;
    options: {
      key: string;
      title: string;
      type: "color" | "number";
      rangeMin?: number;
      rangeMax?: number;
      ticks?: number;
      precision?: number;
    }[];
  };
} = {
  shadow: {
    title: "Shadow",
    options: [
      { key: "shadowColor", title: "Shadow color", type: "color" },
      {
        key: "strength",
        title: "Strength",
        type: "number",
        rangeMin: 0,
        rangeMax: 10,
        ticks: 6,
        precision: 1,
      },
      {
        key: "offsetX",
        title: "Offset X",
        type: "number",
        rangeMin: -100,
        rangeMax: 100,
        ticks: 6,
        precision: 0,
      },
      {
        key: "offsetY",
        title: "Offset Y",
        type: "number",
        rangeMin: -100,
        rangeMax: 100,
        ticks: 6,
        precision: 0,
      },
    ],
  },
  blur: {
    title: "Blur",
    options: [
      {
        key: "strength",
        title: "Strength",
        type: "number",
        rangeMin: 0,
        rangeMax: 10,
        ticks: 6,
        precision: 1,
      },
    ],
  },
  grayscale: {
    title: "Grayscale",
    options: [
      {
        key: "scale",
        title: "Scale",
        type: "number",
        rangeMin: 0,
        rangeMax: 1,
        ticks: 6,
        precision: 2,
      },
    ],
  },
  saturate: {
    title: "Saturate",
    options: [
      {
        key: "saturation",
        title: "Saturation",
        type: "number",
        rangeMin: 0,
        rangeMax: 5,
        ticks: 6,
        precision: 1,
      },
    ],
  },
  edgeDetection: {
    title: "Edge Detection",
    options: [],
  },
  colorOverlay: {
    title: "Color Overlay",
    options: [
      {
        key: "overlayColor",
        title: "Overlay color",
        type: "color",
      },
    ],
  },
  waveDistortion: {
    title: "Wave Distortion",
    options: [
      {
        key: "frequency",
        title: "Frequency",
        type: "number",
        rangeMin: 0.01,
        rangeMax: 0.2,
        ticks: 6,
        precision: 3,
      },
      {
        key: "strength",
        title: "Strength",
        type: "number",
        rangeMin: 0,
        rangeMax: 50,
        ticks: 6,
        precision: 1,
      },
    ],
  },
  crackedGlass: {
    title: "Cracked Glass",
    options: [
      {
        key: "density",
        title: "Density",
        type: "number",
        rangeMin: 0.1,
        rangeMax: 0.5,
        ticks: 6,
        precision: 3,
      },
      {
        key: "detail",
        title: "Detail",
        type: "number",
        rangeMin: 1,
        rangeMax: 5,
        ticks: 6,
        precision: 1,
      },
      {
        key: "strength",
        title: "Strength",
        type: "number",
        rangeMin: 0,
        rangeMax: 30,
        ticks: 6,
        precision: 1,
      },
    ],
  },
  neonGlow: {
    title: "Neon Glow",
    options: [
      {
        key: "neonColor",
        title: "Neon color",
        type: "color",
      },
    ],
  },
};

export const defaultPoints: BezierPoint[] = [
  {
    type: "endPoint",
    x: 16,
    y: 50,
    selected: false,
    inSelectionBox: false,
    dragging: false,
    hovering: false,
    controlType: "free",
    controls: { controlOne: { x: 32, y: 50.1, dragging: false } },
  },
  {
    type: "endPoint",
    x: 84,
    y: 50,
    selected: false,
    inSelectionBox: false,
    dragging: false,
    hovering: false,
    controlType: "free",
    controls: { controlOne: { x: 68, y: 50, dragging: false } },
  },
];
