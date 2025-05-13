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
    case "getFile":
      gets.getFile(event);
      break;
    case "pauseDownload":
      gets.onPauseDownload(event);
      break;
    case "resumeDownload":
      gets.onResumeDownload(event);
      break;
    case "cancelDownload":
      gets.onCancelDownload(event);
      break;
    case "updateContentPositioning":
      tableTopMongo.onUpdateContentPositioning(event);
      break;
    case "changeContentState":
      metadataController.onChangeContentState(event);
      break;
    case "updateContentEffects":
      metadataController.onUpdateContentEffects(event);
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
    case "createNewInstances":
      metadataController.onCreateNewInstances(event);
      break;
    case "searchTabledContentRequest":
      search.onSearchTabledContentRequest(event);
      break;
    default:
      break;
  }
};

export default handleMessage;
