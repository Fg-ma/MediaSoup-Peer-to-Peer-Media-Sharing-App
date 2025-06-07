export interface ActivePages {
  downloadType: {
    active: boolean;
    downloadRecordTypeOptions: {
      active: boolean;
      fps: {
        active: boolean;
      };
      mimeType: {
        active: boolean;
      };
    };
    downloadSnapShotTypeOptions: {
      active: boolean;
      mimeType: {
        active: boolean;
      };
      quality: {
        active: boolean;
      };
    };
  };
}

export type DownloadTypes = "snapShot" | "original" | "record";

export interface Settings {
  synced: { value: boolean };
  background: { value: boolean };
  downloadType: {
    value: DownloadTypes;
    downloadRecordTypeOptions: {
      value: "";
      fps: {
        value: DownloadRecordingFPSTypes;
      };
      mimeType: {
        value: DownloadRecordingMimeTypes;
      };
    };
    downloadSnapShotTypeOptions: {
      value: "";
      mimeType: {
        value: DownloadSnapShotMimeTypes;
      };
      quality: {
        value: number;
      };
    };
  };
}

export const defaultSettings: Settings = Object.freeze({
  synced: Object.freeze({ value: true }),
  background: Object.freeze({ value: false }),
  downloadType: Object.freeze({
    value: "snapShot",
    downloadRecordTypeOptions: Object.freeze({
      value: "",
      fps: Object.freeze({
        value: "30 fps",
      }),
      mimeType: Object.freeze({
        value: "webm/vp9",
      }),
    }),
    downloadSnapShotTypeOptions: Object.freeze({
      value: "",
      mimeType: Object.freeze({
        value: "image/jpg",
      }),
      quality: Object.freeze({
        value: 0.8,
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
    downloadRecordTypeOptions: {
      active: false,
      fps: {
        active: false,
      },
      mimeType: {
        active: false,
      },
    },
    downloadSnapShotTypeOptions: {
      active: false,
      mimeType: {
        active: false,
      },
      quality: {
        active: false,
      },
    },
  },
};

export type DownloadSnapShotMimeTypes =
  | "image/png"
  | "image/jpg"
  | "image/webp"
  | "image/bmp"
  | "image/tiff"
  | "image/heic";

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

export type DownloadRecordTypeOptionsTypes = "fps" | "mimeType";

export const downloadRecordTypeOptions: DownloadRecordTypeOptionsTypes[] = [
  "fps",
  "mimeType",
];

export type DownloadSnapShotTypeOptionsTypes = "quality" | "mimeType";

export const downloadSnapShotTypeOptions: DownloadSnapShotTypeOptionsTypes[] = [
  "mimeType",
  "quality",
];

export const downloadRecordingTypeOptionsArrays: {
  fps: DownloadRecordingFPSTypes[];
  mimeType: DownloadRecordingMimeTypes[];
} = {
  fps: ["24 fps", "25 fps", "30 fps", "60 fps"],
  mimeType: ["webm/vp9", "webm/vp8", "webm/av1", "ogg"],
};

export const downloadSnapShotTypeOptionsArrays: {
  mimeType: DownloadSnapShotMimeTypes[];
  quality: number[];
} = {
  mimeType: [
    "image/png",
    "image/jpg",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "image/heic",
  ],
  quality: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
};

export const downloadRecordTypeOptionsTitles = {
  fps: "FPS",
  mimeType: "Mime type",
};

export const downloadSnapShotTypeOptionsTitles = {
  mimeType: "Mime type",
  quality: "Quality",
};

export const downloadRecordingMimeMap: {
  [downloadRecordingMimeType in DownloadRecordingMimeTypes]: string;
} = {
  "webm/vp9": "video/webm; codecs=vp9",
  "webm/vp8": "video/webm; codecs=vp8",
  "webm/av1": "video/webm; codecs=av1",
  ogg: "video/ogg",
};
