import { SnakeColorsType } from "../../../games/snakeGame/lib/typeConstant";
import GameMediaUniversalFunctions from "../GameMediaUniversalFunctions";

type OutGoingMessages =
  | {
      type: "snakeDirectionChange";
      header: {
        tableId: string;
        username: string;
        instance: string;
        gameId: string;
      };
      data: {
        direction: "up" | "down" | "left" | "right";
      };
    }
  | {
      type: "changeGridSize";
      header: {
        tableId: string;
        gameId: string;
      };
      data: {
        gridSize: number;
      };
    }
  | {
      type: "changeSnakeColor";
      header: {
        tableId: string;
        username: string;
        instance: string;
        gameId: string;
      };
      data: {
        newSnakeColor: SnakeColorsType;
      };
    };

class SnakeGameMedia extends GameMediaUniversalFunctions {
  initiator = false;

  constructor(
    tableId: string,
    username: string,
    instance: string,
    gameId: string,
    private url: string,
    initiator: boolean,
  ) {
    super(tableId, username, instance, "snake", gameId);

    this.initiator = initiator;
  }

  destructor = () => {
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;

      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      ) {
        this.ws.close();
      }
    }
  };

  connect = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.newGameSocket();
        resolve();
      };

      this.ws.onerror = (err) => {
        reject(err);
      };
    });
  };

  sendMessage = (message: OutGoingMessages) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  };

  snakeDirectionChange = (direction: "up" | "down" | "left" | "right") => {
    this.sendMessage({
      type: "snakeDirectionChange",
      header: {
        tableId: this.tableId,
        username: this.username,
        instance: this.instance,
        gameId: this.gameId,
      },
      data: {
        direction,
      },
    });
  };

  changeGridSize = (gridSize: number) => {
    this.sendMessage({
      type: "changeGridSize",
      header: {
        tableId: this.tableId,
        gameId: this.gameId,
      },
      data: {
        gridSize,
      },
    });
  };

  changeSnakeColor = (newSnakeColor: SnakeColorsType) => {
    this.sendMessage({
      type: "changeSnakeColor",
      header: {
        tableId: this.tableId,
        username: this.username,
        instance: this.instance,
        gameId: this.gameId,
      },
      data: {
        newSnakeColor,
      },
    });
  };
}

export default SnakeGameMedia;
