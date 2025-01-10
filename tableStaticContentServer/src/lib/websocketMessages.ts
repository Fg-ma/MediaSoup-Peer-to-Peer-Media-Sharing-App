import { cleanup, metadataController, tablesController } from "../index";
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
    case "requestCatchUpContentData":
      metadataController.onRequestCatchUpContentData(event);
      break;
    case "deleteContent":
      cleanup.onDeleteContent(event);
      break;
    default:
      break;
  }
};

export default handleMessage;
