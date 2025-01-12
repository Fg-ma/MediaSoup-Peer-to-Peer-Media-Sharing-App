import {
  onCatchUpContentDataResponseType,
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
    const {
      table_id,
      inquiringUsername,
      inquiringInstance,
      contentType,
      contentId,
    } = event.header;

    this.broadcaster.broadcastToFirstFoundInstance(table_id, {
      type: "requestedCatchUpContentData",
      header: {
        inquiringUsername,
        inquiringInstance,
        contentType,
        contentId,
      },
    });
  };

  onCatchUpContentDataResponse = (event: onCatchUpContentDataResponseType) => {
    const {
      table_id,
      inquiringUsername,
      inquiringInstance,
      contentType,
      contentId,
    } = event.header;
    const { positioning, videoTime, timeMeasured } = event.data;

    this.broadcaster.broadcastToInstance(
      table_id,
      inquiringUsername,
      inquiringInstance,
      {
        type: "catchUpContentDataResponded",
        header: {
          contentType,
          contentId,
        },
        data: {
          positioning,
          videoTime,
          timeMeasured,
        },
      }
    );
  };
}

export default MetadataController;
