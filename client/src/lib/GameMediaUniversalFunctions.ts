import { GameTypes } from "../context/mediaContext/typeConstant";

type OutGoingUniversalMessages =
  | {
      type: "newGameSocket";
      header: {
        table_id: string;
        username: string;
        instance: string;
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "leaveTable";
      header: {
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
      header: {
        table_id: string;
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "closeGame";
      header: {
        table_id: string;
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "joinGame";
      header: {
        table_id: string;
        username: string;
        instance: string;
        gameType: GameTypes;
        gameId: string;
      };
      data: object;
    }
  | {
      type: "leaveGame";
      header: {
        table_id: string;
        username: string;
        instance: string;
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "getPlayersState";
      header: {
        table_id: string;
        username: string;
        instance: string;
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "getIntialGameStates";
      header: {
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
      header: {
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
      header: {
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
      header: {
        table_id: this.table_id,
        gameType: this.gameType,
        gameId: this.gameId,
      },
    });
  };

  closeGame = () => {
    this.sendUniversalMessage({
      type: "closeGame",
      header: {
        table_id: this.table_id,
        gameType: this.gameType,
        gameId: this.gameId,
      },
    });
  };

  joinGame = (data: object) => {
    this.sendUniversalMessage({
      type: "joinGame",
      header: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        gameType: this.gameType,
        gameId: this.gameId,
      },
      data,
    });
  };

  leaveGame = () => {
    this.sendUniversalMessage({
      type: "leaveGame",
      header: {
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
      header: {
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
      header: {
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
