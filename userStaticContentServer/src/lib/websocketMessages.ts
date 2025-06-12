import {
  cleanup,
  gets,
  metadataController,
  search,
  tablesController,
  tableTopMongo,
} from "../index";
import { MessageTypes, UserStaticContentWebSocket } from "../typeConstant";

const handleMessage = (ws: UserStaticContentWebSocket, event: MessageTypes) => {
  switch (event.type) {
    case "connect":
      tablesController.onConnect(ws, event);
      break;
    case "disconnect":
      tablesController.onDisconnect(event);
      break;
    case "deleteContent":
      cleanup.onDeleteContent(event);
      break;
    case "getDownloadMeta":
      gets.onGetDownloadMeta(event);
      break;
    case "getFileChunk":
      gets.onGetFileChunk(event);
      break;
    case "changeContentState":
      tableTopMongo.onChangeUserContentState(event);
      break;
    case "searchUserContentRequest":
      search.onSearchUserContentRequest(event);
      break;
    case "muteStylesRequest":
      metadataController.onMuteStylesRequest(event);
      break;
    case "deleteUploadSession":
      metadataController.onDeleteUploadSession(event);
      break;
    default:
      break;
  }
};

export default handleMessage;
