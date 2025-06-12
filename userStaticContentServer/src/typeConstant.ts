import uWS from "uWebSockets.js";
import {
  UserContentStateTypes,
  StaticContentTypes,
  StaticMimeTypes,
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

export const encodedCephBucketMap: { [bucket: string]: string } = {
  "table-applications": "ta",
  "table-images": "ti",
  "table-sound-clips": "tsc",
  "table-svgs": "ts",
  "table-text": "tt",
  "table-videos": "tv",
  "user-applications": "ua",
  "user-images": "ui",
  "user-sound-clips": "usc",
  "user-svgs": "us",
  "user-text": "ut",
  "user-videos": "uv",
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
  | onGetDownloadMetaType
  | onGetFileChunkType
  | onChangeContentStateType
  | onSearchUserContentRequestType
  | onMuteStylesRequestType
  | onDeleteUploadSessionType;

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

export type onMuteStylesRequestType = {
  type: "muteStylesRequest";
  header: {
    userId: string;
    instance: string;
  };
};

export type onGetDownloadMetaType = {
  type: "getDownloadMeta";
  header: {
    userId: string;
    instance: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
};

export type onGetFileChunkType = {
  type: "getFileChunk";
  header: {
    userId: string;
    instance: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    range: string;
  };
};

export type onDeleteUploadSessionType = {
  type: "deleteUploadSession";
  header: {
    uploadId: string;
    contentId: string;
    contentType: StaticContentTypes;
  };
};

export const userConnections: UserConnections = {};
