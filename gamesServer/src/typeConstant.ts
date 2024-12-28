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
  | onNewGameSocketType
  | onLeaveTableType
  | onInitiateGameType
  | onJoinGameType
  | onLeaveGameType
  | onStartGameType
  | onCloseGameType
  | onGetPlayersStateType
  | onGetIntialGameStatesType
  | onSnakeDirectionChangeType
  | onChangeGridSizeType
  | onChangeSnakeColorType;

export type onJoinTableType = {
  type: "joinTable";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

export type onNewGameSocketType = {
  type: "newGameSocket";
  header: {
    table_id: string;
    username: string;
    instance: string;
    gameType: GameTypes;
    gameId: string;
  };
};

export type onLeaveTableType = {
  type: "leaveTable";
  header: {
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
  header: {
    table_id: string;
    gameType: GameTypes;
    gameId: string;
  };
  data: {
    initiator: { username: string; instance: string };
  };
};

export type onStartGameType = {
  type: "startGame";
  header: {
    table_id: string;
    gameType: GameTypes;
    gameId: string;
  };
};

export type onCloseGameType = {
  type: "closeGame";
  header: {
    table_id: string;
    gameType: GameTypes;
    gameId: string;
  };
};

export type onJoinGameType = {
  type: "joinGame";
  header: {
    table_id: string;
    username: string;
    instance: string;
    gameType: GameTypes;
    gameId: string;
  };
  data: object;
};

export type onLeaveGameType = {
  type: "leaveGame";
  header: {
    table_id: string;
    username: string;
    instance: string;
    gameType: GameTypes;
    gameId: string;
  };
};

export type onGetPlayersStateType = {
  type: "getPlayersState";
  header: {
    table_id: string;
    username: string;
    instance: string;
    gameType: GameTypes;
    gameId: string;
  };
};

export type onGetIntialGameStatesType = {
  type: "getIntialGameStates";
  header: {
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
  header: {
    table_id: string;
    username: string;
    instance: string;
    gameId: string;
  };
  data: {
    direction: "up" | "down" | "left" | "right";
  };
};

export type onChangeGridSizeType = {
  type: "changeGridSize";
  header: {
    table_id: string;
    gameId: string;
  };
  data: {
    gridSize: number;
  };
};

export type onChangeSnakeColorType = {
  type: "changeSnakeColor";
  header: {
    table_id: string;
    username: string;
    instance: string;
    gameId: string;
  };
  data: {
    newSnakeColor: SnakeColorsType;
  };
};

export type SnakeGames = {
  [table_id: string]: { [snakeGameId: string]: SnakeGame };
};

export const tables: Tables = {};

export const snakeGames: SnakeGames = {};
