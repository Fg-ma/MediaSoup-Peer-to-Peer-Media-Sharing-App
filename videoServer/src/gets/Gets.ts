import uWS from "uWebSockets.js";
import { Readable } from "stream";
import { clientBaseUrl, tableTopCeph, sanitizationUtils } from "../index";

class Gets {
  constructor(app: uWS.TemplatedApp) {
    app.any("/stream-video/:contentId/:file", (res, req) => {
      let isAborted = false;
      res.onAborted(() => {
        isAborted = true;
      });

      const dirtyContentId = req.getParameter(0);
      if (!dirtyContentId) {
        if (!isAborted) {
          this.sendResponse(
            res,
            "400 Bad Request",
            "text/plain",
            "Missing content id"
          );
          isAborted = true;
        }
        return;
      }
      const contentId = sanitizationUtils.sanitizeString(dirtyContentId);

      const dirtyFile = req.getParameter(1);
      if (!dirtyFile) {
        if (!isAborted) {
          this.sendResponse(
            res,
            "400 Bad Request",
            "text/plain",
            "Missing file"
          );
          isAborted = true;
        }
        return;
      }
      const file = sanitizationUtils.sanitizeString(dirtyFile);

      const isHls = file.endsWith(".m3u8") || file.endsWith(".ts");
      const key = isHls ? `${contentId}/hls/${file}` : `${contentId}/${file}`;

      // Headers must be parsed manually
      let rangeHeader: string | undefined;
      req.forEach((key, value) => {
        const safeKey = sanitizationUtils.sanitizeString(key);

        if (safeKey.toLowerCase() === "range") {
          const safeValue = sanitizationUtils.sanitizeString(value, "=");
          rangeHeader = safeValue;
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
              if (!isAborted) {
                this.sendResponse(
                  res,
                  "404 Not Found",
                  "text/plain",
                  "File not found"
                );
                isAborted = true;
              }
              return;
            }

            const chunks: Buffer[] = [];
            for await (const chunk of result.Body) {
              chunks.push(chunk as Buffer);
            }

            const buffer = Buffer.concat(chunks);

            if (!isAborted) {
              res.cork(() => {
                res
                  .writeHeader("Content-Type", this.getMimeType(file))
                  .writeHeader("Access-Control-Allow-Origin", clientBaseUrl!)
                  .end(buffer);
              });
            }
          } else {
            const head = await tableTopCeph.gets.getHead("table-videos", key);
            if (!head) {
              if (!isAborted) {
                this.sendResponse(
                  res,
                  "404 Not Found",
                  "text/plain",
                  "File not found"
                );
                isAborted = true;
              }
              return;
            }
            const fileSize = head.ContentLength ?? 0;

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
              if (!isAborted) {
                this.sendResponse(
                  res,
                  "404 Not Found",
                  "text/plain",
                  "File not found"
                );
                isAborted = true;
              }
              return;
            }

            const chunks: Buffer[] = [];
            for await (const chunk of result.Body) {
              chunks.push(chunk as Buffer);
            }

            const buffer = Buffer.concat(chunks);

            if (!isAborted) {
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
          }
        } catch (_) {
          if (!isAborted) {
            this.sendResponse(
              res,
              "500 Internal Server Error",
              "text/plain",
              "Internal Server Error"
            );
          }
        }
      })();
    });

    app.any("/stream-video-thumbnail/:contentId", (res, req) => {
      let isAborted = false;
      res.onAborted(() => {
        isAborted = true;
      });

      const dirtyContentId = req.getParameter(0);
      if (!dirtyContentId) {
        if (!isAborted) {
          this.sendResponse(
            res,
            "400 Bad Request",
            "text/plain",
            "Missing content id"
          );
          isAborted = true;
        }
        return;
      }
      const contentId = sanitizationUtils.sanitizeString(dirtyContentId);

      (async () => {
        try {
          const result = await tableTopCeph.gets.getContent(
            "table-videos",
            `${contentId}/thumbnail.jpg`
          );

          if (!result?.Body || !(result.Body instanceof Readable)) {
            if (!isAborted) {
              this.sendResponse(
                res,
                "404 Not Found",
                "text/plain",
                "File not found"
              );
              isAborted = true;
            }
            return;
          }

          const chunks: Buffer[] = [];
          for await (const chunk of result.Body) {
            chunks.push(chunk as Buffer);
          }

          const buffer = Buffer.concat(chunks);

          if (!isAborted) {
            res.cork(() => {
              res
                .writeHeader("Content-Type", "image/jpg")
                .writeHeader("Access-Control-Allow-Origin", clientBaseUrl!)
                .end(buffer);
            });
          }
        } catch (_) {
          if (!isAborted) {
            this.sendResponse(
              res,
              "500 Internal Server Error",
              "text/plain",
              "Internal Server Error"
            );
          }
        }
      })();
    });

    app.any("/download-video/:contentId/:file", (res, req) => {
      let isAborted = false;
      res.onAborted(() => (isAborted = true));

      const dirtyContentId = req.getParameter(0);
      if (!dirtyContentId) {
        if (!isAborted) {
          this.sendResponse(
            res,
            "400 Bad Request",
            "text/plain",
            "Missing content id"
          );
          isAborted = true;
        }
        return;
      }
      const contentId = sanitizationUtils.sanitizeString(dirtyContentId);

      const dirtyFile = req.getParameter(1);
      if (!dirtyFile) {
        if (!isAborted) {
          this.sendResponse(
            res,
            "400 Bad Request",
            "text/plain",
            "Missing file"
          );
          isAborted = true;
        }
        return;
      }
      const file = sanitizationUtils.sanitizeString(dirtyFile);

      const key = `${contentId}/${file}`;

      (async () => {
        try {
          const result = await tableTopCeph.gets.getContent(
            "table-videos",
            key
          );

          if (!result?.Body || !(result.Body instanceof Readable)) {
            if (!isAborted) {
              this.sendResponse(
                res,
                "404 Not Found",
                "text/plain",
                "File not found"
              );
              isAborted = true;
            }
            return;
          }

          const chunks: Buffer[] = [];
          for await (const chunk of result.Body) chunks.push(chunk as Buffer);
          const buffer = Buffer.concat(chunks);

          if (!isAborted) {
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
          }
        } catch (_) {
          if (!isAborted) {
            this.sendResponse(
              res,
              "500 Internal Server Error",
              "text/plain",
              "Download error"
            );
          }
        }
      })();
    });
  }

  private sendResponse = (
    res: uWS.HttpResponse,
    status: string,
    contentType: string,
    end: string
  ) => {
    if (!clientBaseUrl) {
      res.cork(() => {
        res.writeStatus("403 Forbidden");
        res.writeHeader("Content-Type", "text/plain");
        res.end("Origin header missing - request blocked");
      });
    } else {
      res.cork(() => {
        res
          .writeStatus(status)
          .writeHeader("Content-Type", contentType)
          .writeHeader("Access-Control-Allow-Origin", clientBaseUrl!)
          .end(end);
      });
    }
  };

  private getMimeType = (file: string) => {
    if (file.endsWith(".m3u8")) return "application/vnd.apple.mpegurl";
    if (file.endsWith(".ts")) return "video/mp2t";
    if (file.endsWith(".mp4")) return "video/mp4";
    return "application/octet-stream";
  };
}

export default Gets;
