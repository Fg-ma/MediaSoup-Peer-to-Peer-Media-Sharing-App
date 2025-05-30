import uWS from "uWebSockets.js";
import { ContentTypes } from "../../universal/contentTypeConstant";
import {
  TableReactions,
  TableReactionStyles,
} from "../../universal/reactionsTypeConstant";

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

export const tableColorEncodingMap = {
  cyan: 0,
  orange: 1,
  blue: 2,
  green: 3,
  yellow: 4,
  purple: 5,
  pink: 6,
  black: 7,
  white: 8,
  brown: 9,
  lime: 10,
  coral: 11,
  gray: 12,
  navy: 13,
  lightBlue: 14,
  tableTop: 15,
};

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
  | onChangeTableBackgroundType
  | onMoveSeatsType
  | onSwapSeatsType
  | onKickFromTableType
  | onReactionType;

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

export type onChangeTableBackgroundType = {
  type: "changeTableBackground";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
  data: { background: object };
};

export type onMoveSeatsType = {
  type: "moveSeats";
  header: {
    tableId: string;
    username: string;
  };
  data: { direction: "left" | "right" };
};

export type onSwapSeatsType = {
  type: "swapSeats";
  header: {
    tableId: string;
    username: string;
    targetUsername: string;
  };
};

export type onKickFromTableType = {
  type: "kickFromTable";
  header: {
    tableId: string;
    username: string;
    targetUsername: string;
  };
};

export type onReactionType = {
  type: "reaction";
  header: {
    tableId: string;
    contentType: ContentTypes;
    contentId: string | undefined;
    instanceId: string | undefined;
  };
  data: { reaction: TableReactions; reactionStyle: TableReactionStyles };
};

export const tableColorMap: {
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

export const tableSeatingChart = {
  1: { seats: [1], swaps: [] },
  2: { seats: [1, 9], swaps: [] },
  3: { seats: [1, 2, 9], swaps: [] },
  4: { seats: [1, 5, 9, 13], swaps: [{ from: 2, to: 5 }] },
  5: { seats: [1, 2, 5, 9, 13], swaps: [] },
  6: { seats: [1, 2, 5, 9, 10, 13], swaps: [] },
  7: { seats: [1, 2, 3, 5, 9, 10, 13], swaps: [] },
  8: { seats: [1, 2, 5, 6, 9, 10, 13, 14], swaps: [{ from: 3, to: 6 }] },
  9: { seats: [1, 2, 3, 5, 6, 9, 10, 13, 14], swaps: [] },
  10: { seats: [1, 2, 3, 5, 6, 9, 10, 11, 13, 14], swaps: [] },
  11: { seats: [1, 2, 3, 4, 5, 6, 9, 10, 11, 13, 14], swaps: [] },
  12: {
    seats: [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15],
    swaps: [{ from: 4, to: 7 }],
  },
  13: { seats: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 15], swaps: [] },
  14: { seats: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15], swaps: [] },
  15: {
    seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    swaps: [],
  },
  16: {
    seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    swaps: [],
  },
};

export interface Tables {
  [tableId: string]: {
    [username: string]: {
      [instance: string]: TableWebSocket;
    };
  };
}

export interface TableUserData {
  color: string;
  seat: number;
  online: boolean;
}

export interface TablesUserData {
  [tableId: string]: {
    [username: string]: TableUserData;
  };
}

export const tables: Tables = {};
export const tablesUserData: TablesUserData = {};
