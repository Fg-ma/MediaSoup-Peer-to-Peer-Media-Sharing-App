export type DownloadTypes = "snapShot" | "original" | "record";

export const downloadTypeSelections = {
  snapShot: "Snap shot",
  original: "Original",
  record: "Record",
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
