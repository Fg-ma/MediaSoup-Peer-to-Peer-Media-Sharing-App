import { tableTopMongo } from "src";
import {
  onRequestCatchUpTableDataType,
  onRequestCatchUpVideoPositionType,
  onResponseCatchUpVideoPositionType,
  onUpdateContentEffectsType,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";
import { onUpdateVideoPositionType } from "../../../mongoServer/src/typeConstant";

class MetadataController {
  constructor(private broadcaster: Broadcaster) {}

  onRequestCatchUpTableData = async (event: onRequestCatchUpTableDataType) => {
    const { table_id, username, instance } = event.header;

    const images = await tableTopMongo.tableImages?.gets.getAllBy_TID(table_id);
    const videos = await tableTopMongo.tableVideos?.gets.getAllBy_TID(table_id);
    const text = await tableTopMongo.tableText?.gets.getAllBy_TID(table_id);
    const audio = await tableTopMongo.tableSoundClips?.gets.getAllBy_TID(
      table_id
    );
    const applications =
      await tableTopMongo.tableApplications?.gets.getAllBy_TID(table_id);

    this.broadcaster.broadcastToInstance(table_id, username, instance, {
      type: "responsedCatchUpTableData",
      data: { images, videos, text, audio, applications },
    });
  };

  onUpdateContentEffects = (event: onUpdateContentEffectsType) => {
    tableTopMongo.updateContentEffects(event);

    const { table_id, contentType, contentId } = event.header;

    const msg = {
      type: "updatedContentEffects",
      header: { contentType, contentId },
      data: event.data,
    };
    this.broadcaster.broadcastToTable(table_id, msg);
  };

  onUpdateVideoPosition = async (event: onUpdateVideoPositionType) => {
    await tableTopMongo.updateVideoPosition(event);

    const { table_id, contentType, contentId } = event.header;
    const { videoPosition } = event.data;

    const msg = {
      type: "updatedVideoPosition",
      header: { contentType, contentId },
      data: { videoPosition },
    };
    this.broadcaster.broadcastToTable(table_id, msg);
  };

  onRequestCatchUpVideoPosition = (
    event: onRequestCatchUpVideoPositionType
  ) => {
    const { table_id, username, instance, contentType, contentId } =
      event.header;

    this.broadcaster.broadcastToFirstFoundInstance(table_id, {
      type: "requestedCatchUpVideoPosition",
      header: {
        username,
        instance,
        contentType,
        contentId,
      },
    });
  };

  onResponseCatchUpVideoPosition = (
    event: onResponseCatchUpVideoPositionType
  ) => {
    const { table_id, username, instance, contentType, contentId } =
      event.header;
    const { currentVideoPosition } = event.data;

    this.broadcaster.broadcastToInstance(table_id, username, instance, {
      type: "respondedCatchUpVideoPosition",
      header: {
        contentType,
        contentId,
      },
      data: {
        currentVideoPosition,
      },
    });
  };
}

export default MetadataController;
