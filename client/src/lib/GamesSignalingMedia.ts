import BundlesController from "src/lib/BundlesController";
import { GameTypes, UserMediaType } from "../context/mediaContext/typeConstant";
import SnakeGameMedia from "./SnakeGameMedia";

type OutGoingMessages = onJoinTableType | onLeaveTableType | onInitiateGameType;

type onJoinTableType = {
  type: "joinTable";
  data: {
    table_id: string;
    username: string;
    instance: string;
  };
};

type onLeaveTableType = {
  type: "leaveTable";
  data: {
    table_id: string;
    username: string;
    instance: string;
    socketType: "signaling";
  };
};

type onInitiateGameType = {
  type: "initiateGame";
  data: {
    table_id: string;
    gameType: GameTypes;
    gameId: string;
    initiator: { username: string; instance: string };
  };
};

type IncomingMessages =
  | onGameInitiatedType
  | onGameClosedType
  | onUserJoinedTableType;

type onGameInitiatedType = {
  type: "gameInitiated";
  data: {
    gameType: GameTypes;
    gameId: string;
    initiator: { username: string; instance: string };
  };
};

type onGameClosedType = {
  type: "gameClosed";
  data: {
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
  private ws: WebSocket | undefined;

  constructor(
    private table_id: string,
    private username: string,
    private instance: string,
    private url: string,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private bundles: {
      [username: string]: { [instance: string]: React.JSX.Element };
    },
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
  };

  private connect = (url: string) => {
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onopen = () => {
      this.joinTable();
    };
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
    const { gameType, gameId, initiator } = event.data;

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
          "ws://localhost:8042",
          initiator.username === this.username &&
            initiator.instance === this.instance
        );
        await snakeGameMedia.connect();

        this.userMedia.current.games.snake[gameId] = snakeGameMedia;

        if (
          !this.bundles[this.username] ||
          !Object.keys(this.bundles[this.username]).includes(this.instance)
        ) {
          this.bundlesController.createProducerBundle();
        }
        break;
      }
    }
  };

  onGameClosed = (event: onGameClosedType) => {
    const { gameType, gameId } = event.data;

    switch (gameType) {
      case "snake":
        {
          if (
            this.userMedia.current.games.snake &&
            this.userMedia.current.games.snake[gameId]
          ) {
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

          if (
            !this.bundles[this.username] ||
            !Object.keys(this.bundles[this.username]).includes(this.instance)
          ) {
            this.bundlesController.createProducerBundle();
          }
          break;
        }
      }
    });
  };

  joinTable = () => {
    this.sendMessage({
      type: "joinTable",
      data: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
      },
    });
  };

  leaveTable = () => {
    this.sendMessage({
      type: "leaveTable",
      data: {
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
      data: {
        table_id: this.table_id,
        gameType,
        gameId,
        initiator: { username: this.username, instance: this.instance },
      },
    });
  };
}

export default GamesSignalingMedia;
