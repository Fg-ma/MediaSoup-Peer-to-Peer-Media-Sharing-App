import uWS from "uWebSockets.js";

export type SocketTypes = "signaling" | "games";

export type GameTypes = "snake";

export interface Tables {
  [table_id: string]: {
    [username: string]: {
      [instance: string]: {
        signaling?: GameWebSocket;
        games: {
          [gameType in GameTypes]?: { [gameId: string]: GameWebSocket };
        };
      };
    };
  };
}

export interface GameWebSocket extends uWS.WebSocket<SocketData> {
  id: string;
  table_id: string;
  username: string;
  instance: string;
  socketType: SocketTypes;
  gameType: GameTypes | undefined;
  gameId: string | undefined;
}

export interface SocketData {
  id: string;
  table_id: string;
  username: string;
  instance: string;
}

export const tables: Tables = {};
