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

    if (!key) {
      return;
    }

    const params = { Bucket: "mybucket", Key: key };
    const data = await tableTopCeph.s3Client.send(new GetObjectCommand(params));

    if (data.Body) {
      const passThrough = new PassThrough();
      (data.Body as Readable).pipe(passThrough);

      passThrough.on("data", (chunk) => {
        this.broadcaster.broadcastToInstance(table_id, username, instance, {
          type: "chunk",
          data: { chunk },
        });
      });

      passThrough.on("end", () => {
        this.broadcaster.broadcastToInstance(table_id, username, instance, {
          type: "downloadComplete",
        });
      });
    }
  };
}

export default Gets;
