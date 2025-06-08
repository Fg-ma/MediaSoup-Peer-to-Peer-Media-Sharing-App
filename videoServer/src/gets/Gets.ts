import uWS from "uWebSockets.js";
import { Readable } from "stream";
import { clientBaseUrl, tableTopCeph } from "../index";
import Broadcaster from "../lib/Broadcaster";

class Gets {
  constructor(app: uWS.TemplatedApp, private broadcaster: Broadcaster) {
    app.any("/stream-video/:contentId/:file", (res, req) => {
      let isAborted = false;

      res.onAborted(() => {
        isAborted = true;
      });

      const contentId = req.getParameter(0); // :contentId
      const file = req.getParameter(1); // :file

      if (!file) return;

      const isHls = file.endsWith(".m3u8") || file.endsWith(".ts");
      const key = isHls ? `${contentId}/hls/${file}` : `${contentId}/${file}`;

      // Headers must be parsed manually
      let rangeHeader: string | undefined;

      req.forEach((key, value) => {
        if (key.toLowerCase() === "range") {
          rangeHeader = value;
        }
      });

      (async () => {
        try {
          if (!rangeHeader || isHls) {
            const result = await tableTopCeph.gets.getContent(
              "table-videos",
              key
            );

            if (!result?.Body || !(result.Body instanceof Readable)) {
              res.cork(() => {
                res
                  .writeStatus("404 Not Found")
                  .writeHeader("Access-Control-Allow-Origin", clientBaseUrl!)
                  .end("File not found");
              });
              return;
            }

            const chunks: Buffer[] = [];
            for await (const chunk of result.Body) {
              chunks.push(chunk as Buffer);
            }

            const buffer = Buffer.concat(chunks);
            console.log(buffer);
            res.cork(() => {
              res
                .writeHeader("Content-Type", this.getMimeType(file))
                .writeHeader("Access-Control-Allow-Origin", clientBaseUrl!)
                .end(buffer);
            });
          } else {
            const head = await tableTopCeph.gets.getHead("table-videos", key);
            const fileSize = head?.ContentLength ?? 0;

            const [startStr, endStr] = rangeHeader
              .replace(/bytes=/, "")
              .split("-");
            const start = parseInt(startStr, 10);
            const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
            const chunkSize = end - start + 1;

            const result = await tableTopCeph.gets.getContent(
              "table-videos",
              key,
              `bytes=${start}-${end}`
            );

            if (!result?.Body || !(result.Body instanceof Readable)) {
              res.cork(() => {
                res
                  .writeStatus("404 Not Found")
                  .writeHeader("Access-Control-Allow-Origin", clientBaseUrl!)
                  .end("File chunk not found");
              });
              return;
            }

            const chunks: Buffer[] = [];
            for await (const chunk of result.Body) {
              chunks.push(chunk as Buffer);
            }

            const buffer = Buffer.concat(chunks);

            res.cork(() => {
              res
                .writeStatus("206 Partial Content")
                .writeHeader(
                  "Content-Range",
                  `bytes ${start}-${end}/${fileSize}`
                )
                .writeHeader("Accept-Ranges", "bytes")
                .writeHeader("Content-Length", chunkSize.toString())
                .writeHeader("Content-Type", this.getMimeType(file))
                .writeHeader("Access-Control-Allow-Origin", clientBaseUrl!)
                .end(buffer);
            });
          }
        } catch (err) {
          console.error("Streaming error:", err);
          if (!isAborted) {
            res.cork(() => {
              res
                .writeStatus("500 Internal Server Error")
                .end("Internal Server Error");
            });
          }
        }
      })();
    });
  }

  private getMimeType = (file: string) => {
    if (file.endsWith(".m3u8")) return "application/vnd.apple.mpegurl";
    if (file.endsWith(".ts")) return "video/mp2t";
    if (file.endsWith(".mp4")) return "video/mp4";
    return "application/octet-stream";
  };

  // onGetDownloadMeta = async (event: onGetDownloadMetaType) => {
  //   const { tableId, username, instance, contentType, contentId } =
  //     event.header;

  //   try {
  //     const head = await tableTopCeph.gets.getHead(
  //       contentTypeBucketMap[contentType],
  //       contentId
  //     );
  //     const fileSize = head?.ContentLength ?? 0;

  //     if (fileSize > 1024 * 1024) {
  //       this.broadcaster.broadcastToInstance(tableId, username, instance, {
  //         type: "downloadMeta",
  //         header: { contentType, contentId },
  //         data: { fileSize },
  //       });
  //     } else {
  //       const data = await tableTopCeph.gets.getContent(
  //         contentTypeBucketMap[contentType],
  //         contentId
  //       );

  //       if (data?.Body instanceof Readable) {
  //         const stream = data.Body as Readable;

  //         const chunks: Buffer[] = [];

  //         stream
  //           .on("data", (chunk) => {
  //             chunks.push(chunk);
  //           })
  //           .on("end", () => {
  //             const fullChunk = Buffer.concat(chunks);

  //             const header = {
  //               type: "oneShotDownload",
  //               header: {
  //                 contentType,
  //                 contentId,
  //               },
  //             };
  //             const headerJson = JSON.stringify(header);
  //             const headerBuf = Buffer.from(headerJson, "utf8");

  //             // 2) Prefix with a 4‑byte big‑endian length
  //             const prefix = Buffer.allocUnsafe(4);
  //             prefix.writeUInt32BE(headerBuf.length, 0);

  //             // 3) Concatenate: [length][header][fileChunk]
  //             const payload = Buffer.concat([prefix, headerBuf, fullChunk]);

  //             this.broadcaster.broadcastToInstance(
  //               tableId,
  //               username,
  //               instance,
  //               payload,
  //               true
  //             );
  //           })
  //           .on("error", (_err) => {
  //             this.broadcaster.broadcastToInstance(
  //               tableId,
  //               username,
  //               instance,
  //               {
  //                 type: "downloadError",
  //                 header: { contentType, contentId },
  //               }
  //             );
  //           });
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Error fetching file from S3:", err);
  //   }
  // };

  // onGetFileChunk = async (event: onGetFileChunkType) => {
  //   const { tableId, username, instance, contentType, contentId } =
  //     event.header;

  //   const { range } = event.data;

  //   try {
  //     const data = await tableTopCeph.gets.getContent(
  //       contentTypeBucketMap[contentType],
  //       contentId,
  //       range
  //     );

  //     if (data?.Body instanceof Readable) {
  //       const stream = data.Body as Readable;

  //       const chunks: Buffer[] = [];

  //       stream
  //         .on("data", (chunk) => {
  //           chunks.push(chunk);
  //         })
  //         .on("end", () => {
  //           const fullChunk = Buffer.concat(chunks);

  //           const header = {
  //             type: "chunk",
  //             header: {
  //               contentType,
  //               contentId,
  //               range,
  //             },
  //           };
  //           const headerJson = JSON.stringify(header);
  //           const headerBuf = Buffer.from(headerJson, "utf8");

  //           // 2) Prefix with a 4‑byte big‑endian length
  //           const prefix = Buffer.allocUnsafe(4);
  //           prefix.writeUInt32BE(headerBuf.length, 0);

  //           // 3) Concatenate: [length][header][fileChunk]
  //           const payload = Buffer.concat([prefix, headerBuf, fullChunk]);

  //           this.broadcaster.broadcastToInstance(
  //             tableId,
  //             username,
  //             instance,
  //             payload,
  //             true
  //           );
  //         })
  //         .on("error", (_err) => {
  //           this.broadcaster.broadcastToInstance(tableId, username, instance, {
  //             type: "chunkError",
  //             header: { contentType, contentId },
  //           });
  //         });
  //     }
  //   } catch (err) {
  //     console.error("Error fetching file from S3:", err);
  //   }
  // };
}

export default Gets;
