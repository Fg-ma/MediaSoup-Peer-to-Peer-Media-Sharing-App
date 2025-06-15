import {
  snakeGameController,
  tablesController,
  universalGameController,
} from "../index";
import { GameWebSocket, MessageTypes } from "../typeConstant";

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
    case "updateContentPositioning":
      universalGameController.onUpdateContentPositioning(event);
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
    case "getInitialGameStates":
      universalGameController.onGetInitialGameStates(event);
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

export default handleMessage;
