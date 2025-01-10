import {
  onRequestCatchUpContentDataType,
  onRequestCatchUpTableDataType,
  tableContent,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";

class MetadataController {
  constructor(private broadcaster: Broadcaster) {}

  onRequestCatchUpTableData = (event: onRequestCatchUpTableDataType) => {
    const { table_id, username, instance } = event.header;

    this.broadcaster.broadcastToInstance(table_id, username, instance, {
      type: "responsedCatchUpTableData",
      data: tableContent[table_id],
    });
  };

  onRequestCatchUpContentData = (event: onRequestCatchUpContentDataType) => {
    const { table_id, inquiringUsername, inquiringInstance } = event.header;

    this.broadcaster.broadcastToFirstFoundInstance(table_id, {
      type: "requestedCatchUpContentData",
      header: {
        inquiringUsername,
        inquiringInstance,
      },
    });
  };
}

export default MetadataController;
