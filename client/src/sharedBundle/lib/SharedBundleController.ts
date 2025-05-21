import TableStaticContentSocketController from "../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import { IncomingTableStaticContentMessages } from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import SharedBundleSocket from "./SharedBundleSocket";
import { UserMediaType } from "../../context/mediaContext/typeConstant";
import {
  UserEffectsStylesType,
  UserEffectsType,
} from "../../../../universal/effectsTypeConstant";
import Deadbanding from "../../babylon/Deadbanding";
import UserDevice from "../../tools/userDevice/UserDevice";
import { DownloadSignals } from "../../context/uploadDownloadContext/lib/typeConstant";
import Downloader from "../../tools/downloader/Downloader";

class SharedBundleController extends SharedBundleSocket {
  constructor(
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {
    super();
  }

  gameSignalingListener = (event: { data: string }) => {
    const message = JSON.parse(event.data);

    switch (message.type) {
      case "gameClosed":
        this.setRerender((prev) => !prev);
        break;
      case "userJoinedTable":
        this.setRerender((prev) => !prev);
        break;
      case "gameInitiated":
        setTimeout(() => {
          this.setRerender((prev) => !prev);
        }, 100);
        break;
      default:
        break;
    }
  };

  handleTableStaticContentMessage = (
    message: IncomingTableStaticContentMessages,
  ) => {
    switch (message.type) {
      case "responsedCatchUpTableData":
        setTimeout(() => {
          this.setRerender((prev) => !prev);
        }, 100);
        break;
      case "videoUploadedToTable":
        this.setRerender((prev) => !prev);
        break;
      case "videoUploadedToTabled":
        this.setRerender((prev) => !prev);
        break;
      case "dashVideoReady":
        this.setRerender((prev) => !prev);
        break;
      case "imageUploadedToTable":
        this.setRerender((prev) => !prev);
        break;
      case "imageUploadedToTabled":
        this.setRerender((prev) => !prev);
        break;
      case "svgUploadedToTable":
        this.setRerender((prev) => !prev);
        break;
      case "svgUploadedToTabled":
        this.setRerender((prev) => !prev);
        break;
      case "svgReuploaded":
        this.setRerender((prev) => !prev);
        break;
      case "textUploadedToTable":
        this.setRerender((prev) => !prev);
        break;
      case "textUploadedToTabled":
        this.setRerender((prev) => !prev);
        break;
      case "contentDeleted":
        this.setRerender((prev) => !prev);
        break;
      case "createdNewInstances":
        this.setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };
}

export default SharedBundleController;
