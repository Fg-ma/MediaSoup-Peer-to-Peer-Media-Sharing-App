import { PassThrough, Readable } from "stream";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { tableTopCeph } from "../index";
import { onGetFileType } from "../typeConstant";
import Broadcaster from "../lib/Broadcaster";

class Gets {
  constructor(private broadcaster: Broadcaster) {}

  getFile = async (event: onGetFileType) => {
    const { table_id, username, instance } = event.header;
    const key = event.data.key;

    if (!key) return;

    try {
      const params = { Bucket: "mybucket", Key: key };
      const data = await tableTopCeph.s3Client.send(
        new GetObjectCommand(params)
      );

      if (data.Body && data.Body instanceof Readable) {
        data.Body.on("data", (chunk) => {
          this.broadcaster.broadcastToInstance(table_id, username, instance, {
            type: "chunk",
            data: { chunk },
          });
        })
          .on("end", () => {
            this.broadcaster.broadcastToInstance(table_id, username, instance, {
              type: "downloadComplete",
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
