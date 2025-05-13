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
  private active: Map<string, ActiveDownload> = new Map();

  constructor(private broadcaster: Broadcaster) {}

  onPauseDownload = (event: onPauseDownloadType) => {
    const dl = this.active.get(event.header.downloadId);
    if (!dl) return;
    dl.paused = true;
  };

  onResumeDownload = (event: onResumeDownloadType) => {
    const dl = this.active.get(event.header.downloadId);
    if (!dl) return;

    dl.paused = false;

    const { contentType, contentId } = dl.header;
    console.log(dl.buffer);
    for (const chunk of dl.buffer) {
      this.broadcaster.broadcastToInstance(
        dl.header.tableId,
        dl.header.username,
        dl.header.instance,
        {
          type: "chunk",
          header: { contentType, contentId },
          data: { downloadId: event.header.downloadId, chunk },
        }
      );
    }
    this.broadcaster.broadcastToInstance(
      dl.header.tableId,
      dl.header.username,
      dl.header.instance,
      {
        type: "downloadComplete",
        header: { contentType, contentId },
        data: { downloadId: event.header.downloadId },
      }
    );
    this.active.delete(event.header.downloadId);
    dl.buffer.length = 0;
  };

  onCancelDownload = (event: onCancelDownloadType) => {
    const { downloadId } = event.header;
    const dl = this.active.get(downloadId);
    if (!dl) return;
    dl.stream.destroy(new Error("Download canceled by user"));
    this.active.delete(downloadId);
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
        this.active.set(downloadId, {
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
            const dl = this.active.get(downloadId)!;
            if (dl.paused) {
              dl.buffer.push(chunk);
            } else {
              this.broadcaster.broadcastToInstance(
                tableId,
                username,
                instance,
                {
                  type: "chunk",
                  header: { contentType, contentId },
                  data: { downloadId, chunk },
                }
              );
            }
          })
          .on("end", () => {
            const dl = this.active.get(downloadId);
            if (dl && !dl.paused) {
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
              this.active.delete(downloadId);
            }
          })
          .on("error", (_err) => {
            this.broadcaster.broadcastToInstance(tableId, username, instance, {
              type: "downloadError",
              header: { contentType, contentId },
              data: { downloadId },
            });
            this.active.delete(downloadId);
          });
      }
    } catch (err) {
      console.error("Error fetching file from S3:", err);
    }
  };
}

export default Gets;
