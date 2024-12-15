import { GameTypes, UserMediaType } from "../context/mediaContext/typeConstant";
import SnakeGameMedia from "./SnakeGameMedia";

type OutGoingMessages =
  | {
      type: "joinTable";
      data: {
        table_id: string;
        username: string;
        instance: string;
        socketType: "signaling";
      };
    }
  | {
      type: "leaveTable";
      data: {
        table_id: string;
        username: string;
        instance: string;
        socketType: "signaling";
      };
    }
  | {
      type: "initiateGame";
      data: {
        table_id: string;
        username: string;
        instance: string;
        gameType: GameTypes;
        gameId: string;
      };
    };

type IncomingMessages =
  | {
      type: "userJoined";
      data: {
        table_id: string;
        username: string;
        instance: string;
        socketType: "signaling";
      };
    }
  | {
      type: "userLeft";
      data: {
        table_id: string;
        username: string;
        instance: string;
        socketType: "signaling";
      };
    }
  | {
      type: "gameInitiated";
      username: string;
      instance: string;
      gameType: GameTypes;
      gameId: string;
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
    private createProducerBundle: () => void
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

  handleMessage = (message: IncomingMessages) => {
    switch (message.type) {
      case "userJoined":
        break;
      case "userLeft":
        break;
      case "gameInitiated": {
        switch (message.gameType) {
          case "snake": {
            if (!this.userMedia.current.games.snake) {
              this.userMedia.current.games.snake = {};
            }
            const snakeGameMedia = new SnakeGameMedia(
              this.table_id,
              this.username,
              this.instance,
              message.gameId,
              "ws://localhost:8042",
              message.username === this.username &&
                message.instance === this.instance
            );
            this.userMedia.current.games.snake[message.gameId] = snakeGameMedia;

            if (
              !this.bundles[this.username] ||
              !Object.keys(this.bundles[this.username]).includes(this.instance)
            ) {
              this.createProducerBundle();
            }
            break;
          }
        }
        break;
      }
      default:
        break;
    }
  };

  joinTable = () => {
    this.sendMessage({
      type: "joinTable",
      data: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        socketType: "signaling",
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
        username: this.username,
        instance: this.instance,
        gameType,
        gameId,
      },
    });
  };
}

export default GamesSignalingMedia;
