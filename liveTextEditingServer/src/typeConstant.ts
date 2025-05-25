import uWS from "uWebSockets.js";

export interface TableWebSocket extends uWS.WebSocket<SocketData> {
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
  | onGetInitialDocStateType
  | onDocUpdateType
  | onDocSaveType;

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

export type onDocUpdateType = {
  type: "docUpdate";
  header: { tableId: string; contentId: string };
  data: {
    payload: Uint8Array<ArrayBuffer>;
  };
};

export type onGetInitialDocStateType = {
  type: "getInitialDocState";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentId: string;
  };
};

export type onDocSaveType = {
  type: "docSave";
  header: {
    tableId: string;
    contentId: string;
  };
};

export interface Tables {
  [tableId: string]: {
    [username: string]: {
      [instance: string]: TableWebSocket;
    };
  };
}

export const tables: Tables = {};
