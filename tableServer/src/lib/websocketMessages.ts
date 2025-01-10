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
      tablesController.onChangeTableBackgroundType(event);
      break;
    default:
      break;
  }
};

export default handleMessage;
