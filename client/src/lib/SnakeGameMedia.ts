import { SnakeColorsType } from "../games/snakeGame/lib/typeConstant";
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
      type: "changeGridSize";
      data: {
        table_id: string;
        gameId: string;
        gridSize: number;
      };
    }
  | {
      type: "changeSnakeColor";
      data: {
        table_id: string;
        username: string;
        instance: string;
        gameId: string;
        newSnakeColor: SnakeColorsType;
      };
    };

class SnakeGameMedia extends GameMediaUniversalFunctions {
  constructor(
    table_id: string,
    username: string,
    instance: string,
    gameId: string,
    private url: string
  ) {
    super(table_id, username, instance, "snake", gameId);
  }

  connect = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.joinTable();
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
      data: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        gameId: this.gameId,
        direction,
      },
    });
  };

  changeGridSize = (gridSize: number) => {
    this.sendMessage({
      type: "changeGridSize",
      data: {
        table_id: this.table_id,
        gameId: this.gameId,
        gridSize,
      },
    });
  };

  changeSnakeColor = (newSnakeColor: SnakeColorsType) => {
    this.sendMessage({
      type: "changeSnakeColor",
      data: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        gameId: this.gameId,
        newSnakeColor,
      },
    });
  };
}

export default SnakeGameMedia;
