import { metadataController, tablesController } from "../index";
import { MessageTypes, VideoWebSocket } from "../typeConstant";

const handleMessage = (ws: VideoWebSocket, event: MessageTypes) => {
  switch (event.type) {
    case "joinTable":
      tablesController.onJoinTable(ws, event);
      break;
    case "leaveTable":
      tablesController.onLeaveTable(event);
      break;
    case "updateVideoMetadata":
      metadataController.onUpdateVideoMetadata(event);
      break;
    case "requestCatchUpVideoMetadata":
      metadataController.onRequestCatchUpVideoMetadata(event);
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
