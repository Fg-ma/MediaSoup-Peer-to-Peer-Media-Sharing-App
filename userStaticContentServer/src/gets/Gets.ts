import { Readable } from "stream";
import { tableTopCeph, sanitizationUtils } from "../index";
import {
  contentTypeBucketMap,
  onGetDownloadMetaType,
  onGetFileChunkType,
} from "../typeConstant";
import Broadcaster from "../lib/Broadcaster";

class Gets {
  constructor(private broadcaster: Broadcaster) {}

  onGetDownloadMeta = async (event: onGetDownloadMetaType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onGetDownloadMetaType;
    const { userId, instance, contentType, contentId } = safeEvent.header;

    try {
      const head = await tableTopCeph.gets.getHead(
        contentTypeBucketMap[contentType],
        contentId
      );
      const fileSize = head?.ContentLength ?? 0;

      if (fileSize > 1024 * 1024) {
        this.broadcaster.broadcastToInstance(userId, instance, {
          type: "downloadMeta",
          header: { contentType, contentId },
          data: { fileSize },
        });
      } else {
        const data = await tableTopCeph.gets.getContent(
          contentTypeBucketMap[contentType],
          contentId
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
                type: "oneShotDownload",
                header: {
                  contentType,
                  contentId,
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
                userId,
                instance,
                payload,
                true
              );
            })
            .on("error", (_err) => {
              this.broadcaster.broadcastToInstance(userId, instance, {
                type: "downloadError",
                header: { contentType, contentId },
              });
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
    const { userId, instance, contentType, contentId } = safeEvent.header;
    const { range } = safeEvent.data;

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
              userId,
              instance,
              payload,
              true
            );
          })
          .on("error", (_err) => {
            this.broadcaster.broadcastToInstance(userId, instance, {
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
