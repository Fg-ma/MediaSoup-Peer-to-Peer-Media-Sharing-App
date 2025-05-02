import {
  cleanup,
  gets,
  metadataController,
  search,
  tablesController,
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
    case "getFile":
      gets.getFile(event);
      break;
    case "changeContentState":
      metadataController.onChangeContentState(event);
      break;
    case "searchUserContentRequest":
      search.onSearchUserContentRequest(event);
      break;
    default:
      break;
  }
};

export default handleMessage;
