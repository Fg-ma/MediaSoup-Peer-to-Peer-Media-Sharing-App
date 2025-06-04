import BundlesController from "../../lib/BundlesController";
import { StaticContentMediaType } from "../../context/mediaContext/lib/typeConstant";
import SnakeGameMedia from "../../media/games/snakeGame/SnakeGameMedia";
import {
  IncomingMessages,
  onGameClosedType,
  onGameInitiatedType,
  onUserJoinedTableType,
  OutGoingMessages,
} from "./lib/typeConstant";
import { GameTypes } from "../../../../universal/contentTypeConstant";

class GamesServerController {
  protected ws: WebSocket | undefined;
  private messageListeners: Set<(message: MessageEvent) => void> = new Set();

  constructor(
    private tableId: string,
    private username: string,
    private instance: string,
    private url: string,
    private staticContentMedia: React.MutableRefObject<StaticContentMediaType>,
    private bundlesController: React.MutableRefObject<BundlesController>,
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
        if (!this.staticContentMedia.current.games.snake) {
          this.staticContentMedia.current.games.snake = {};
        }
        const snakeGameMedia = new SnakeGameMedia(
          this.tableId,
          this.username,
          this.instance,
          gameId,
          "https://localhost:8042",
          initiator.username === this.username &&
            initiator.instance === this.instance,
        );

        this.staticContentMedia.current.games.snake[gameId] = snakeGameMedia;
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
            this.staticContentMedia.current.games.snake &&
            this.staticContentMedia.current.games.snake[gameId]
          ) {
            this.staticContentMedia.current.games.snake[gameId].destructor();
            delete this.staticContentMedia.current.games.snake[gameId];

            if (
              Object.keys(this.staticContentMedia.current.games.snake)
                .length === 0
            ) {
              delete this.staticContentMedia.current.games.snake;
            }
          }
        }
        break;
      default:
        break;
    }

    this.bundlesController.current.cleanUpProducerBundle();
  };

  onUserJoinedTable = (event: onUserJoinedTableType) => {
    const { activeGames } = event.data;

    activeGames.map(async (activeGame) => {
      switch (activeGame.gameType) {
        case "snake": {
          if (!this.staticContentMedia.current.games.snake) {
            this.staticContentMedia.current.games.snake = {};
          }
          const snakeGameMedia = new SnakeGameMedia(
            this.tableId,
            this.username,
            this.instance,
            activeGame.gameId,
            "https://localhost:8042",
            false,
            activeGame.positioning,
          );

          this.staticContentMedia.current.games.snake[activeGame.gameId] =
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
        tableId: this.tableId,
        username: this.username,
        instance: this.instance,
      },
    });
  };

  leaveTable = () => {
    this.sendMessage({
      type: "leaveTable",
      header: {
        tableId: this.tableId,
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
        tableId: this.tableId,
        gameType,
        gameId,
      },
      data: {
        initiator: { username: this.username, instance: this.instance },
      },
    });
  };

  updateContentPositioning = (
    gameType: GameTypes,
    gameId: string,
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
    },
  ) => {
    this.sendMessage({
      type: "updateContentPositioning",
      header: {
        tableId: this.tableId,
        gameType,
        gameId,
      },
      data: {
        positioning,
      },
    });
  };
}

export default GamesServerController;
