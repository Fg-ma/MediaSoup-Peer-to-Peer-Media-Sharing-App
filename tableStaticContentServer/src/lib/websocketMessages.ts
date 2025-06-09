import {
  cleanup,
  gets,
  metadataController,
  search,
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
    case "getDownloadMeta":
      gets.onGetDownloadMeta(event);
      break;
    case "getFileChunk":
      gets.onGetFileChunk(event);
      break;
    case "updateContentPositioning":
      tableTopMongo.onUpdateContentPositioning(event);
      break;
    case "requestCatchUpEffects":
      metadataController.onRequestCatchUpEffects(event);
      break;
    case "changeContentState":
      metadataController.onChangeContentState(event);
      break;
    case "updateContentEffects":
      metadataController.onUpdateContentEffects(event);
      break;
    case "createNewInstances":
      metadataController.onCreateNewInstances(event);
      break;
    case "searchTabledContentRequest":
      search.onSearchTabledContentRequest(event);
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
