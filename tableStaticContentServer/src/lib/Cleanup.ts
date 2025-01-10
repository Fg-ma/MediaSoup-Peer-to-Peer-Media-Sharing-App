import { tableContentController } from "../index";
import Broadcaster from "./Broadcaster";
import { onDeleteContentType } from "../typeConstant";

class Cleanup {
  constructor(private broadcaster: Broadcaster) {}

  onDeleteContent = (event: onDeleteContentType) => {
    const { table_id, contentType, contentId } = event.header;

    tableContentController.deleteContent(table_id, contentType, contentId);

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
