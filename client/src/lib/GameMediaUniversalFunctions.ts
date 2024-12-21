import { GameTypes } from "../context/mediaContext/typeConstant";

type OutGoingUniversalMessages =
  | {
      type: "newGameSocket";
      data: {
        table_id: string;
        username: string;
        instance: string;
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "leaveTable";
      data: {
        table_id: string;
        username: string;
        instance: string;
        socketType: "games";
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "startGame";
      data: {
        table_id: string;
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "closeGame";
      data: {
        table_id: string;
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "joinGame";
      data: {
        table_id: string;
        username: string;
        instance: string;
        gameType: GameTypes;
        gameId: string;
        data: object;
      };
    }
  | {
      type: "leaveGame";
      data: {
        table_id: string;
        username: string;
        instance: string;
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "getPlayersState";
      data: {
        table_id: string;
        username: string;
        instance: string;
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "getIntialGameStates";
      data: {
        table_id: string;
        username: string;
        instance: string;
        gameType: GameTypes;
        gameId: string;
      };
    };

class GameMediaUniversalFunctions {
  ws: WebSocket | undefined;

  constructor(
    protected table_id: string,
    protected username: string,
    protected instance: string,
    protected gameType: GameTypes,
    protected gameId: string
  ) {}

  sendUniversalMessage = (message: OutGoingUniversalMessages) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  };

  newGameSocket = () => {
    this.sendUniversalMessage({
      type: "newGameSocket",
      data: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        gameType: this.gameType,
        gameId: this.gameId,
      },
    });
  };

  leaveTable = () => {
    this.sendUniversalMessage({
      type: "leaveTable",
      data: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        socketType: "games",
        gameType: this.gameType,
        gameId: this.gameId,
      },
    });
  };

  startGame = () => {
    this.sendUniversalMessage({
      type: "startGame",
      data: {
        table_id: this.table_id,
        gameType: this.gameType,
        gameId: this.gameId,
      },
    });
  };

  closeGame = () => {
    this.sendUniversalMessage({
      type: "closeGame",
      data: {
        table_id: this.table_id,
        gameType: this.gameType,
        gameId: this.gameId,
      },
    });
  };

  joinGame = (data: object) => {
    this.sendUniversalMessage({
      type: "joinGame",
      data: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        gameType: this.gameType,
        gameId: this.gameId,
        data,
      },
    });
  };

  leaveGame = () => {
    this.sendUniversalMessage({
      type: "leaveGame",
      data: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        gameType: this.gameType,
        gameId: this.gameId,
      },
    });
  };

  getPlayersState = () => {
    this.sendUniversalMessage({
      type: "getPlayersState",
      data: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        gameType: this.gameType,
        gameId: this.gameId,
      },
    });
  };

  getIntialGameStates = () => {
    this.sendUniversalMessage({
      type: "getIntialGameStates",
      data: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        gameType: this.gameType,
        gameId: this.gameId,
      },
    });
  };
}

export default GameMediaUniversalFunctions;
