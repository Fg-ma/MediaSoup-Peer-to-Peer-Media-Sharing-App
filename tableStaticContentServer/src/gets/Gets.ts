import { z } from "zod";
import { Readable } from "stream";
import { tableTopCeph, sanitizationUtils } from "../index";
import {
  contentTypeBucketMap,
  onGetDownloadMetaType,
  onGetFileChunkType,
} from "../typeConstant";
import Broadcaster from "../lib/Broadcaster";
import { StaticContentTypesArray } from "../../../universal/contentTypeConstant";

class Gets {
  constructor(private broadcaster: Broadcaster) {}

  private getDownloadMetaSchema = z.object({
    type: z.literal("getDownloadMeta"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      contentType: z.enum(StaticContentTypesArray),
      contentId: z.string(),
    }),
  });

  onGetDownloadMeta = async (event: onGetDownloadMetaType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onGetDownloadMetaType;
    const validation = this.getDownloadMetaSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance, contentType, contentId } =
      safeEvent.header;

    try {
      const head = await tableTopCeph.gets.getHead(
        contentTypeBucketMap[contentType],
        contentId
      );
      const fileSize = head?.ContentLength ?? 0;

      if (fileSize > 1024 * 1024) {
        this.broadcaster.broadcastToInstance(tableId, username, instance, {
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
                  header: { contentType, contentId },
                }
              );
            });
        }
      }
    } catch (err) {
      console.error("Error fetching file from S3:", err);
    }
  };

  private getFileChunkSchema = z.object({
    type: z.literal("getFileChunk"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      contentType: z.enum(StaticContentTypesArray),
      contentId: z.string(),
    }),
    data: z.object({
      range: z.string(),
    }),
  });

  onGetFileChunk = async (event: onGetFileChunkType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(event, {
      range: "=",
    }) as onGetFileChunkType;
    const validation = this.getFileChunkSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance, contentType, contentId } =
      safeEvent.header;
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
