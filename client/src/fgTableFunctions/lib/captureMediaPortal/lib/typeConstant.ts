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

export type DownloadRecordingFPSTypes =
  | "24 fps"
  | "25 fps"
  | "30 fps"
  | "60 fps";

export interface Settings {
  downloadOptions: {
    value: "";
    fps: {
      value: DownloadRecordingFPSTypes;
    };
    mimeType: {
      value: DownloadRecordingMimeTypes;
    };
  };
  videoSpeed: {
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

export const downloadOptions: DownloadOptionsTypes[] = ["fps", "mimeType"];

export interface DownloadOptions {
  fps: DownloadRecordingFPSTypes;
  mimeType: DownloadRecordingMimeTypes;
}

export type DownloadOptionsTypes = "fps" | "mimeType";

export const downloadOptionsTitles = {
  fps: "FPS",
  mimeType: "Mime type",
};

export const downloadOptionsArrays: {
  fps: DownloadRecordingFPSTypes[];
  mimeType: DownloadRecordingMimeTypes[];
} = {
  fps: ["24 fps", "25 fps", "30 fps", "60 fps"],
  mimeType: ["webm/vp9", "webm/vp8", "webm/av1", "ogg"],
};

export interface ActivePages {
  downloadOptions: {
    active: boolean;
    fps: {
      active: boolean;
    };
    mimeType: {
      active: boolean;
    };
  };
  videoSpeed: {
    active: boolean;
  };
}

export const defaultActivePages: ActivePages = {
  downloadOptions: {
    active: false,
    fps: {
      active: false,
    },
    mimeType: {
      active: false,
    },
  },
  videoSpeed: {
    active: false,
  },
};

export const defaultSettings: Settings = Object.freeze({
  downloadOptions: Object.freeze({
    value: "",
    fps: Object.freeze({
      value: "30 fps",
    }),
    mimeType: Object.freeze({
      value: "webm/vp9",
    }),
  }),
  videoSpeed: {
    value: 1.0,
  },
});
