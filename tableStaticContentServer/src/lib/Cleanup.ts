import { tableTopCeph, tableTopMongo } from "../index";
import Broadcaster from "./Broadcaster";
import { onDeleteContentType } from "../typeConstant";

class Cleanup {
  constructor(private broadcaster: Broadcaster) {}

  onDeleteContent = async (event: onDeleteContentType) => {
    const { table_id, contentType, contentId } = event.header;
    const { filename } = event.data;

    await tableTopCeph.deleteFile("mybucket", filename);

    await tableTopMongo.deleteDocument(table_id, contentType, contentId);

    this.broadcaster.broadcastToTable(table_id, {
      type: "contentDeleted",
      header: {
        contentType,
        contentId,
      },
    });
  };
}

export default Cleanup;
