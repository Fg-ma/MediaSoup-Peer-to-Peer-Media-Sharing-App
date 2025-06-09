import uWS from "uWebSockets.js";
import { Readable } from "stream";
import { clientBaseUrl, tableTopCeph } from "../index";

class Gets {
  constructor(app: uWS.TemplatedApp) {
    app.any("/stream-video/:contentId/:file", (res, req) => {
      let isAborted = false;

      res.onAborted(() => {
        isAborted = true;
      });

      const contentId = req.getParameter(0);
      const file = req.getParameter(1);

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

    app.any("/download-video/:contentId/:file", (res, req) => {
      const contentId = req.getParameter(0);
      const file = req.getParameter(1);
      const key = `${contentId}/${file}`;

      if (!file || !contentId) {
        res
          .writeStatus("404 Not Found")
          .writeHeader("Access-Control-Allow-Origin", clientBaseUrl!)
          .end("File not found");
        return;
      }

      let isAborted = false;
      res.onAborted(() => (isAborted = true));

      (async () => {
        try {
          const result = await tableTopCeph.gets.getContent(
            "table-videos",
            key
          );
          console.log(result);
          if (!result?.Body || !(result.Body instanceof Readable)) {
            res
              .writeStatus("404 Not Found")
              .writeHeader("Access-Control-Allow-Origin", clientBaseUrl!)
              .end("File not found");
            return;
          }

          const chunks: Buffer[] = [];
          for await (const chunk of result.Body) chunks.push(chunk as Buffer);
          const buffer = Buffer.concat(chunks);

          res.cork(() => {
            res
              .writeHeader("Content-Type", this.getMimeType(file))
              .writeHeader(
                "Content-Disposition",
                `attachment; filename="${file}"`
              )
              .writeHeader("Content-Length", buffer.length.toString())
              .writeHeader("Access-Control-Allow-Origin", clientBaseUrl!)
              .end(buffer);
          });
        } catch (err) {
          console.error("Download error:", err);
          if (!isAborted) {
            res.writeStatus("500 Internal Server Error").end("Download error");
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
}

export default Gets;
