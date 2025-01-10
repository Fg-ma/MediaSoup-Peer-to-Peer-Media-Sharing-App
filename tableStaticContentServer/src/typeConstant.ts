import uWS from "uWebSockets.js";

export interface Tables {
  [table_id: string]: {
    [username: string]: {
      [instance: string]: TableStaticContentWebSocket;
    };
  };
}

export type TableContentTypes = "video";

export interface TableContent {
  [table_id: string]: {
    [tableContentType in TableContentTypes]?: {
      [contentId: string]: {
        url: string;
      };
    };
  };
}

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
  | onRequestCatchUpContentDataType;

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

export type onRequestCatchUpContentDataType = {
  type: "requestCatchUpContentData";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

export const tables: Tables = {};
export const tableContent: TableContent = {};
