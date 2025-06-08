import { tableTopMongo, tableTopRedis } from "src";
import {
  onDeleteUploadSessionType,
  onRequestCatchUpVideoPositionType,
  onResponseCatchUpVideoPositionType,
  onSignalReuploadStartType,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";
import { onUpdateVideoPositionType } from "../../../mongoServer/src/typeConstant";
import { UploadSession } from "src/posts/lib/typeConstant";

class MetadataController {
  constructor(private broadcaster: Broadcaster) {}

  onUpdateVideoPosition = async (event: onUpdateVideoPositionType) => {
    await tableTopMongo.onUpdateVideoPosition(event);

    const { tableId, contentType, contentId, instanceId } = event.header;
    const { videoPosition } = event.data;

    const msg = {
      type: "updatedVideoPosition",
      header: { contentType, contentId, instanceId },
      data: { videoPosition },
    };
    this.broadcaster.broadcastToTable(tableId, msg);
  };

  onRequestCatchUpVideoPosition = (
    event: onRequestCatchUpVideoPositionType
  ) => {
    const { tableId, username, instance, contentType, contentId, instanceId } =
      event.header;

    this.broadcaster.broadcastToFirstFoundInstance(tableId, {
      type: "requestedCatchUpVideoPosition",
      header: {
        username,
        instance,
        contentType,
        contentId,
        instanceId,
      },
    });
  };

  onResponseCatchUpVideoPosition = (
    event: onResponseCatchUpVideoPositionType
  ) => {
    const { tableId, username, instance, contentType, contentId, instanceId } =
      event.header;
    const { currentVideoPosition } = event.data;

    this.broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "respondedCatchUpVideoPosition",
      header: {
        contentType,
        contentId,
        instanceId,
      },
      data: {
        currentVideoPosition,
      },
    });
  };

  onDeleteUploadSession = async (event: onDeleteUploadSessionType) => {
    const { uploadId } = event.header;

    const session = (await tableTopRedis.gets.get(
      "VUS",
      uploadId
    )) as UploadSession;

    await tableTopRedis.deletes.delete(
      [
        { prefix: "VUS", id: uploadId },
        { prefix: "VCS", id: uploadId },
        session?.direction === "reupload"
          ? { prefix: "VRU", id: session.contentId }
          : undefined,
      ].filter((del) => del !== undefined)
    );
  };

  onSignalReuploadStart = async (event: onSignalReuploadStartType) => {
    const { tableId, contentId, contentType } = event.header;

    this.broadcaster.broadcastToTable(tableId, {
      type: "reuploadStarted",
      header: {
        contentType: contentType,
        contentId: contentId,
      },
    });
  };
}

export default MetadataController;
