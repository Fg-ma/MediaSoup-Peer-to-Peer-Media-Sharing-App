export interface ImageOptions {
  controlsVanishTime?: number;
  closedCaptionsDecoratorColor?: string;
  primaryImageColor?: string;
  initialVolume?: "high" | "low" | "off";
}

export const defaultImageOptions: {
  controlsVanishTime: number;
  closedCaptionsDecoratorColor: string;
  primaryImageColor: string;
  initialVolume: "high" | "low" | "off";
} = {
  controlsVanishTime: 1250,
  closedCaptionsDecoratorColor: "rgba(30, 30, 30, 0.6)",
  primaryImageColor: "#f56114",
  initialVolume: "high",
};

export interface ActivePages {
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
}

export type DownloadTypes = "snapShot" | "original" | "record";

export interface Settings {
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
}

export const defaultSettings: Settings = Object.freeze({
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
});

export const downloadTypeSelections = {
  snapShot: "Snap shot",
  original: "Original",
  record: "Record",
};

export const defaultActiveSettingsPages: ActivePages = {
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
};

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

export interface DownloadTypeOptions {
  fps: DownloadRecordingFPSTypes;
  mimeType: DownloadRecordingMimeTypes;
}

export type DownloadTypeOptionsTypes = "fps" | "mimeType";

export const downloadTypeOptions: DownloadTypeOptionsTypes[] = [
  "fps",
  "mimeType",
];

export const downloadTypeOptionsArrays: {
  fps: DownloadRecordingFPSTypes[];
  mimeType: DownloadRecordingMimeTypes[];
} = {
  fps: ["24 fps", "25 fps", "30 fps", "60 fps"],
  mimeType: ["webm/vp9", "webm/vp8", "webm/av1", "ogg"],
};

export const downloadTypeOptionsTitles = {
  fps: "FPS",
  mimeType: "Mime type",
};

export const downloadRecordingMimeMap: {
  [downloadRecordingMimeType in DownloadRecordingMimeTypes]: string;
} = {
  "webm/vp9": "video/webm; codecs=vp9",
  "webm/vp8": "video/webm; codecs=vp8",
  "webm/av1": "video/webm; codecs=av1",
  ogg: "video/ogg",
};
