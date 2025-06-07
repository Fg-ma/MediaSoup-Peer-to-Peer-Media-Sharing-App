export type LoadingStateTypes =
  | "downloading"
  | "downloaded"
  | "failed"
  | "paused"
  | "reuploading";

export type ContentTypes =
  | "video"
  | "image"
  | "camera"
  | "application"
  | "screen"
  | "text"
  | "soundClip"
  | "audio"
  | "games"
  | "svg";

export type StaticContentTypes =
  | "video"
  | "image"
  | "svg"
  | "application"
  | "text"
  | "soundClip";

export type TableContentStateTypes = "tabled";

export type UserContentStateTypes = "muteStyle";

export type StaticMimeTypes =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif"
  | "image/bmp"
  | "image/tiff"
  | "image/svg+xml"
  | "video/mp4"
  | "video/mpeg"
  | "video/webm"
  | "video/ogg"
  | "video/x-msvideo"
  | "audio/mpeg"
  | "audio/ogg"
  | "audio/wav"
  | "audio/webm"
  | "application/pdf"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.ms-powerpoint"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "text/plain";

export type GameTypes = "snake";

export const mimeTypeContentTypeMap: {
  [tableTopStaticMimeType in StaticMimeTypes]: StaticContentTypes;
} = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "image/bmp": "image",
  "image/tiff": "image",
  "image/svg+xml": "svg",
  "video/mp4": "video",
  "video/mpeg": "video",
  "video/webm": "video",
  "video/ogg": "video",
  "video/x-msvideo": "video",
  "audio/mpeg": "soundClip",
  "audio/ogg": "soundClip",
  "audio/wav": "soundClip",
  "audio/webm": "soundClip",
  "application/pdf": "application",
  "application/vnd.ms-excel": "application",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "application",
  "application/vnd.ms-powerpoint": "application",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "application",
  "application/msword": "application",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "application",
  "text/plain": "text",
};

export const mimeToExtension: {
  [tableTopStaticMimeType in StaticMimeTypes]: string;
} = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/bmp": ".bmp",
  "image/tiff": ".tiff",
  "video/mp4": ".mp4",
  "video/mpeg": ".mpeg",
  "video/webm": ".webm",
  "video/ogg": ".ogv",
  "video/x-msvideo": ".avi",
  "audio/mpeg": ".mp3",
  "audio/ogg": ".oga",
  "audio/wav": ".wav",
  "audio/webm": ".weba",
  "application/pdf": ".pdf",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "text/plain": ".txt",
};
