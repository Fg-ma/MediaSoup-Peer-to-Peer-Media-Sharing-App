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

export interface TablesUserColors {
  [table_id: string]: {
    [username: string]: TableColors;
  };
}

export interface TablesSeating {
  [table_id: string]: {
    [username: string]: number;
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
  cyan: { primary: "", secondary: "" },
  orange: { primary: "", secondary: "" },
  blue: { primary: "", secondary: "" },
  green: { primary: "", secondary: "" },
  yellow: { primary: "", secondary: "" },
  purple: { primary: "", secondary: "" },
  pink: { primary: "", secondary: "" },
  black: { primary: "", secondary: "" },
  white: { primary: "", secondary: "" },
  brown: { primary: "", secondary: "" },
  lime: { primary: "", secondary: "" },
  coral: { primary: "", secondary: "" },
  gray: { primary: "", secondary: "" },
  navy: { primary: "", secondary: "" },
  lightBlue: { primary: "", secondary: "" },
  tableTop: { primary: "", secondary: "" },
};

export const tablesUserColors: TablesUserColors = {};

export const tablesSeating: TablesSeating = {};

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
