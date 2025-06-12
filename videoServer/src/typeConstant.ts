import uWS from "uWebSockets.js";

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
  | onUpdateVideoMetadataType
  | onRequestCatchUpVideoMetadataType
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

export type onUpdateVideoMetadataType = {
  type: "updateVideoMetadata";
  header: {
    tableId: string;
    contentId: string;
    instanceId: string;
  };
  data: {
    isPlaying: boolean;
    videoPosition: number;
    videoPlaybackSpeed: number;
    ended: boolean;
  };
};

export type onRequestCatchUpVideoMetadataType = {
  type: "requestCatchUpVideoMetadata";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentId: string;
    instanceId: string;
  };
};

export type onDeleteUploadSessionType = {
  type: "deleteUploadSession";
  header: {
    uploadId: string;
    contentId: string;
  };
};

export type onSignalReuploadStartType = {
  type: "signalReuploadStart";
  header: {
    tableId: string;
    contentId: string;
  };
};

export const tables: Tables = {};
