import { tableTopCeph, tableTopMongo } from "../index";
import Broadcaster from "./Broadcaster";
import { contentTypeBucketMap, onDeleteContentType } from "../typeConstant";

class Cleanup {
  constructor(private broadcaster: Broadcaster) {}

  onDeleteContent = async (event: onDeleteContentType) => {
    const { table_id, contentType, contentId, instanceId } = event.header;
    const { filename } = event.data;

    const document = await tableTopMongo.deleteTableDocumentInstance(
      table_id,
      contentType,
      contentId,
      instanceId
    );

    if (document && document.i.length === 0 && !document.t) {
      console.log("wokr", filename, contentTypeBucketMap[contentType]);
      await tableTopCeph.deleteFile(
        contentTypeBucketMap[contentType],
        filename
      );

      await tableTopMongo.deleteTableDocument(table_id, contentType, contentId);
    }

    this.broadcaster.broadcastToTable(table_id, {
      type: "contentDeleted",
      header: {
        contentType,
        contentId,
        instanceId,
      },
    });
  };
}

export default Cleanup;
