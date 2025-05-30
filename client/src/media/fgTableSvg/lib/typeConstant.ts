export interface ActivePages {
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

export interface Settings {
  background: { value: boolean };
  synced: { value: boolean };
  downloadOptions: {
    mimeType: {
      value: DownloadMimeTypes;
    };
    size: {
      value: "aspect" | "free";
      width: { value: number };
      height: { value: number };
    };
    compression: {
      value: DownloadCompressionTypes;
    };
  };
}

export const defaultSettings: Settings = Object.freeze({
  background: Object.freeze({ value: false }),
  synced: Object.freeze({ value: true }),
  downloadOptions: Object.freeze({
    mimeType: Object.freeze({
      value: "svg",
    }),
    size: Object.freeze({
      value: "aspect",
      width: Object.freeze({ value: 1024 }),
      height: Object.freeze({ value: 1024 }),
    }),
    compression: Object.freeze({
      value: "Plain",
    }),
  }),
});

export const defaultActivePages: ActivePages = {
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

export type DownloadSizeTypes = "256" | "512" | "1024" | "2048" | "4096";

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
  size: ["256", "512", "1024", "2048", "4096"],
  compression: ["Minified", "Plain", "Zipped"],
};
