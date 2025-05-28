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
        const chunks = await tableTopRedis.gets.lrange(
          `LTE:${tableId}:${contentId}:file`
        );

        if (chunks.length === 0) {
          const data = await tableTopCeph.gets.getContent(
            "table-text",
            contentId
          );

          if (data?.Body instanceof Readable) {
            const stream = data.Body as Readable;
            let buffer = Buffer.alloc(0);

            await new Promise<void>((resolve) => {
              stream.on("data", async (chunk) => {
                buffer = Buffer.concat([buffer, chunk]);

                while (buffer.length >= 4) {
                  const updateLength = buffer.readUInt32LE(0);

                  // If not enough data yet to read the full update, wait for more
                  if (buffer.length < 4 + updateLength) break;

                  const update = buffer.subarray(4, 4 + updateLength);

                  buffer = buffer.subarray(4 + updateLength);

                  // Save to Redis for fast rehydration later
                  await tableTopRedis.posts.rpush(
                    `LTE:${tableId}:${contentId}:file`,
                    JSON.stringify(Array.from(update))
                  );
                }
              });

              stream.on("end", async () => {
                if (buffer.length >= 4) {
                  const updateLength = buffer.readUInt32LE(0);
                  if (buffer.length >= 4 + updateLength) {
                    const update = buffer.subarray(4, 4 + updateLength);

                    await tableTopRedis.posts.rpush(
                      `LTE:${tableId}:${contentId}:file`,
                      JSON.stringify(Array.from(update))
                    );
                  }
                }

                resolve();
              });
            });
          }
        }

        this.broadcaster.broadcastToInstance(tableId, username, instance, {
          type: "downloadMeta",
          header: { contentId },
          data: { fileSize },
        });
      } else {
        const chunks = await tableTopRedis.gets.lrange(
          `LTE:${tableId}:${contentId}:file`
        );

        if (chunks.length === 0) {
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

                await tableTopRedis.posts.rpush(
                  `LTE:${tableId}:${contentId}:file`,
                  JSON.stringify(Array.from(update))
                );

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
        } else {
          const ydoc = new Y.Doc();
          for (const chunk of chunks) {
            try {
              const updateObj = JSON.parse(chunk);
              const update = Uint8Array.from(Object.values(updateObj));
              Y.applyUpdate(ydoc, update);
            } catch (_) {
              console.warn("Invalid Yjs update in Redis:", chunk);
            }
          }

          const payload = Y.encodeStateAsUpdate(ydoc);

          // 1) Build the JSON header
          const headerObj = {
            type: "oneShotDownload",
            header: { contentId, fileSize },
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
    const { tableId, username, instance, contentId } = event.header;

    const { idx } = event.data;

    try {
      const chunk = await tableTopRedis.gets.lindex(
        `LTE:${tableId}:${contentId}:file`,
        idx
      );

      if (!chunk) {
        this.broadcaster.broadcastToInstance(tableId, username, instance, {
          type: "downloadFinished",
          header: { contentId },
        });
        return;
      }

      const ydoc = new Y.Doc();

      const updateObj = JSON.parse(chunk);
      const update = Uint8Array.from(Object.values(updateObj));
      Y.applyUpdate(ydoc, update);

      const payload = Y.encodeStateAsUpdate(ydoc);

      // 1) Build the JSON header
      const headerObj = {
        type: "chunk",
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
    } catch (err) {
      console.error("Error fetching file from S3:", err);
    }
  };
}

export default Gets;
