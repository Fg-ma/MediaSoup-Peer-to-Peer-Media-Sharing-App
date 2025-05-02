import uWS from "uWebSockets.js";
import {
  UserContentStateTypes,
  StaticContentTypes,
} from "../../universal/contentTypeConstant";

export interface UserConnections {
  [userId: string]: {
    [instance: string]: UserStaticContentWebSocket;
  };
}

export const contentTypeBucketMap: {
  [staticContentType in StaticContentTypes]: string;
} = {
  video: "user-videos",
  image: "user-images",
  svg: "user-svgs",
  application: "user-applications",
  text: "user-text",
  soundClip: "user-sound-clips",
};

export const contentTypeQdrantMap: {
  [staticContentType in StaticContentTypes]: string;
} = {
  video: "userVideos",
  image: "userImages",
  svg: "userSvgs",
  application: "userApplications",
  text: "userText",
  soundClip: "userSoundClips",
};

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

export interface UserStaticContentWebSocket extends uWS.WebSocket<SocketData> {
  id: string;
  userId: string;
  instance: string;
}

export interface SocketData {
  id: string;
  userId: string;
  instance: string;
}

export type MessageTypes =
  | onConnectType
  | onDisconnectType
  | onDeleteContentType
  | onGetFileType
  | onChangeContentStateType
  | onSearchUserContentRequestType;

export type onConnectType = {
  type: "connect";
  header: {
    userId: string;
    instance: string;
  };
};

export type onDisconnectType = {
  type: "disconnect";
  header: {
    userId: string;
    instance: string;
  };
};

export type onSearchUserContentRequestType = {
  type: "searchUserContentRequest";
  header: {
    userId: string;
    instance: string;
    contentType: StaticContentTypes | "all";
  };
  data: {
    name: string;
  };
};

export type onDeleteContentType = {
  type: "deleteContent";
  header: {
    userId: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    filename: string;
  };
};

export type onGetFileType = {
  type: "getFile";
  header: {
    userId: string;
    instance: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    key: string;
  };
};

export type onChangeContentStateType = {
  type: "changeContentState";
  header: {
    userId: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    state: UserContentStateTypes[];
  };
};

export const userConnections: UserConnections = {};
