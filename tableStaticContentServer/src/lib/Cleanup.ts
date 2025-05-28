import { tableTopCeph, tableTopMongo, tableTopRedis } from "../index";
import Broadcaster from "./Broadcaster";
import { contentTypeBucketMap, onDeleteContentType } from "../typeConstant";

class Cleanup {
  constructor(private broadcaster: Broadcaster) {}

  onDeleteContent = async (event: onDeleteContentType) => {
    const { tableId, contentType, contentId, instanceId } = event.header;

    const document = await tableTopMongo.deleteTableDocumentInstance(
      tableId,
      contentType,
      contentId,
      instanceId
    );

    await tableTopRedis.deletes.deleteKeys([
      `LTE:${tableId}:${contentId}:${instanceId}`,
    ]);

    if (document && document.i.length === 0 && !document.s.includes(0)) {
      await tableTopCeph.deletes.deleteFile(
        contentTypeBucketMap[contentType],
        contentId
      );

      await tableTopMongo.deleteTableDocument(tableId, contentType, contentId);

      await tableTopRedis.deletes.deleteKeys([
        `LTE:${tableId}:${contentId}:file`,
      ]);
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
