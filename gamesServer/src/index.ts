import uWS from "uWebSockets.js";
import { Buffer } from "buffer";
import {
  GameWebSocket,
  MessageTypes,
  SocketData,
  tables,
} from "./typeConstant";
import Broadcaster from "./lib/Broadcaster";
import TablesController from "./lib/TablesController";
import UniversalGameController from "./lib/UniversalGameController";
import SnakeGameController from "./snakeGame/lib/SnakeGameController";

const broadcaster = new Broadcaster();
const tablesController = new TablesController(broadcaster);
const universalGameController = new UniversalGameController(broadcaster);
const snakeGameController = new SnakeGameController();

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

const handleMessage = (ws: GameWebSocket, event: MessageTypes) => {
  switch (event.type) {
    case "joinTable":
      tablesController.onJoinTable(ws, event);
      break;
    case "newGameSocket":
      tablesController.onNewGameSocket(ws, event);
      break;
    case "leaveTable":
      tablesController.onLeaveTable(event);
      break;
    case "initiateGame":
      universalGameController.onInitiateGame(event);
      break;
    case "startGame":
      universalGameController.onStartGame(event);
      break;
    case "closeGame":
      universalGameController.onCloseGame(event);
      break;
    case "joinGame":
      universalGameController.onJoinGame(event);
      break;
    case "leaveGame":
      universalGameController.onLeaveGame(event);
      break;
    case "getPlayersState":
      universalGameController.onGetPlayersState(event);
      break;
    case "snakeDirectionChange":
      snakeGameController.onSnakeDirectionChange(event);
      break;
    case "changeGridSize":
      snakeGameController.onChangeGridSize(event);
      break;
    case "changeSnakeColor":
      snakeGameController.onChangeSnakeColor(event);
      break;
    default:
      break;
  }
};
