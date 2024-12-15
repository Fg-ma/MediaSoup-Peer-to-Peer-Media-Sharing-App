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
  socketType: SocketTypes;
  gameType: GameTypes | undefined;
  gameId: string | undefined;
}

export type MessageTypes =
  | onJoinTableType
  | onLeaveTableType
  | onInitiateGameType
  | onGameStart
  | onSnakeDirectionChangeType;

export type onJoinTableType = {
  type: "joinTable";
  data: {
    table_id: string;
    username: string;
    instance: string;
    socketType: SocketTypes;
    gameType: GameTypes | undefined;
    gameId: string | undefined;
  };
};

export type onLeaveTableType = {
  type: "leaveTable";
  data: {
    table_id: string;
    username: string;
    instance: string;
    socketType: SocketTypes;
    gameType: GameTypes | undefined;
    gameId: string | undefined;
  };
};

// Universal
export type onInitiateGameType = {
  type: "initiateGame";
  data: {
    table_id: string;
    username: string;
    instance: string;
    gameType: GameTypes;
    gameId: string;
  };
};

export type onGameStart = {
  type: "gameStart";
  data: {
    table_id: string;
    gameType: GameTypes;
    gameId: string;
    initialGameState: object;
  };
};

// Snake Game
export type onSnakeDirectionChangeType = {
  type: "snakeDirectionChange";
  data: {
    table_id: string;
    username: string;
    instance: string;
    gameId: string;
    direction: "up" | "down" | "left" | "right";
  };
};

export const tables: Tables = {};
