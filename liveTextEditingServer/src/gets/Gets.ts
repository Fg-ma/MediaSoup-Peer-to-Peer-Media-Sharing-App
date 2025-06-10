import { Readable } from "stream";
import { sanitizationUtils, tableTopCeph } from "../index";
import { onGetDownloadMetaType, onGetFileChunkType } from "../typeConstant";
import Broadcaster from "../lib/Broadcaster";

class Gets {
  constructor(private broadcaster: Broadcaster) {}

  onGetDownloadMeta = async (event: onGetDownloadMetaType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onGetDownloadMetaType;
    const { tableId, username, instance, contentId } = safeEvent.header;

    try {
      const head = await tableTopCeph.gets.getHead("table-text", contentId);
      const fileSize = head?.ContentLength ?? 0;

      if (fileSize > 1024 * 1024) {
        this.broadcaster.broadcastToInstance(tableId, username, instance, {
          type: "downloadMeta",
          header: { contentId },
          data: { fileSize },
        });
      } else {
        const data = await tableTopCeph.gets.getContent(
          "table-text",
          contentId
        );

        if (data?.Body instanceof Readable) {
          const stream = data.Body as Readable;

          const chunks: Buffer[] = [];

          stream
            .on("data", async (chunk) => {
              chunks.push(chunk);
            })
            .on("end", async () => {
              const update = Buffer.concat(chunks);

              const headerObj = {
                type: "oneShotDownload",
                header: {
                  contentId,
                  fileSize,
                },
              };
              const headerBytes = new TextEncoder().encode(
                JSON.stringify(headerObj)
              );
              const headerLen = headerBytes.length;

              // 2) Allocate a buffer: 1 for prefix + 4 bytes for length + header + data
              const message = new Uint8Array(4 + headerLen + update.length);

              // 3) Write header length LE
              new DataView(message.buffer).setUint32(0, headerLen, true);

              // 4) Copy in the header bytes, then the data bytes
              message.set(headerBytes, 4);
              message.set(update, 4 + headerLen);

              this.broadcaster.broadcastToInstance(
                tableId,
                username,
                instance,
                message,
                true
              );
            })
            .on("error", (_err) => {
              this.broadcaster.broadcastToInstance(
                tableId,
                username,
                instance,
                {
                  type: "downloadError",
                  header: { contentId },
                }
              );
            });
        }
      }
    } catch (err) {
      console.error("Error fetching file from S3:", err);
    }
  };

  onGetFileChunk = async (event: onGetFileChunkType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(event, {
      range: "=",
    }) as onGetFileChunkType;
    const { tableId, username, instance, contentId } = safeEvent.header;
    const { range } = safeEvent.data;

    try {
      const data = await tableTopCeph.gets.getContent(
        "table-text",
        contentId,
        range
      );

      if (data?.Body instanceof Readable) {
        const stream = data.Body as Readable;

        const chunks: Buffer[] = [];

        stream
          .on("data", (chunk) => {
            chunks.push(chunk);
          })
          .on("end", () => {
            const update = Buffer.concat(chunks);

            const headerObj = {
              type: "chunk",
              header: {
                contentId,
                range,
              },
            };
            const headerBytes = new TextEncoder().encode(
              JSON.stringify(headerObj)
            );
            const headerLen = headerBytes.length;

            // 2) Allocate a buffer: 1 for prefix + 4 bytes for length + header + data
            const message = new Uint8Array(4 + headerLen + update.length);

            // 3) Write header length LE
            new DataView(message.buffer).setUint32(0, headerLen, true);

            // 4) Copy in the header bytes, then the data bytes
            message.set(headerBytes, 4);
            message.set(update, 4 + headerLen);

            this.broadcaster.broadcastToInstance(
              tableId,
              username,
              instance,
              message,
              true
            );
          })
          .on("error", (_err) => {
            this.broadcaster.broadcastToInstance(tableId, username, instance, {
              type: "chunkError",
              header: { contentId },
            });
          });
      }
    } catch (err) {
      console.error("Error fetching file from S3:", err);
    }
  };
}

export default Gets;
