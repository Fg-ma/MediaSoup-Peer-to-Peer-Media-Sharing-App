import { Readable } from "stream";
import * as Y from "yjs";
import { tableTopCeph, tableTopRedis } from "../index";
import { onGetDownloadMetaType, onGetFileChunkType } from "../typeConstant";
import Broadcaster from "../lib/Broadcaster";

class Gets {
  constructor(private broadcaster: Broadcaster) {}

  onGetDownloadMeta = async (event: onGetDownloadMetaType) => {
    const { tableId, username, instance, contentId } = event.header;

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
        const ops = await tableTopRedis.gets.lrange(
          `LTE:${tableId}:${contentId}:ops`
        );

        if (ops.length === 0) {
          const data = await tableTopCeph.gets.getContent(
            "table-text",
            contentId
          );

          if (data?.Body instanceof Readable) {
            const stream = data.Body as Readable;

            const chunks: Buffer[] = [];

            stream
              .on("data", (chunk) => {
                chunks.push(chunk);
              })
              .on("end", async () => {
                const fullChunk = Buffer.concat(chunks);
                const initialText = fullChunk.toString("utf8");

                const ydoc = new Y.Doc();
                ydoc.getText("monaco").insert(0, initialText);
                const payload = Y.encodeStateAsUpdate(ydoc);

                await tableTopRedis.posts.rpush(
                  `LTE:${tableId}:${contentId}:ops`,
                  JSON.stringify(Array.from(payload))
                );

                const headerObj = {
                  type: "oneShotDownload",
                  header: {
                    contentId,
                  },
                };
                const headerBytes = new TextEncoder().encode(
                  JSON.stringify(headerObj)
                );
                const headerLen = headerBytes.length;

                // 2) Allocate a buffer: 1 for prefix + 4 bytes for length + header + data
                const message = new Uint8Array(4 + headerLen + payload.length);

                // 3) Write header length LE
                new DataView(message.buffer).setUint32(0, headerLen, true);

                // 4) Copy in the header bytes, then the data bytes
                message.set(headerBytes, 4);
                message.set(payload, 4 + headerLen);

                this.broadcaster.broadcastToInstance(
                  tableId,
                  username,
                  instance,
                  payload,
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
        } else {
          const ydoc = new Y.Doc();
          for (const op of ops) {
            try {
              const updateObj = JSON.parse(op);
              const update = Uint8Array.from(Object.values(updateObj));
              Y.applyUpdate(ydoc, update);
            } catch (_e) {
              console.warn("Invalid Yjs update in Redis:", op);
            }
          }

          const payload = Y.encodeStateAsUpdate(ydoc);

          // 1) Build the JSON header
          const headerObj = {
            type: "oneShotDownload",
            header: { contentId },
          };
          const headerStr = JSON.stringify(headerObj);
          const encoder = new TextEncoder();
          const headerBytes = encoder.encode(headerStr);
          const headerLen = headerBytes.length;

          // 2) Allocate a buffer: 1 for prefix + 4 bytes for length + header + data
          const message = new Uint8Array(4 + headerLen + payload.length);

          // 3) Write header length LE
          new DataView(message.buffer).setUint32(0, headerLen, true);

          // 4) Copy in the header bytes, then the data bytes
          message.set(headerBytes, 4);
          message.set(payload, 4 + headerLen);

          this.broadcaster.broadcastToInstance(
            tableId,
            username,
            instance,
            message,
            true
          );
        }
      }
    } catch (err) {
      console.error("Error fetching file from S3:", err);
    }
  };

  onGetFileChunk = async (event: onGetFileChunkType) => {
    const { tableId, username, instance, contentType, contentId } =
      event.header;

    const { range } = event.data;

    try {
      const data = await tableTopCeph.gets.getContent(
        contentTypeBucketMap[contentType],
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
            const fullChunk = Buffer.concat(chunks);

            const header = {
              type: "chunk",
              header: {
                contentType,
                contentId,
                range,
              },
            };
            const headerJson = JSON.stringify(header);
            const headerBuf = Buffer.from(headerJson, "utf8");

            // 2) Prefix with a 4‑byte big‑endian length
            const prefix = Buffer.allocUnsafe(4);
            prefix.writeUInt32BE(headerBuf.length, 0);

            // 3) Concatenate: [length][header][fileChunk]
            const payload = Buffer.concat([prefix, headerBuf, fullChunk]);

            this.broadcaster.broadcastToInstance(
              tableId,
              username,
              instance,
              payload,
              true
            );
          })
          .on("error", (_err) => {
            this.broadcaster.broadcastToInstance(tableId, username, instance, {
              type: "chunkError",
              header: { contentType, contentId },
            });
          });
      }
    } catch (err) {
      console.error("Error fetching file from S3:", err);
    }
  };
}

export default Gets;
