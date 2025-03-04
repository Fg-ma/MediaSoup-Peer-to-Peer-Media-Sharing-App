import {
  broadcaster,
  cleanup,
  gets,
  metadataController,
  tablesController,
  tableTopMongo,
} from "../index";
import { MessageTypes, TableStaticContentWebSocket } from "../typeConstant";

const handleMessage = (
  ws: TableStaticContentWebSocket,
  event: MessageTypes
) => {
  switch (event.type) {
    case "joinTable":
      tablesController.onJoinTable(ws, event);
      break;
    case "leaveTable":
      tablesController.onLeaveTable(event);
      break;
    case "requestCatchUpTableData":
      metadataController.onRequestCatchUpTableData(event);
      break;
    case "deleteContent":
      cleanup.onDeleteContent(event);
      break;
    case "getFile":
      gets.getFile(event);
      break;
    case "updateContentPositioning":
      tableTopMongo.updateContentPositioning(event);
      break;
    case "updateContentEffects":
      metadataController.onUpdateContentEffects(event);
      break;
    default:
      break;
  }
};

export default handleMessage;
