import { tableTopCeph, tableTopMongo } from "../index";
import Broadcaster from "./Broadcaster";
import { contentTypeBucketMap, onDeleteContentType } from "../typeConstant";

class Cleanup {
  constructor(private broadcaster: Broadcaster) {}

  onDeleteContent = async (event: onDeleteContentType) => {
    const { tableId, contentType, contentId, instanceId } = event.header;
    const { filename } = event.data;

    const document = await tableTopMongo.deleteTableDocumentInstance(
      tableId,
      contentType,
      contentId,
      instanceId
    );

    if (document && document.i.length === 0 && !document.s.includes(0)) {
      await tableTopCeph.deleteFile(
        contentTypeBucketMap[contentType],
        filename
      );

      await tableTopMongo.deleteTableDocument(tableId, contentType, contentId);
    }

    this.broadcaster.broadcastToTable(tableId, {
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
