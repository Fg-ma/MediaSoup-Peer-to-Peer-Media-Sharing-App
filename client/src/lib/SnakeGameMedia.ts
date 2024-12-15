import GameMediaUniversalFunctions from "./GameMediaUniversalFunctions";

class SnakeGameMedia extends GameMediaUniversalFunctions {
  constructor(
    table_id: string,
    username: string,
    instance: string,
    gameId: string,
    private url: string
  ) {
    super(table_id, username, instance, "snake", gameId);

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

  sendMessage = (message: {
    type: "changeSnakeDirection";
    data: {
      table_id: string;
      username: string;
      instance: string;
      direction: "up" | "down" | "left" | "right";
    };
  }) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  };

  handleMessage = (message: {
    type: "snakeDirectionChanged";
    data: { direction: string; playerId: number };
  }) => {
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

  changeSnakeDirection = (direction: "up" | "down" | "left" | "right") => {
    this.sendMessage({
      type: "changeSnakeDirection",
      data: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        direction,
      },
    });
  };
}

export default SnakeGameMedia;
