const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const cameraIcon = nginxAssetSeverBaseUrl + "svgs/cameraIcon.svg";
const videoIcon = nginxAssetSeverBaseUrl + "svgs/videoIcon.svg";
const icon10s = nginxAssetSeverBaseUrl + "svgs/10sIcon.svg";
const icon15s = nginxAssetSeverBaseUrl + "svgs/15sIcon.svg";
const icon30s = nginxAssetSeverBaseUrl + "svgs/30sIcon.svg";
const icon60s = nginxAssetSeverBaseUrl + "svgs/60sIcon.svg";

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
    fps: {
      value: DownloadRecordingFPSTypes;
    };
    mimeType: {
      value: DownloadRecordingMimeTypes;
    };
  };
  downloadImageOptions: {
    value: "";
    mimeType: {
      value: DownloadImageMimeTypes;
    };
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
  "fps",
  "mimeType",
];

export const downloadImageOptions: DownloadImageOptionsTypes[] = ["mimeType"];

export interface DownloadVideoOptions {
  fps: DownloadRecordingFPSTypes;
  mimeType: DownloadRecordingMimeTypes;
}

export interface DownloadImageOptions {
  mimeType: DownloadRecordingMimeTypes;
}

export type DownloadVideoOptionsTypes = "fps" | "mimeType";

export type DownloadImageOptionsTypes = "mimeType";

export const downloadVideoOptionsTitles = {
  fps: "FPS",
  mimeType: "Mime type",
};

export const downloadImageOptionsTitles = {
  mimeType: "Mime type",
};

export const downloadVideoOptionsArrays: {
  fps: DownloadRecordingFPSTypes[];
  mimeType: DownloadRecordingMimeTypes[];
} = {
  fps: ["24 fps", "25 fps", "30 fps", "60 fps"],
  mimeType: ["webm/vp9", "webm/vp8", "webm/av1", "ogg"],
};

export const downloadImageOptionsArrays: {
  mimeType: DownloadImageMimeTypes[];
} = {
  mimeType: ["jpg", "png", "webp", "tiff", "heic"],
};

export interface ActivePages {
  downloadVideoOptions: {
    active: boolean;
    fps: {
      active: boolean;
    };
    mimeType: {
      active: boolean;
    };
  };
  downloadImageOptions: {
    active: boolean;
    mimeType: {
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
    fps: {
      active: false,
    },
    mimeType: {
      active: false,
    },
  },
  downloadImageOptions: {
    active: false,
    mimeType: {
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
    fps: Object.freeze({
      value: "30 fps",
    }),
    mimeType: Object.freeze({
      value: "webm/vp9",
    }),
  }),
  downloadImageOptions: Object.freeze({
    value: "",
    mimeType: Object.freeze({
      value: "jpg",
    }),
  }),
  videoSpeed: {
    value: 1.0,
  },
  delay: { value: 0 },
});
