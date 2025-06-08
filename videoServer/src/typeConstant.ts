import uWS from "uWebSockets.js";
import { onUpdateVideoPositionType } from "../../mongoServer/src/typeConstant";
import { StaticContentTypes } from "../../universal/contentTypeConstant";

export interface Tables {
  [tableId: string]: {
    [username: string]: {
      [instance: string]: VideoWebSocket;
    };
  };
}

export interface VideoWebSocket extends uWS.WebSocket<SocketData> {
  id: string;
  tableId: string;
  username: string;
  instance: string;
}

export interface SocketData {
  id: string;
  tableId: string;
  username: string;
  instance: string;
}

export type MessageTypes =
  | onJoinTableType
  | onLeaveTableType
  | onGetDownloadMetaType
  | onGetFileChunkType
  | onUpdateVideoPositionType
  | onRequestCatchUpVideoPositionType
  | onResponseCatchUpVideoPositionType
  | onDeleteUploadSessionType
  | onSignalReuploadStartType;

export type onJoinTableType = {
  type: "joinTable";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

export type onLeaveTableType = {
  type: "leaveTable";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

export type onGetDownloadMetaType = {
  type: "getDownloadMeta";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
};

export type onGetFileChunkType = {
  type: "getFileChunk";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    range: string;
  };
};

export type onRequestCatchUpVideoPositionType = {
  type: "requestCatchUpVideoPosition";
  header: {
    tableId: string;
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
    tableId: string;
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

export type onDeleteUploadSessionType = {
  type: "deleteUploadSession";
  header: { uploadId: string };
};

export type onSignalReuploadStartType = {
  type: "signalReuploadStart";
  header: {
    tableId: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
};

export const tables: Tables = {};
