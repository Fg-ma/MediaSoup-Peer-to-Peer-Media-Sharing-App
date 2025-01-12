import uWS from "uWebSockets.js";

export type TableColors =
  | "cyan"
  | "orange"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "pink"
  | "black"
  | "white"
  | "brown"
  | "lime"
  | "coral"
  | "gray"
  | "navy"
  | "lightBlue"
  | "tableTop";

export interface Tables {
  [table_id: string]: {
    [username: string]: {
      [instance: string]: TableWebSocket;
    };
  };
}

export interface TablesUserData {
  [table_id: string]: {
    [username: string]: { color: TableColors; seat: number };
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

export const TableColorMap: {
  [tableColor in TableColors]: { primary: string; secondary: string };
} = {
  cyan: { primary: "#1a8ca2", secondary: "#336b7b" },
  orange: { primary: "#f78528", secondary: "#ef6900" },
  blue: { primary: "#1d69ca", secondary: "#1a1f6b" },
  green: { primary: "#00763a", secondary: "#123324" },
  yellow: { primary: "#e0c240", secondary: "#f7b705" },
  purple: { primary: "#d4afdc", secondary: "#987fdd" },
  pink: { primary: "#f77cf7", secondary: "#ed75d0" },
  black: { primary: "#221d1e", secondary: "#0c0001" },
  white: { primary: "#f6eded", secondary: "#e0d8d8" },
  brown: { primary: "#5c423b", secondary: "#372b27" },
  lime: { primary: "#bad95f", secondary: "#a0c15c" },
  coral: { primary: "#f28a85", secondary: "#f7423b" },
  gray: { primary: "#6a5d5e", secondary: "#483f40" },
  navy: { primary: "#252c48", secondary: "#313246" },
  lightBlue: { primary: "#88c3e7", secondary: "#61b4dd" },
  tableTop: { primary: "#d40213", secondary: "#b10203" },
};

export const tablesUserData: TablesUserData = {};

export const tableSeatingChart = {
  1: [1],
  2: [1, 9],
  3: [1, 9, 2],
  4: [1, 5, 9, 13],
  5: [1, 2, 5, 9, 13],
  6: [1, 2, 5, 9, 10, 13],
  7: [1, 2, 3, 5, 9, 10, 13],
  8: [1, 2, 5, 6, 9, 10, 13, 14],
  9: [1, 2, 3, 5, 6, 9, 10, 13, 14],
  10: [1, 2, 3, 5, 6, 9, 10, 11, 13, 14],
  11: [1, 2, 3, 4, 5, 6, 9, 10, 11, 13, 14],
  12: [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15],
  13: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 15],
  14: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15],
  15: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16],
  16: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
};
