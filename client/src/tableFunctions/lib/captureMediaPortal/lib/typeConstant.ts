const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const cameraIcon = nginxAssetServerBaseUrl + "svgs/cameraIcon.svg";
const videoIcon = nginxAssetServerBaseUrl + "svgs/videoIcon.svg";
const icon10s = nginxAssetServerBaseUrl + "svgs/10sIcon.svg";
const icon15s = nginxAssetServerBaseUrl + "svgs/15sIcon.svg";
const icon30s = nginxAssetServerBaseUrl + "svgs/30sIcon.svg";
const icon60s = nginxAssetServerBaseUrl + "svgs/60sIcon.svg";

export type CaptureMediaTypes =
  | "camera"
  | "video"
  | "10s"
  | "15s"
  | "30s"
  | "60s";

export const captureMediaTypeMeta: {
  [captureMediaType in CaptureMediaTypes]: { icon: string; title: string };
} = {
  camera: { icon: cameraIcon, title: "Camera" },
  video: { icon: videoIcon, title: "Video" },
  "10s": { icon: icon10s, title: "10 seconds" },
  "15s": { icon: icon15s, title: "15 seconds" },
  "30s": { icon: icon30s, title: "30 seconds" },
  "60s": { icon: icon60s, title: "60 seconds" },
};

export type DownloadRecordingMimeTypes =
  | "webm/vp9"
  | "webm/vp8"
  | "webm/av1"
  | "ogg";

export type DownloadImageMimeTypes = "jpg" | "png" | "webp" | "tiff" | "heic";

export type DownloadRecordingFPSTypes =
  | "24 fps"
  | "25 fps"
  | "30 fps"
  | "60 fps";

export interface Settings {
  downloadVideoOptions: {
    value: "";
    mimeType: {
      value: DownloadRecordingMimeTypes;
    };
    fps: {
      value: DownloadRecordingFPSTypes;
    };
    bitRate: {
      value: number | "default";
    };
  };
  downloadImageOptions: {
    value: "";
    mimeType: {
      value: DownloadImageMimeTypes;
    };
    samples: { value: number };
    antialiasing: { value: boolean };
    quality: { value: number };
  };
  videoSpeed: {
    value: number;
  };
  delay: {
    value: number;
  };
}

export const downloadRecordingMimeMap: {
  [downloadRecordingMimeType in DownloadRecordingMimeTypes]: string;
} = {
  "webm/vp9": "video/webm; codecs=vp9",
  "webm/vp8": "video/webm; codecs=vp8",
  "webm/av1": "video/webm; codecs=av1",
  ogg: "video/ogg",
};

export const downloadRecordingExtensionsMap: {
  [downloadRecordingMimeType in DownloadRecordingMimeTypes]: string;
} = {
  "webm/vp9": "webm",
  "webm/vp8": "webm",
  "webm/av1": "webm",
  ogg: "ogv",
};

export const downloadImageMimeMap: {
  [downloadImageMimeType in DownloadImageMimeTypes]: string;
} = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  tiff: "image/tiff",
  heic: "image/heic",
};

export const downloadVideoOptions: DownloadVideoOptionsTypes[] = [
  "mimeType",
  "fps",
  "bitRate",
];

export const downloadImageOptions: DownloadImageOptionsTypes[] = [
  "mimeType",
  "samples",
  "antialiasing",
  "quality",
];

export interface DownloadVideoOptions {
  fps: DownloadRecordingFPSTypes;
  mimeType: DownloadRecordingMimeTypes;
}

export interface DownloadImageOptions {
  mimeType: DownloadRecordingMimeTypes;
  samples: number;
  antialiasing: boolean;
  quality: number;
}

export type DownloadVideoOptionsTypes = "mimeType" | "fps" | "bitRate";

export type DownloadImageOptionsTypes =
  | "mimeType"
  | "samples"
  | "antialiasing"
  | "quality";

export const downloadVideoOptionsTitles = {
  mimeType: "Mime type",
  fps: "FPS",
  bitRate: "Bit rate",
};

export const downloadImageOptionsTitles = {
  mimeType: "Mime type",
  samples: "Samples",
  antialiasing: "Antialiasing",
  quality: "Quality",
};

export const downloadVideoOptionsArrays: {
  mimeType: DownloadRecordingMimeTypes[];
  fps: DownloadRecordingFPSTypes[];
  bitRate: (number | "default")[];
} = {
  mimeType: ["webm/vp9", "webm/vp8", "webm/av1", "ogg"],
  fps: ["24 fps", "25 fps", "30 fps", "60 fps"],
  bitRate: ["default", 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5],
};

export const downloadImageOptionsArrays: {
  mimeType: DownloadImageMimeTypes[];
  samples: number[];
  antialiasing: [];
  quality: number[];
} = {
  mimeType: ["jpg", "png", "webp", "tiff", "heic"],
  samples: [1, 4, 8, 16, 32],
  antialiasing: [],
  quality: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
};

export interface ActivePages {
  downloadVideoOptions: {
    active: boolean;
    mimeType: {
      active: boolean;
    };
    fps: {
      active: boolean;
    };
    bitRate: {
      active: boolean;
    };
  };
  downloadImageOptions: {
    active: boolean;
    mimeType: {
      active: boolean;
    };
    samples: {
      active: boolean;
    };
    quality: {
      active: boolean;
    };
  };
  videoSpeed: {
    active: boolean;
  };
  delay: {
    active: boolean;
  };
}

export const defaultActivePages: ActivePages = {
  downloadVideoOptions: {
    active: false,
    mimeType: {
      active: false,
    },
    fps: {
      active: false,
    },
    bitRate: {
      active: false,
    },
  },
  downloadImageOptions: {
    active: false,
    mimeType: {
      active: false,
    },
    samples: {
      active: false,
    },
    quality: {
      active: false,
    },
  },
  videoSpeed: {
    active: false,
  },
  delay: {
    active: false,
  },
};

export const defaultSettings: Settings = Object.freeze({
  downloadVideoOptions: Object.freeze({
    value: "",
    mimeType: Object.freeze({
      value: "webm/vp9",
    }),
    fps: Object.freeze({
      value: "30 fps",
    }),
    bitRate: Object.freeze({
      value: "default",
    }),
  }),
  downloadImageOptions: Object.freeze({
    value: "",
    mimeType: Object.freeze({
      value: "jpg",
    }),
    samples: {
      value: 8,
    },
    antialiasing: {
      value: true,
    },
    quality: {
      value: 0.8,
    },
  }),
  videoSpeed: {
    value: 1.0,
  },
  delay: { value: 0 },
});
