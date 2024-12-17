import GameMediaUniversalFunctions from "./GameMediaUniversalFunctions";

type OutGoingMessages =
  | {
      type: "snakeDirectionChange";
      data: {
        table_id: string;
        username: string;
        instance: string;
        gameId: string;
        direction: "up" | "down" | "left" | "right";
      };
    }
  | {
      type: "addSnake";
      data: {
        table_id: string;
        username: string;
        instance: string;
        gameId: string;
      };
    };

type IncomingMessages = {
  type: "snakeDirectionChanged";
  data: { direction: string; playerId: number };
};

class SnakeGameMedia extends GameMediaUniversalFunctions {
  initiator: boolean;

  constructor(
    table_id: string,
    username: string,
    instance: string,
    gameId: string,
    private url: string,
    initiator: boolean
  ) {
    super(table_id, username, instance, "snake", gameId);
    this.initiator = initiator;

    this.connect(this.url);
  }

  private connect = (url: string) => {
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "userJoined" || message.type === "userLeft") {
        this.handleUniversalMessage(message);
      } else {
        this.handleMessage(message);
      }
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
      case "snakeDirectionChanged":
        console.log(
          `Player ${message.data.playerId} moved snake to ${message.data.direction}`
        );
        break;
      default:
        break;
    }
  };

  snakeDirectionChange = (direction: "up" | "down" | "left" | "right") => {
    this.sendMessage({
      type: "snakeDirectionChange",
      data: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        gameId: this.gameId,
        direction,
      },
    });
  };

  addSnake = () => {
    this.sendMessage({
      type: "addSnake",
      data: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        gameId: this.gameId,
      },
    });
  };
}

export default SnakeGameMedia;
