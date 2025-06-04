import { GameTypes } from "../../../../../universal/contentTypeConstant";

export type OutGoingMessages =
  | onJoinTableType
  | onLeaveTableType
  | onInitiateGameType
  | onUpdateContentPositioningType;

type onJoinTableType = {
  type: "joinTable";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

type onLeaveTableType = {
  type: "leaveTable";
  header: {
    tableId: string;
    username: string;
    instance: string;
    socketType: "signaling";
  };
};

type onInitiateGameType = {
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

type onUpdateContentPositioningType = {
  type: "updateContentPositioning";
  header: {
    tableId: string;
    gameType: GameTypes;
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

export type IncomingMessages =
  | onGameInitiatedType
  | onGameClosedType
  | onUserJoinedTableType;

export type onGameInitiatedType = {
  type: "gameInitiated";
  header: {
    gameType: GameTypes;
    gameId: string;
  };
  data: {
    initiator: { username: string; instance: string };
  };
};

export type onGameClosedType = {
  type: "gameClosed";
  header: {
    gameType: GameTypes;
    gameId: string;
  };
};

export type onUserJoinedTableType = {
  type: "userJoinedTable";
  data: {
    activeGames: {
      gameType: GameTypes;
      gameId: string;
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
    }[];
  };
};
