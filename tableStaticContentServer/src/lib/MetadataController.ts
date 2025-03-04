import { tableTopMongo } from "src";
import {
  onRequestCatchUpTableDataType,
  onUpdateContentEffectsType,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";

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
}

export default MetadataController;
