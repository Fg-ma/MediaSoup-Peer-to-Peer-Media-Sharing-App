import { Readable } from "stream";
import { tableTopCeph } from "../index";
import { contentTypeBucketMap, onGetFileType } from "../typeConstant";
import Broadcaster from "../lib/Broadcaster";

class Gets {
  constructor(private broadcaster: Broadcaster) {}

  getFile = async (event: onGetFileType) => {
    const { tableId, username, instance, contentType, contentId } =
      event.header;

    try {
      const data = await tableTopCeph.gets.getContent(
        contentTypeBucketMap[contentType],
        contentId
      );

      if (data && data.Body && data.Body instanceof Readable) {
        data.Body.on("data", (chunk) => {
          this.broadcaster.broadcastToInstance(tableId, username, instance, {
            type: "chunk",
            header: { contentType, contentId },
            data: { chunk },
          });
        })
          .on("end", () => {
            this.broadcaster.broadcastToInstance(tableId, username, instance, {
              type: "downloadComplete",
              header: { contentType, contentId },
            });
          })
          .on("error", (err) => {
            console.error("Error during file streaming:", err);
          });
      }
    } catch (err) {
      console.error("Error fetching file from S3:", err);
    }
  };
}

export default Gets;
