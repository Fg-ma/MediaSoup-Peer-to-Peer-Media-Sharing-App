import uWS from "uWebSockets.js";
import { onUpdateVideoPositionType } from "../../mongoServer/src/typeConstant";
import {
  ContentStateTypes,
  StaticContentTypes,
} from "../../universal/contentTypeConstant";
import {
  ApplicationEffectStylesType,
  ImageEffectStylesType,
  SvgEffectStylesType,
  VideoEffectStylesType,
} from "../../universal/effectsTypeConstant";

export interface Tables {
  [table_id: string]: {
    [username: string]: {
      [instance: string]: TableStaticContentWebSocket;
    };
  };
}

export const contentTypeBucketMap: {
  [staticContentType in StaticContentTypes]: string;
} = {
  video: "table-videos",
  image: "table-images",
  svg: "table-svgs",
  application: "table-applications",
  text: "table-text",
  soundClip: "table-sound-clips",
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

export interface TableStaticContentWebSocket extends uWS.WebSocket<SocketData> {
  id: string;
  table_id: string;
  username: string;
  instance: string;
}

export interface SocketData {
  id: string;
  table_id: string;
  username: string;
  instance: string;
}

export type MessageTypes =
  | onJoinTableType
  | onLeaveTableType
  | onRequestCatchUpTableDataType
  | onDeleteContentType
  | onGetFileType
  | onUpdateContentPositioningType
  | onUpdateContentEffectsType
  | onUpdateVideoPositionType
  | onRequestCatchUpVideoPositionType
  | onResponseCatchUpVideoPositionType
  | onChangeContentStateType;

export type onJoinTableType = {
  type: "joinTable";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

export type onLeaveTableType = {
  type: "leaveTable";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

export type onRequestCatchUpTableDataType = {
  type: "requestCatchUpTableData";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

export type onDeleteContentType = {
  type: "deleteContent";
  header: {
    table_id: string;
    contentType: StaticContentTypes;
    contentId: string;
    instanceId: string;
  };
  data: {
    filename: string;
  };
};

export type onGetFileType = {
  type: "getFile";
  header: {
    table_id: string;
    username: string;
    instance: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    key: string;
  };
};

export type onUpdateContentPositioningType = {
  type: "updateContentPositioning";
  header: {
    table_id: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    positioning: {
      position?: {
        left: number;
        top: number;
      };
      scale?: {
        x: number;
        y: number;
      };
      rotation?: number;
    };
  };
};

export type onUpdateContentEffectsType = {
  type: "updateContentEffects";
  header: {
    table_id: string;
    contentType: StaticContentTypes;
    contentId: string;
    instanceId: string;
  };
  data: {
    effects: {
      [effectType: string]: boolean;
    };
    effectStyles?:
      | VideoEffectStylesType
      | ImageEffectStylesType
      | ApplicationEffectStylesType
      | SvgEffectStylesType;
  };
};

export type onRequestCatchUpVideoPositionType = {
  type: "requestCatchUpVideoPosition";
  header: {
    table_id: string;
    username: string;
    instance: string;
    contentType: "video";
    contentId: string;
    instanceId: string;
  };
};

export type onResponseCatchUpVideoPositionType = {
  type: "responseCatchUpVideoPosition";
  header: {
    table_id: string;
    username: string;
    instance: string;
    contentType: "video";
    contentId: string;
    instanceId: string;
  };
  data: {
    currentVideoPosition: number;
  };
};

export type onChangeContentStateType = {
  type: "changeContentState";
  header: {
    table_id: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    state: ContentStateTypes[];
  };
};

export const tables: Tables = {};
