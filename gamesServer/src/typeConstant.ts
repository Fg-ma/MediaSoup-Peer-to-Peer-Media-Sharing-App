import uWS from "uWebSockets.js";
import SnakeGame from "./lib/SnakeGame";

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
  | onStageGame
  | onGameStart
  | onSnakeDirectionChangeType
  | onAddSnakeType;

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

export type onStageGame = {
  type: "stageGame";
  data: {
    table_id: string;
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

export type onAddSnakeType = {
  type: "addSnake";
  data: {
    table_id: string;
    username: string;
    instance: string;
    gameId: string;
  };
};

export type SnakeGames = {
  [table_id: string]: { [snakeGameId: string]: SnakeGame };
};

export const tables: Tables = {};

export const snakeGames: SnakeGames = {};
