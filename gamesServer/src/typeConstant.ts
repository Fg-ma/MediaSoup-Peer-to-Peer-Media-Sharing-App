import uWS from "uWebSockets.js";
import SnakeGame from "./snakeGame/SnakeGame";
import { SnakeColorsType } from "./snakeGame/lib/typeConstant";
import { GameTypes } from "../../universal/contentTypeConstant";

export type SocketTypes = "signaling" | "games";
export const SocketTypesArray = ["signaling", "games"] as const;

export interface Tables {
  [tableId: string]: {
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
  tableId: string;
  username: string;
  instance: string;
  socketType: SocketTypes;
  gameType: GameTypes | undefined;
  gameId: string | undefined;
}

export interface SocketData {
  id: string;
  tableId: string;
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
  | onUpdateContentPositioningType
  | onInitiateGameType
  | onJoinGameType
  | onLeaveGameType
  | onStartGameType
  | onCloseGameType
  | onGetPlayersStateType
  | onGetInitialGameStatesType
  | onSnakeDirectionChangeType
  | onChangeGridSizeType
  | onChangeSnakeColorType;

export type onJoinTableType = {
  type: "joinTable";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

export type onNewGameSocketType = {
  type: "newGameSocket";
  header: {
    tableId: string;
    username: string;
    instance: string;
    gameType: GameTypes;
    gameId: string;
  };
};

export type onLeaveTableType = {
  type: "leaveTable";
  header: {
    tableId: string;
    username: string;
    instance: string;
    socketType: SocketTypes;
    gameType: GameTypes | undefined;
    gameId: string | undefined;
  };
};

// Universal
export type onUpdateContentPositioningType = {
  type: "updateContentPositioning";
  header: {
    tableId: string;
    gameId: string;
  };
  data: {
    positioning: {
      position?: {
        left: number;
        top: number;
      };
      scale?: {
        x: number;
        y: number;
      };
      rotation?: number;
    };
  };
};

export type onInitiateGameType = {
  type: "initiateGame";
  header: {
    tableId: string;
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
    tableId: string;
    gameType: GameTypes;
    gameId: string;
  };
};

export type onCloseGameType = {
  type: "closeGame";
  header: {
    tableId: string;
    gameType: GameTypes;
    gameId: string;
  };
};

export type onJoinGameType = {
  type: "joinGame";
  header: {
    tableId: string;
    username: string;
    instance: string;
    gameType: GameTypes;
    gameId: string;
  };
  data: { snakeColor?: SnakeColorsType };
};

export type onLeaveGameType = {
  type: "leaveGame";
  header: {
    tableId: string;
    username: string;
    instance: string;
    gameType: GameTypes;
    gameId: string;
  };
};

export type onGetPlayersStateType = {
  type: "getPlayersState";
  header: {
    tableId: string;
    username: string;
    instance: string;
    gameType: GameTypes;
    gameId: string;
  };
};

export type onGetInitialGameStatesType = {
  type: "getInitialGameStates";
  header: {
    tableId: string;
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
    tableId: string;
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
    tableId: string;
    gameId: string;
  };
  data: {
    gridSize: number;
  };
};

export type onChangeSnakeColorType = {
  type: "changeSnakeColor";
  header: {
    tableId: string;
    username: string;
    instance: string;
    gameId: string;
  };
  data: {
    newSnakeColor: SnakeColorsType;
  };
};

export type SnakeGames = {
  [tableId: string]: { [snakeGameId: string]: SnakeGame };
};

export const tables: Tables = {};

export const snakeGames: SnakeGames = {};
