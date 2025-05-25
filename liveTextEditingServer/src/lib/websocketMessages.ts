import { gets, liveTextEditingController } from "src";
import { TableWebSocket, MessageTypes } from "../typeConstant";

const handleMessage = (ws: TableWebSocket, event: MessageTypes) => {
  switch (event.type) {
    case "joinTable":
      liveTextEditingController.onJoinTable(ws, event);
      break;
    case "leaveTable":
      liveTextEditingController.onLeaveTable(event);
      break;
    case "docUpdate":
      liveTextEditingController.onDocUpdate(event);
      break;
    case "getInitialDocState":
      liveTextEditingController.onGetInitialDocState(event);
      break;
    case "docSave":
      liveTextEditingController.onDocSave(event);
      break;
    case "getDownloadMeta":
      gets.onGetDownloadMeta(event);
      break;
    case "getFileChunk":
      gets.onGetFileChunk(event);
      break;
    default:
      break;
  }
};

export default handleMessage;
