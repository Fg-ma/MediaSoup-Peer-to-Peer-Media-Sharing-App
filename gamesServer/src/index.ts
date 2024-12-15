import uWS from "uWebSockets.js";
import { Buffer } from "buffer";
import {
  GameTypes,
  GameWebSocket,
  SocketData,
  SocketTypes,
} from "./typeConstant";
import Broadcaster from "./Broadcaster";
import TablesController from "./TablesController";

type MessageTypes =
  | {
      type: "joinTable";
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
      type: "leaveTable";
      data: {
        table_id: string;
        username: string;
        instance: string;
        socketType: SocketTypes;
        gameType: GameTypes | undefined;
        gameId: string | undefined;
      };
    };

const broadcaster = new Broadcaster();
const tablesController = new TablesController(broadcaster);

uWS
  .App()
  .ws<SocketData>("/*", {
    message: (ws, message, _isBinary) => {
      const gameWS = ws as GameWebSocket;

      try {
        const msg = JSON.parse(Buffer.from(message).toString());
        handleMessage(gameWS, msg);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    },
  })
  .listen(8042, (token) => {
    if (token) {
      console.log("uWebSockets.js Game Server listening on port 8042");
    } else {
      console.error("Failed to start server");
    }
  });

const handleMessage = (ws: GameWebSocket, msg: MessageTypes) => {
  const { type, data } = msg;

  switch (type) {
    case "joinTable":
      tablesController.joinTable(
        ws,
        data.table_id,
        data.username,
        data.instance,
        data.socketType,
        data.gameType,
        data.gameId
      );
      break;
    case "leaveTable":
      tablesController.joinTable(
        ws,
        data.table_id,
        data.username,
        data.instance,
        data.socketType,
        data.gameType,
        data.gameId
      );
      break;
    default:
      break;
  }
};
