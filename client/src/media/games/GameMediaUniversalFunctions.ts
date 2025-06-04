import { GameTypes } from "../../../../universal/contentTypeConstant";

type OutGoingUniversalMessages =
  | {
      type: "newGameSocket";
      header: {
        tableId: string;
        username: string;
        instance: string;
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "leaveTable";
      header: {
        tableId: string;
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
        tableId: string;
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "closeGame";
      header: {
        tableId: string;
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "joinGame";
      header: {
        tableId: string;
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
        tableId: string;
        username: string;
        instance: string;
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "getPlayersState";
      header: {
        tableId: string;
        username: string;
        instance: string;
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "getIntialGameStates";
      header: {
        tableId: string;
        username: string;
        instance: string;
        gameType: GameTypes;
        gameId: string;
      };
    };

class GameMediaUniversalFunctions {
  ws: WebSocket | undefined;

  constructor(
    protected tableId: string,
    protected username: string,
    protected instance: string,
    protected gameType: GameTypes,
    protected gameId: string,
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
        tableId: this.tableId,
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
        tableId: this.tableId,
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
        tableId: this.tableId,
        gameType: this.gameType,
        gameId: this.gameId,
      },
    });
  };

  closeGame = () => {
    this.sendUniversalMessage({
      type: "closeGame",
      header: {
        tableId: this.tableId,
        gameType: this.gameType,
        gameId: this.gameId,
      },
    });
  };

  joinGame = (data: object) => {
    this.sendUniversalMessage({
      type: "joinGame",
      header: {
        tableId: this.tableId,
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
        tableId: this.tableId,
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
        tableId: this.tableId,
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
        tableId: this.tableId,
        username: this.username,
        instance: this.instance,
        gameType: this.gameType,
        gameId: this.gameId,
      },
    });
  };
}

export default GameMediaUniversalFunctions;
