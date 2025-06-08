import { gets, metadataController, tablesController } from "../index";
import { MessageTypes, VideoWebSocket } from "../typeConstant";

const handleMessage = (ws: VideoWebSocket, event: MessageTypes) => {
  switch (event.type) {
    case "joinTable":
      tablesController.onJoinTable(ws, event);
      break;
    case "leaveTable":
      tablesController.onLeaveTable(event);
      break;
    case "getDownloadMeta":
      gets.onGetDownloadMeta(event);
      break;
    case "getFileChunk":
      gets.onGetFileChunk(event);
      break;
    case "updateVideoPosition":
      metadataController.onUpdateVideoPosition(event);
      break;
    case "requestCatchUpVideoPosition":
      metadataController.onRequestCatchUpVideoPosition(event);
      break;
    case "responseCatchUpVideoPosition":
      metadataController.onResponseCatchUpVideoPosition(event);
      break;
    case "deleteUploadSession":
      metadataController.onDeleteUploadSession(event);
      break;
    case "signalReuploadStart":
      metadataController.onSignalReuploadStart(event);
      break;
    default:
      break;
  }
};

export default handleMessage;
