import { tablesController } from "src";
import { TableWebSocket, MessageTypes } from "../typeConstant";

const handleMessage = (ws: TableWebSocket, event: MessageTypes) => {
  switch (event.type) {
    case "joinTable":
      tablesController.onJoinTable(ws, event);
      break;
    case "leaveTable":
      tablesController.onLeaveTable(event);
      break;
    case "changeTableBackground":
      tablesController.onChangeTableBackground(event);
      break;
    case "moveSeats":
      tablesController.onMoveSeats(event);
      break;
    case "swapSeats":
      tablesController.onSwapSeats(event);
      break;
    case "kickFromTable":
      tablesController.onKickFromTable(event);
      break;
    case "reaction":
      tablesController.onReaction(event);
      break;
    default:
      break;
  }
};

export default handleMessage;
