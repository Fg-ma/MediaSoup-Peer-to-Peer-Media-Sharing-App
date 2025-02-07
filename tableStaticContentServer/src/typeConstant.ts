import uWS from "uWebSockets.js";

export interface Tables {
  [table_id: string]: {
    [username: string]: {
      [instance: string]: TableStaticContentWebSocket;
    };
  };
}

export type TableContentTypes = "video" | "image";

export interface TableContent {
  [table_id: string]: {
    [tableContentType in TableContentTypes]?: {
      [contentId: string]: {
        url?: string;
        dashURL?: string;
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
  | onRequestCatchUpContentDataType
  | onDeleteContentType
  | onCatchUpContentDataResponseType
  | onGetImageType;

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
    inquiringUsername: string;
    inquiringInstance: string;
    contentType: TableContentTypes;
    contentId: string;
  };
};

export type onDeleteContentType = {
  type: "deleteContent";
  header: {
    table_id: string;
    contentType: TableContentTypes;
    contentId: string;
  };
};

export type onCatchUpContentDataResponseType = {
  type: "catchUpContentDataResponse";
  header: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    contentType: TableContentTypes;
    contentId: string;
  };
  data: {
    positioning: {
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    };
    videoTime: number;
    timeMeasured: number;
  };
};

export type onGetImageType = {
  type: "getImage";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
  data: {
    key: string;
  };
};

export const tables: Tables = {};
export const tableContent: TableContent = {};
