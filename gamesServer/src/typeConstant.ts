import uWS from "uWebSockets.js";
import SnakeGame from "./snakeGame/SnakeGame";
import { SnakeColorsType } from "./snakeGame/lib/typeConstant";

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
  | onStageGameType
  | onStartGameType
  | onCloseGameType
  | onSnakeDirectionChangeType
  | onChangeGridSizeType
  | onJoinGameType
  | onLeaveGameType
  | onChangeSnakeColorType;

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
    gameType: GameTypes;
    gameId: string;
  };
};

export type onStageGameType = {
  type: "stageGame";
  data: {
    table_id: string;
    gameType: GameTypes;
    gameId: string;
  };
};

export type onStartGameType = {
  type: "startGame";
  data: {
    table_id: string;
    gameType: GameTypes;
    gameId: string;
  };
};

export type onCloseGameType = {
  type: "closeGame";
  data: {
    table_id: string;
    gameType: GameTypes;
    gameId: string;
  };
};

export type onJoinGameType = {
  type: "joinGame";
  data: {
    table_id: string;
    username: string;
    instance: string;
    gameType: GameTypes;
    gameId: string;
  };
};

export type onLeaveGameType = {
  type: "leaveGame";
  data: {
    table_id: string;
    username: string;
    instance: string;
    gameType: GameTypes;
    gameId: string;
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

export type onChangeGridSizeType = {
  type: "changeGridSize";
  data: {
    table_id: string;
    gameId: string;
    gridSize: number;
  };
};

export type onChangeSnakeColorType = {
  type: "changeSnakeColor";
  data: {
    table_id: string;
    username: string;
    instance: string;
    gameId: string;
    newSnakeColor: SnakeColorsType;
  };
};

export type SnakeGames = {
  [table_id: string]: { [snakeGameId: string]: SnakeGame };
};

export const tables: Tables = {};

export const snakeGames: SnakeGames = {};
