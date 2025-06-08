import uWS from "uWebSockets.js";
import busboy from "busboy";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import {
  CEPH_CHUNK_MAX_SIZE,
  CEPH_MAX_SIZE,
  clientBaseUrl,
  tableTopRedis,
} from "../index";
import Utils from "./lib/Utils";
import {
  TableContentStateTypes,
  StaticMimeTypes,
  mimeToExtension,
} from "../../../universal/contentTypeConstant";
import { ChunkState, UploadSession } from "./lib/typeConstant";
import Broadcaster from "src/lib/Broadcaster";
import { videoTranscodeQueue } from "./lib/queues";

const tableStaticContentUtils = new Utils();

class Posts {
  private readonly REDIS_UPLOAD_LIFE_TIME = 1800;

  constructor(app: uWS.TemplatedApp, private broadcaster: Broadcaster) {
    app.post("/upload-one-shot-file", (res, req) => {
      const bb = busboy({
        headers: this.collectHeaders(req),
        limits: { fileSize: CEPH_MAX_SIZE },
      });

      let aborted = false;
      res.onAborted(() => {
        aborted = true;
      });

      let metadata: {
        tableId: string;
        contentId: string;
        instanceId: string;
        direction: string;
        state: TableContentStateTypes[];
        initPositioning?: {
          position: { top: number; left: number };
          scale: { x: number; y: number };
          rotation: number;
        };
        mimeType: StaticMimeTypes;
        filename: string;
      } | null = null;

      bb.on("field", (fieldname, val) => {
        if (fieldname === "metadata") {
          try {
            metadata = JSON.parse(val);
          } catch (e) {
            console.error("Invalid JSON in metadata field", e);
          }
        }
      });

      bb.on("file", async (_, file) => {
        if (!metadata || aborted) return;

        if (metadata.direction === "reupload") {
          const checkReupload = await tableTopRedis.gets.getKey(
            `VRU:${metadata.contentId}`
          );

          if (checkReupload !== null) {
            this.sendResponse(
              res,
              "409 Conflict",
              "text/plain",
              "Reupload already taking place"
            );
            aborted = true;
          } else {
            await tableTopRedis.posts.post(
              "VRU",
              metadata.contentId,
              "",
              this.REDIS_UPLOAD_LIFE_TIME
            );
          }
        }

        file.on("limit", () => {
          this.sendResponse(
            res,
            "413 Payload Too Large",
            "text/plain",
            "File too large"
          );
          aborted = true;
          return;
        });

        const sanitizedFilename = tableStaticContentUtils.sanitizeString(
          metadata.filename.slice(0, metadata.filename.lastIndexOf("."))
        );
        const sanitizedMimeType = tableStaticContentUtils.sanitizeMimeType(
          metadata.mimeType
        );
        const completeFilename = `${sanitizedFilename}${
          mimeToExtension[sanitizedMimeType as StaticMimeTypes]
        }`;
        console.log(completeFilename);

        // Save file
        // tableTopCeph.posts
        //   .uploadFile(
        //     contentTypeBucketMap[staticContentType],
        //     metadata.contentId,
        //     file
        //   )
        //   .then(async () => {
        //     if (aborted) {
        //       tableTopCeph.deletes.deleteFile(
        //         contentTypeBucketMap[staticContentType],
        //         metadata!.contentId
        //       );
        //       return;
        //     }

        //     if (!metadata) return;

        //     switch (metadata.direction) {
        //       case "toTable":
        //         await this.handleToTable(
        //           metadata.tableId,
        //           metadata.contentId,
        //           metadata.instanceId,
        //           metadata.mimeType,
        //           completeFilename,
        //           metadata.state,
        //           metadata.initPositioning
        //         );
        //         break;
        //       case "reupload":
        //         this.handleReupload(metadata.tableId, metadata.contentId);
        //         break;
        //       case "toTabled":
        //         await this.handleToTabled(
        //           metadata.tableId,
        //           metadata.contentId,
        //           metadata.mimeType,
        //           completeFilename,
        //           metadata.state
        //         );
        //         break;
        //       default:
        //         break;
        //     }

        //     if (metadata.direction === "reupload") {
        //       await tableTopRedis.deletes.delete([
        //         { prefix: "VRU", id: metadata.contentId },
        //       ]);
        //     }
        //   });

        file.on("error", (err) => {
          console.error(`Error writing file:`, err);
        });
      });

      bb.on("close", () => {
        if (!aborted) {
          this.sendResponse(res, "200 OK", "text/plain", "That's all folks!");
        }
      });

      this.pipeReqToBusboy(res, bb);
    });

    app.post("/upload-chunk-meta", (res, _) => {
      let buffer = "";

      let aborted = false;
      res.onAborted(() => {
        aborted = true;
      });

      res.onData(async (chunk, isLast) => {
        buffer += Buffer.from(chunk).toString();

        if (isLast) {
          if (aborted) return;

          try {
            const metadata = JSON.parse(buffer);
            const {
              tableId,
              username,
              instance,
              contentId,
              instanceId,
              direction,
              state,
              mimeType,
              filename,
            } = metadata;

            if (
              tableId === undefined ||
              username === undefined ||
              instance === undefined ||
              contentId === undefined ||
              mimeType === undefined ||
              direction === undefined
            ) {
              this.sendResponse(
                res,
                "400 Bad Request",
                "text/plain",
                "Missing fields"
              );
              return;
            }

            if (direction === "reupload") {
              const checkReupload = await tableTopRedis.gets.getKey(
                `VRU:${contentId}`
              );

              if (checkReupload !== null) {
                this.sendResponse(
                  res,
                  "409 Conflict",
                  "text/plain",
                  "Reupload already taking place"
                );
                return;
              } else {
                await tableTopRedis.posts.post(
                  "VRU",
                  contentId,
                  "",
                  this.REDIS_UPLOAD_LIFE_TIME
                );
              }
            }

            const uploadId = uuidv4();

            if (!uploadId) {
              this.sendResponse(
                res,
                "400 Bad Request",
                "text/plain",
                "Missing upload id"
              );
              return;
            }

            await tableTopRedis.posts.post(
              "VCS",
              uploadId,
              {
                parts: [],
                currentSize: 0,
              },
              this.REDIS_UPLOAD_LIFE_TIME
            );

            const sessionData = {
              tableId,
              username,
              instance,
              direction,
              contentId,
              mimeType,
            };

            if (direction === "toTable") {
              Object.assign(sessionData, { instanceId, state, filename });
            } else if (direction === "toTabled") {
              Object.assign(sessionData, { state, filename });
            }

            await tableTopRedis.posts.post(
              "VUS",
              uploadId,
              sessionData,
              this.REDIS_UPLOAD_LIFE_TIME
            );

            if (!aborted) {
              this.sendResponse(
                res,
                "200 OK",
                "application/json",
                JSON.stringify({ uploadId })
              );
            }
          } catch (_) {
            if (!aborted) {
              this.sendResponse(
                res,
                "400 Bad Request",
                "text/plain",
                "Invalid JSON or missing fields"
              );
            }
          }
        }
      });
    });

    app.post("/upload-chunk/:uploadId", (res, req) => {
      const bb = busboy({
        headers: this.collectHeaders(req),
        limits: { fileSize: CEPH_CHUNK_MAX_SIZE },
      });
      let chunkIndex = -1,
        totalChunks = -1;
      let buffer = Buffer.alloc(0);

      let aborted = false;
      let state: ChunkState | undefined;
      let session: UploadSession | undefined;

      res.onAborted(() => {
        aborted = true;
      });

      const uploadId = req.getParameter(0);
      if (!uploadId) {
        this.sendResponse(res, "404 Not Found", "text/plain", "No upload id");
        aborted = true;
        return;
      }

      bb.on("field", async (name, val) => {
        if (name === "totalChunks") totalChunks = parseInt(val, 10);
        if (name === "chunkIndex") {
          chunkIndex = parseInt(val, 10);

          state = (await tableTopRedis.gets.get("VCS", uploadId)) as ChunkState;
          if (!state) {
            if (!aborted) {
              this.sendResponse(res, "404 Not Found", "text/plain", "No state");
              aborted = true;
            }
            return;
          }

          const alreadyUploaded = state.parts.some(
            (part) => part === chunkIndex
          );
          if (alreadyUploaded && !aborted) {
            this.sendResponse(
              res,
              "409 Conflict",
              "text/plain",
              "Chunk already exists"
            );
            aborted = true;
          }
        }
      });

      bb.on("file", async (_fn, stream) => {
        stream.on("limit", async () => {
          this.sendResponse(
            res,
            "413 Payload Too Large",
            "text/plain",
            "Chunk too large"
          );
          aborted = true;

          if (!session) return;

          // await tableTopCeph.posts.abortMultipartUpload(
          //   contentTypeBucketMap[session.staticContentType],
          //   session.contentId,
          //   uploadId
          // );

          await tableTopRedis.deletes.delete([
            { prefix: "VUS", id: uploadId },
            { prefix: "VCS", id: uploadId },
          ]);

          return;
        });

        session = (await tableTopRedis.gets.get(
          "VUS",
          uploadId
        )) as UploadSession;
        if (!session) {
          this.sendResponse(res, "404 Not Found", "text/plain", "No session");
          aborted = true;
          return;
        }

        if (!state) {
          state = (await tableTopRedis.gets.get("VCS", uploadId)) as ChunkState;
        }
        if (!state) {
          this.sendResponse(res, "404 Not Found", "text/plain", "No state");
          aborted = true;
          return;
        }

        stream.on("data", async (d) => (buffer = Buffer.concat([buffer, d])));

        stream.on("end", async () => {
          if (aborted) return;
          const tmpDir = `/tmp/tableTopVideoServerUploads/${uploadId}`;
          await fs.promises.mkdir(tmpDir, { recursive: true });

          const chunkPath = path.join(tmpDir, `chunk-${chunkIndex}`);
          await fs.promises.writeFile(chunkPath, buffer);

          state!.parts.push(chunkIndex);
          state!.currentSize += buffer.byteLength;

          if (aborted) return;

          if (state!.currentSize > CEPH_MAX_SIZE) {
            this.sendResponse(
              res,
              "413 Payload Too Large",
              "text/plain",
              "File upload to large"
            );
            aborted = true;

            if (!session) return;

            // await tableTopCeph.posts.abortMultipartUpload(
            //   contentTypeBucketMap[session.staticContentType],
            //   session.contentId,
            //   uploadId
            // );

            await tableTopRedis.deletes.delete([
              { prefix: "VUS", id: uploadId },
              { prefix: "VCS", id: uploadId },
            ]);

            return;
          }

          if (aborted) return;

          await tableTopRedis.posts.post(
            "VCS",
            uploadId,
            state,
            this.REDIS_UPLOAD_LIFE_TIME
          );
          await tableTopRedis.posts.extendLife(
            "VUS",
            uploadId,
            this.REDIS_UPLOAD_LIFE_TIME
          );
          if (session && session.direction === "reupload") {
            await tableTopRedis.posts.extendLife(
              "VRU",
              session.contentId,
              this.REDIS_UPLOAD_LIFE_TIME
            );
          }

          if (aborted) return;

          // If last chunk
          if (state!.parts.length === totalChunks) {
            const outputPath = path.join(tmpDir, "input.mp4");

            const writeStream = fs.createWriteStream(outputPath);
            for (let i = 0; i < totalChunks; i++) {
              const chunk = await fs.promises.readFile(
                path.join(tmpDir, `chunk-${i}`)
              );
              writeStream.write(chunk);
            }
            writeStream.end();

            videoTranscodeQueue.add(
              "transcode",
              session?.direction === "toTable"
                ? {
                    tableId: session!.tableId,
                    username: session!.username,
                    instance: session!.instance,
                    uploadId,
                    tmpDir,
                    contentId: session!.contentId,
                    filename: session!.filename,
                    direction: session!.direction,
                    mimeType: session!.mimeType,
                    instanceId: session!.instanceId,
                    state: session!.state,
                  }
                : session?.direction === "toTabled"
                ? {
                    uploadId,
                    tmpDir,
                    contentId: session!.contentId,
                    tableId: session!.tableId,
                    filename: session!.filename,
                    direction: session!.direction,
                    mimeType: session!.mimeType,
                    state: session!.state,
                  }
                : {
                    uploadId,
                    tmpDir,
                    contentId: session!.contentId,
                    tableId: session!.tableId,
                    direction: session!.direction,
                    mimeType: session!.mimeType,
                  }
            );
          }

          if (aborted) return;

          this.sendResponse(res, "200 OK", "text/plain", "Chunk received");
        });
      });

      if (!aborted) {
        this.pipeReqToBusboy(res, bb);
      }
    });

    app.post("/cancel-upload/:uploadId", async (res, req) => {
      let aborted = false;
      res.onAborted(() => {
        aborted = true;
      });

      const uploadId = req.getParameter(0);

      if (!uploadId) {
        this.sendResponse(
          res,
          "400 Bad Request",
          "text/plain",
          "Missing upload ID"
        );
        return;
      }

      const session = (await tableTopRedis.gets.get(
        "VUS",
        uploadId
      )) as UploadSession;
      if (!session) {
        this.sendResponse(
          res,
          "404 Not Found",
          "text/plain",
          "Missing session"
        );
        return;
      }

      // Async work must be done in next tick or promise
      (async () => {
        try {
          // await tableTopCeph.posts.abortMultipartUpload(
          //   contentTypeBucketMap[session.staticContentType],
          //   session.contentId,
          //   uploadId
          // );

          await tableTopRedis.deletes.delete(
            [
              { prefix: "VUS", id: uploadId },
              { prefix: "VCS", id: uploadId },
              session?.direction === "reupload"
                ? { prefix: "VRU", id: session.contentId }
                : undefined,
            ].filter((del) => del !== undefined)
          );

          this.broadcaster.broadcastToTable(session.tableId, {
            type: "reuploadCancelled",
            header: {
              contentId: session.contentId,
            },
          });

          if (!aborted) {
            this.sendResponse(res, "200 OK", "text/plain", "Upload cancelled");
          }
        } catch (_) {
          this.broadcaster.broadcastToTable(session.tableId, {
            type: "reuploadCancelled",
            header: {
              contentId: session.contentId,
            },
          });

          if (!aborted) {
            this.sendResponse(
              res,
              "500 Internal Server Error",
              "text/plain",
              "Cancel failed"
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

  private collectHeaders(req: uWS.HttpRequest) {
    const h: Record<string, string> = {};
    req.forEach((k, v) => (h[k] = v));
    return h;
  }

  private pipeReqToBusboy(res: uWS.HttpResponse, bb: busboy.Busboy) {
    let buffer = Buffer.alloc(0);
    res.onData((chunk, isLast) => {
      buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
      if (isLast) {
        bb.end(buffer);
      }
    });
  }
}

export default Posts;
