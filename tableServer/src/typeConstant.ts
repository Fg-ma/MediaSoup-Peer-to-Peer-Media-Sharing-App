import uWS from "uWebSockets.js";

export interface Tables {
  [table_id: string]: {
    [username: string]: {
      [instance: string]: TableWebSocket;
    };
  };
}

export interface TableWebSocket extends uWS.WebSocket<SocketData> {
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
  | onChangeTableBackgroundType;

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

export type onChangeTableBackgroundType = {
  type: "changeTableBackground";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
  data: { background: object };
};

export const tables: Tables = {};
