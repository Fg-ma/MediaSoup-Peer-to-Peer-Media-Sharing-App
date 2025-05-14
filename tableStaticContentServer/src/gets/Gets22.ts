import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";
import { tableTopCeph } from "../index";
import {
  contentTypeBucketMap,
  onCancelDownloadType,
  onGetFileType,
  onPauseDownloadType,
  onResumeDownloadType,
} from "../typeConstant";
import Broadcaster from "../lib/Broadcaster";

interface ActiveDownload {
  stream: Readable;
  header: onGetFileType["header"];
  paused: boolean;
  buffer: Buffer[];
}
class Gets {
  private activeDownloads: Map<string, ActiveDownload> = new Map();

  constructor(private broadcaster: Broadcaster) {}

  onPauseDownload = (event: onPauseDownloadType) => {
    const dl = this.activeDownloads.get(event.header.downloadId);
    if (!dl) return;
    dl.paused = true;
    dl.stream.pause();
  };

  onResumeDownload = (event: onResumeDownloadType) => {
    const dl = this.activeDownloads.get(event.header.downloadId);
    if (!dl) return;

    dl.paused = false;
    dl.stream.resume();

    const { tableId, username, instance, contentType, contentId } = dl.header;

    for (const chunk of dl.buffer) {
      const header = {
        type: "chunk",
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
      const payload = Buffer.concat([prefix, headerBuf, chunk]);

      this.broadcaster.broadcastToInstance(
        tableId,
        username,
        instance,
        payload,
        true
      );
      console.log("resume");
    }
    console.log("end3", dl.header, {
      type: "downloadComplete",
      header: { contentType, contentId },
      data: { downloadId: event.header.downloadId },
    });
    this.broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "downloadComplete",
      header: { contentType, contentId },
      data: { downloadId: event.header.downloadId },
    });
    this.activeDownloads.delete(event.header.downloadId);
  };

  onCancelDownload = (event: onCancelDownloadType) => {
    const { downloadId } = event.header;
    const dl = this.activeDownloads.get(downloadId);
    if (!dl) return;
    dl.stream.destroy(new Error("Download canceled by user"));
    this.activeDownloads.delete(downloadId);
  };

  getFile = async (event: onGetFileType) => {
    const { tableId, username, instance, contentType, contentId } =
      event.header;

    const downloadId = uuidv4();

    try {
      const data = await tableTopCeph.gets.getContent(
        contentTypeBucketMap[contentType],
        contentId
      );

      if (data?.Body instanceof Readable) {
        const stream = data.Body as Readable;
        this.activeDownloads.set(downloadId, {
          stream,
          header: event.header,
          paused: false,
          buffer: [],
        });

        const head = await tableTopCeph.gets.getHead(
          contentTypeBucketMap[contentType],
          contentId
        );
        const fileSize = head?.ContentLength ?? 0;

        this.broadcaster.broadcastToInstance(tableId, username, instance, {
          type: "downloadStarted",
          header: { contentType, contentId },
          data: { downloadId, fileSize },
        });

        stream
          .on("data", (chunk) => {
            const dl = this.activeDownloads.get(downloadId)!;
            console.log("data");
            if (dl.paused) {
              dl.buffer.push(chunk);
            } else {
              const header = {
                type: "chunk",
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
              const payload = Buffer.concat([prefix, headerBuf, chunk]);

              this.broadcaster.broadcastToInstance(
                tableId,
                username,
                instance,
                payload,
                true
              );
            }
          })
          .on("end", () => {
            console.log("end1");
            const dl = this.activeDownloads.get(downloadId);
            if (dl && !dl.paused) {
              console.log("end2");
              this.broadcaster.broadcastToInstance(
                tableId,
                username,
                instance,
                {
                  type: "downloadComplete",
                  header: { contentType, contentId },
                  data: { downloadId },
                }
              );
              this.activeDownloads.delete(downloadId);
            }
          })
          .on("error", (_err) => {
            this.broadcaster.broadcastToInstance(tableId, username, instance, {
              type: "downloadError",
              header: { contentType, contentId },
              data: { downloadId },
            });
            this.activeDownloads.delete(downloadId);
          });
      }
    } catch (err) {
      console.error("Error fetching file from S3:", err);
    }
  };
}

export default Gets;
