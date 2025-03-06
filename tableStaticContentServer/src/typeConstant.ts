import uWS from "uWebSockets.js";
import { ImageEffectStylesType } from "../../mongoServer/src/lib/images/typeConstant";
import { ApplicationEffectStylesType } from "../../mongoServer/src/lib/applications/typeConstant";
import { VideoEffectStylesType } from "../../mongoServer/src/lib/videos/typeConstant";
import { onUpdateVideoPositionType } from "../../mongoServer/src/typeConstant";
import { StaticContentTypes } from "../../universal/typeConstant";

export interface Tables {
  [table_id: string]: {
    [username: string]: {
      [instance: string]: TableStaticContentWebSocket;
    };
  };
}

export type TableTopStaticMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif"
  | "image/svg+xml"
  | "image/bmp"
  | "image/tiff"
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

export const mimeToExtension: { [key: string]: string } = {
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
  | onResponseCatchUpVideoPositionType;

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
  };
  data: {
    effects: {
      [effectType: string]: boolean;
    };
    effectStyles?:
      | VideoEffectStylesType
      | ImageEffectStylesType
      | ApplicationEffectStylesType;
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
  };
  data: {
    currentVideoPosition: number;
  };
};

export const tables: Tables = {};
