import BundlesController from "../../lib/BundlesController";
import {
  GameTypes,
  UserMediaType,
} from "../../context/mediaContext/typeConstant";
import SnakeGameMedia from "./snakeGame/SnakeGameMedia";

type OutGoingMessages = onJoinTableType | onLeaveTableType | onInitiateGameType;

type onJoinTableType = {
  type: "joinTable";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

type onLeaveTableType = {
  type: "leaveTable";
  header: {
    table_id: string;
    username: string;
    instance: string;
    socketType: "signaling";
  };
};

type onInitiateGameType = {
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

type IncomingMessages =
  | onGameInitiatedType
  | onGameClosedType
  | onUserJoinedTableType;

type onGameInitiatedType = {
  type: "gameInitiated";
  header: {
    gameType: GameTypes;
    gameId: string;
  };
  data: {
    initiator: { username: string; instance: string };
  };
};

type onGameClosedType = {
  type: "gameClosed";
  header: {
    gameType: GameTypes;
    gameId: string;
  };
};

type onUserJoinedTableType = {
  type: "userJoinedTable";
  data: {
    activeGames: { gameType: GameTypes; gameId: string }[];
  };
};

class GamesSignalingMedia {
  protected ws: WebSocket | undefined;
  private messageListeners: Set<(message: MessageEvent) => void> = new Set();

  constructor(
    private table_id: string,
    private username: string,
    private instance: string,
    private url: string,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private bundlesController: BundlesController
  ) {
    this.connect(this.url);
  }

  deconstructor = () => {
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.leaveTable();
      }

      this.ws.close();
      this.ws.onmessage = null;
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
    }

    this.messageListeners.clear();
  };

  private connect = (url: string) => {
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      this.handleMessage(message);
      this.messageListeners.forEach((listener) => {
        listener(event);
      });
    };

    this.ws.onopen = () => {
      this.joinTable();
    };
  };

  addMessageListener = (listener: (message: MessageEvent) => void): void => {
    this.messageListeners.add(listener);
  };

  removeMessageListener = (listener: (message: MessageEvent) => void): void => {
    this.messageListeners.delete(listener);
  };

  sendMessage = (message: OutGoingMessages) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  };

  handleMessage = (event: IncomingMessages) => {
    switch (event.type) {
      case "gameInitiated":
        this.onGameInitiated(event);
        break;
      case "gameClosed":
        this.onGameClosed(event);
        break;
      case "userJoinedTable":
        this.onUserJoinedTable(event);
        break;
      default:
        break;
    }
  };

  onGameInitiated = async (event: onGameInitiatedType) => {
    const { gameType, gameId } = event.header;
    const { initiator } = event.data;

    switch (gameType) {
      case "snake": {
        if (!this.userMedia.current.games.snake) {
          this.userMedia.current.games.snake = {};
        }
        const snakeGameMedia = new SnakeGameMedia(
          this.table_id,
          this.username,
          this.instance,
          gameId,
          "https://localhost:8042",
          initiator.username === this.username &&
            initiator.instance === this.instance
        );
        await snakeGameMedia.connect();

        this.userMedia.current.games.snake[gameId] = snakeGameMedia;
        break;
      }
    }
  };

  onGameClosed = (event: onGameClosedType) => {
    const { gameType, gameId } = event.header;

    switch (gameType) {
      case "snake":
        {
          if (
            this.userMedia.current.games.snake &&
            this.userMedia.current.games.snake[gameId]
          ) {
            this.userMedia.current.games.snake[gameId].destructor();
            delete this.userMedia.current.games.snake[gameId];

            if (Object.keys(this.userMedia.current.games.snake).length === 0) {
              delete this.userMedia.current.games.snake;
            }
          }
        }
        break;
      default:
        break;
    }

    this.bundlesController.cleanUpProducerBundle();
  };

  onUserJoinedTable = (event: onUserJoinedTableType) => {
    const { activeGames } = event.data;

    activeGames.map(async (activeGame) => {
      switch (activeGame.gameType) {
        case "snake": {
          if (!this.userMedia.current.games.snake) {
            this.userMedia.current.games.snake = {};
          }
          const snakeGameMedia = new SnakeGameMedia(
            this.table_id,
            this.username,
            this.instance,
            activeGame.gameId,
            "ws://localhost:8042",
            false
          );
          await snakeGameMedia.connect();

          this.userMedia.current.games.snake[activeGame.gameId] =
            snakeGameMedia;
          break;
        }
      }
    });
  };

  joinTable = () => {
    this.sendMessage({
      type: "joinTable",
      header: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
      },
    });
  };

  leaveTable = () => {
    this.sendMessage({
      type: "leaveTable",
      header: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        socketType: "signaling",
      },
    });
  };

  initiateGame = (gameType: GameTypes, gameId: string) => {
    this.sendMessage({
      type: "initiateGame",
      header: {
        table_id: this.table_id,
        gameType,
        gameId,
      },
      data: {
        initiator: { username: this.username, instance: this.instance },
      },
    });
  };
}

export default GamesSignalingMedia;
