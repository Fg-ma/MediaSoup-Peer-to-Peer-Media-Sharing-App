import { GameTypes } from "../context/mediaContext/typeConstant";

type SocketTypes = "signaling" | "games";

type UniversalMessages =
  | {
      type: "joinTable";
      data: {
        table_id: string;
        username: string;
        instance: string;
        socketType: "games";
        gameType: GameTypes;
        gameId: string;
      };
    }
  | {
      type: "leaveTable";
      data: {
        table_id: string;
        username: string;
        instance: string;
        socketType: "games";
        gameType: GameTypes;
        gameId: string;
      };
    };

class GameMediaUniversalFunctions {
  protected ws: WebSocket | undefined;

  constructor(
    protected table_id: string,
    protected username: string,
    protected instance: string,
    protected gameType: GameTypes,
    protected gameId: string
  ) {}

  sendUniversalMessage = (message: UniversalMessages) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  };

  handleUniversalMessage = (
    message:
      | {
          type: "userJoined";
          data: {
            table_id: string;
            username: string;
            instance: string;
            socketType: SocketTypes;
            gameType: GameTypes | undefined;
            gameId: string | undefined;
          };
        }
      | {
          type: "userLeft";
          data: {
            table_id: string;
            username: string;
            instance: string;
            socketType: SocketTypes;
            gameType: GameTypes | undefined;
            gameId: string | undefined;
          };
        }
  ) => {
    switch (message.type) {
      case "userJoined":
        break;
      case "userLeft":
        break;
      default:
        break;
    }
  };

  joinTable = () => {
    this.sendUniversalMessage({
      type: "joinTable",
      data: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        socketType: "games",
        gameType: this.gameType,
        gameId: this.gameId,
      },
    });
  };

  leaveTable = () => {
    this.sendUniversalMessage({
      type: "leaveTable",
      data: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        socketType: "games",
        gameType: this.gameType,
        gameId: this.gameId,
      },
    });
  };
}

export default GameMediaUniversalFunctions;
