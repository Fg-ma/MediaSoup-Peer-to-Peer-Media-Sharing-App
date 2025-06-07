import uWS from "uWebSockets.js";
import busboy from "busboy";
import {
  broadcaster,
  CEPH_CHUNK_MAX_SIZE,
  CEPH_MAX_SIZE,
  clientBaseUrl,
  tableTopCeph,
  tableTopMongo,
  tableTopRedis,
} from "../index";
import Utils from "./lib/Utils";
import { contentTypeBucketMap } from "../typeConstant";
import {
  defaultApplicationEffectsStyles,
  defaultApplicationEffects,
  defaultAudioEffects,
  defaultImageEffectsStyles,
  defaultImageEffects,
  defaultSvgEffectsStyles,
  defaultSvgEffects,
  defaultVideoEffectsStyles,
  defaultVideoEffects,
  defaultTextEffectsStyles,
} from "../../../universal/effectsTypeConstant";
import {
  TableContentStateTypes,
  StaticContentTypes,
  StaticMimeTypes,
  mimeTypeContentTypeMap,
  mimeToExtension,
} from "../../../universal/contentTypeConstant";
import { ChunkState, UploadSession } from "./lib/typeConstant";
import Broadcaster from "src/lib/Broadcaster";

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
            `TSCRU:${metadata.contentId}`
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
              "TSCRU",
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
        const staticContentType =
          mimeTypeContentTypeMap[metadata.mimeType as StaticMimeTypes] ??
          ".bin";

        // Save file
        tableTopCeph.posts
          .uploadFile(
            contentTypeBucketMap[staticContentType],
            metadata.contentId,
            file
          )
          .then(async () => {
            if (aborted) {
              tableTopCeph.deletes.deleteFile(
                contentTypeBucketMap[staticContentType],
                metadata!.contentId
              );
              return;
            }

            if (!metadata) return;

            switch (metadata.direction) {
              case "toTable":
                await this.handleToTable(
                  staticContentType,
                  metadata.tableId,
                  metadata.contentId,
                  metadata.instanceId,
                  metadata.mimeType,
                  completeFilename,
                  metadata.state,
                  metadata.initPositioning
                );
                break;
              case "reupload":
                this.handleReupload(
                  staticContentType,
                  metadata.tableId,
                  metadata.contentId
                );
                break;
              case "toTabled":
                await this.handleToTabled(
                  staticContentType,
                  metadata.tableId,
                  metadata.contentId,
                  metadata.mimeType,
                  completeFilename,
                  metadata.state
                );
                break;
              default:
                break;
            }

            if (metadata.direction === "reupload") {
              await tableTopRedis.deletes.delete([
                { prefix: "TSCRU", id: metadata.contentId },
              ]);
            }
          });

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
              contentId,
              instanceId,
              direction,
              state,
              mimeType,
              filename,
            } = metadata;

            if (
              tableId === undefined ||
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
                `TSCRU:${contentId}`
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
                  "TSCRU",
                  contentId,
                  "",
                  this.REDIS_UPLOAD_LIFE_TIME
                );
              }
            }

            const staticContentType =
              mimeTypeContentTypeMap[mimeType as StaticMimeTypes];

            const uploadId = await tableTopCeph.posts.createMultipartUpload(
              contentTypeBucketMap[staticContentType as StaticContentTypes],
              contentId
            );
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
              "TSCCS",
              uploadId,
              {
                parts: [],
                currentSize: 0,
              },
              this.REDIS_UPLOAD_LIFE_TIME
            );

            const sessionData = {
              direction,
              tableId,
              contentId,
              staticContentType,
              mimeType,
            };

            if (direction === "toTable") {
              Object.assign(sessionData, { instanceId, state, filename });
            } else if (direction === "toTabled") {
              Object.assign(sessionData, { state, filename });
            }

            await tableTopRedis.posts.post(
              "TSCUS",
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

          state = (await tableTopRedis.gets.get(
            "TSCCS",
            uploadId
          )) as ChunkState;
          if (!state) {
            if (!aborted) {
              this.sendResponse(res, "404 Not Found", "text/plain", "No state");
              aborted = true;
            }
            return;
          }

          const alreadyUploaded = state.parts.some(
            (part) => part.PartNumber === chunkIndex + 1
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

          await tableTopCeph.posts.abortMultipartUpload(
            contentTypeBucketMap[session.staticContentType],
            session.contentId,
            uploadId
          );

          await tableTopRedis.deletes.delete([
            { prefix: "TSCUS", id: uploadId },
            { prefix: "TSCCS", id: uploadId },
          ]);

          return;
        });

        session = (await tableTopRedis.gets.get(
          "TSCUS",
          uploadId
        )) as UploadSession;
        if (!session) {
          this.sendResponse(res, "404 Not Found", "text/plain", "No session");
          aborted = true;
          return;
        }

        if (!state) {
          state = (await tableTopRedis.gets.get(
            "TSCCS",
            uploadId
          )) as ChunkState;
        }
        if (!state) {
          this.sendResponse(res, "404 Not Found", "text/plain", "No state");
          aborted = true;
          return;
        }

        stream.on("data", async (d) => (buffer = Buffer.concat([buffer, d])));

        stream.on("end", async () => {
          if (aborted) return;

          // upload this part
          const ETag = await tableTopCeph.posts.uploadPart(
            contentTypeBucketMap[session!.staticContentType],
            session!.contentId,
            chunkIndex + 1,
            uploadId,
            buffer
          );
          if (!ETag) return;

          state!.parts.push({ PartNumber: chunkIndex + 1, ETag });
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

            await tableTopCeph.posts.abortMultipartUpload(
              contentTypeBucketMap[session.staticContentType],
              session.contentId,
              uploadId
            );

            await tableTopRedis.deletes.delete([
              { prefix: "TSCUS", id: uploadId },
              { prefix: "TSCCS", id: uploadId },
            ]);

            return;
          }

          if (aborted) return;

          await tableTopRedis.posts.post(
            "TSCCS",
            uploadId,
            state,
            this.REDIS_UPLOAD_LIFE_TIME
          );
          await tableTopRedis.posts.extendLife(
            "TSCUS",
            uploadId,
            this.REDIS_UPLOAD_LIFE_TIME
          );
          if (session && session.direction === "reupload") {
            await tableTopRedis.posts.extendLife(
              "TSCRU",
              session.contentId,
              this.REDIS_UPLOAD_LIFE_TIME
            );
          }

          if (aborted) return;

          // If last chunk
          if (state!.parts.length === totalChunks) {
            tableTopCeph.posts
              .completeMultipartUpload(
                contentTypeBucketMap[session!.staticContentType],
                session!.contentId,
                uploadId,
                state!.parts
              )
              .then(async () => {
                switch (session!.direction) {
                  case "toTable":
                    await this.handleToTable(
                      session!.staticContentType,
                      session!.tableId,
                      session!.contentId,
                      session!.instanceId,
                      session!.mimeType,
                      session!.filename,
                      session!.state
                    );
                    break;
                  case "reupload":
                    this.handleReupload(
                      session!.staticContentType,
                      session!.tableId,
                      session!.contentId
                    );
                    break;
                  case "toTabled":
                    await this.handleToTabled(
                      session!.staticContentType,
                      session!.tableId,
                      session!.contentId,
                      session!.mimeType,
                      session!.filename,
                      session!.state
                    );
                    break;
                  default:
                    break;
                }

                // Cleanup session
                await tableTopRedis.deletes.delete(
                  [
                    { prefix: "TSCUS", id: uploadId },
                    { prefix: "TSCCS", id: uploadId },
                    session?.direction === "reupload"
                      ? { prefix: "TSCRU", id: session.contentId }
                      : undefined,
                  ].filter((del) => del !== undefined)
                );
              });
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
        "TSCUS",
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
          await tableTopCeph.posts.abortMultipartUpload(
            contentTypeBucketMap[session.staticContentType],
            session.contentId,
            uploadId
          );

          await tableTopRedis.deletes.delete(
            [
              { prefix: "TSCUS", id: uploadId },
              { prefix: "TSCCS", id: uploadId },
              session?.direction === "reupload"
                ? { prefix: "TSCRU", id: session.contentId }
                : undefined,
            ].filter((del) => del !== undefined)
          );

          this.broadcaster.broadcastToTable(session.tableId, {
            type: "reuploadCancelled",
            header: {
              contentType: session.staticContentType,
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
              contentType: session.staticContentType,
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

  private handleToTable = async (
    staticContentType: StaticContentTypes,
    tableId: string,
    contentId: string,
    instanceId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    state: TableContentStateTypes[],
    initPositioning?:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined
  ) => {
    switch (staticContentType) {
      case "video":
        await this.handleMongoVideoUploads(
          tableId,
          contentId,
          instanceId,
          mimeType,
          filename,
          state,
          initPositioning
        );

        broadcaster.broadcastToTable(tableId, {
          type: "videoUploadedToTable",
          header: {
            contentId,
            instanceId,
          },
          data: {
            filename,
            mimeType,
            state,
            initPositioning,
          },
        });

        // Process video into DASH format in the background
        // try {
        //   // await processVideoWithABR(saveTo, processedDir, filename);

        //   // Notify clients to switch to the DASH stream
        //   const dashVideoUrl = `https://localhost:8045/processed/${filename.slice(
        //     0,
        //     -4
        //   )}.mpd`;

        //   tableContentController.setContent(tableId, "video", contentId, [
        //     { property: "dashURL", value: dashVideoUrl },
        //   ]);

        //   const dashVideoMessage = {
        //     type: "dashVideoReady",
        //     header: {
        //       videoId: contentId,
        //     },
        //     data: {
        //       filename,
        //       url: dashVideoUrl,
        //     },
        //   };
        //   broadcaster.broadcastToTable(tableId, dashVideoMessage);
        // } catch (error) {
        //   console.error("Error during video processing:", error);
        // }
        break;
      case "image":
        await this.handleMongoImageUploads(
          tableId,
          contentId,
          instanceId,
          mimeType,
          filename,
          state,
          initPositioning
        );

        broadcaster.broadcastToTable(tableId, {
          type: "imageUploadedToTable",
          header: { contentId, instanceId },
          data: { filename, mimeType, state, initPositioning },
        });
        break;
      case "svg":
        await this.handleMongoSvgUploads(
          tableId,
          contentId,
          instanceId,
          mimeType,
          filename,
          state,
          initPositioning
        );

        broadcaster.broadcastToTable(tableId, {
          type: "svgUploadedToTable",
          header: { contentId, instanceId },
          data: { filename, mimeType, state, initPositioning },
        });
        break;
      case "soundClip":
        await this.handleMongoSoundClipUploads(
          tableId,
          contentId,
          instanceId,
          mimeType,
          filename,
          state,
          initPositioning
        );

        broadcaster.broadcastToTable(tableId, {
          type: "soundClipUploadedToTable",
          header: { contentId, instanceId },
          data: { filename, mimeType, state, initPositioning },
        });
        break;
      case "application":
        await this.handleMongoApplicationUploads(
          tableId,
          contentId,
          instanceId,
          mimeType,
          filename,
          state,
          initPositioning
        );

        broadcaster.broadcastToTable(tableId, {
          type: "applicationUploadedToTable",
          header: { contentId, instanceId },
          data: { filename, mimeType, state, initPositioning },
        });
        break;
      case "text":
        await this.handleMongoTextUploads(
          tableId,
          contentId,
          instanceId,
          mimeType,
          filename,
          state,
          initPositioning
        );

        broadcaster.broadcastToTable(tableId, {
          type: "textUploadedToTable",
          header: { contentId, instanceId },
          data: { filename, mimeType, state, initPositioning },
        });
        break;
      default:
        console.warn(`Unsupported file type uploaded: ${mimeType}`);
        break;
    }
  };

  private handleReupload = (
    staticContentType: StaticContentTypes,
    tableId: string,
    contentId: string
  ) => {
    broadcaster.broadcastToTable(tableId, {
      type: "contentReuploaded",
      header: { contentId, contentType: staticContentType },
    });
  };

  private handleToTabled = async (
    staticContentType: StaticContentTypes,
    tableId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    completeFilename: string,
    state: TableContentStateTypes[]
  ) => {
    switch (staticContentType) {
      case "video":
        await this.handleMongoVideoUploads(
          tableId,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(tableId, {
          type: "videoUploadedToTabled",
          header: {
            contentId,
          },
          data: {
            filename: completeFilename,
            mimeType,
            state,
          },
        });

        // Process video into DASH format in the background
        // try {
        //   // await processVideoWithABR(saveTo, processedDir, filename);

        //   // Notify clients to switch to the DASH stream
        //   const dashVideoUrl = `https://localhost:8045/processed/${filename.slice(
        //     0,
        //     -4
        //   )}.mpd`;

        //   tableContentController.setContent(tableId, "video", contentId, [
        //     { property: "dashURL", value: dashVideoUrl },
        //   ]);

        //   const dashVideoMessage = {
        //     type: "dashVideoReady",
        //     header: {
        //       videoId: contentId,
        //     },
        //     data: {
        //       filename,
        //       url: dashVideoUrl,
        //     },
        //   };
        //   broadcaster.broadcastToTable(tableId, dashVideoMessage);
        // } catch (error) {
        //   console.error("Error during video processing:", error);
        // }
        break;
      case "image":
        await this.handleMongoImageUploads(
          tableId,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(tableId, {
          type: "imageUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      case "svg":
        await this.handleMongoSvgUploads(
          tableId,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(tableId, {
          type: "svgUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      case "soundClip":
        await this.handleMongoSoundClipUploads(
          tableId,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(tableId, {
          type: "soundClipUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      case "application":
        await this.handleMongoApplicationUploads(
          tableId,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(tableId, {
          type: "applicationUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType },
        });
        break;
      case "text":
        await this.handleMongoTextUploads(
          tableId,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(tableId, {
          type: "textUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      default:
        console.warn(`Unsupported file type uploaded: ${mimeType}`);
        break;
    }
  };

  private handleMongoVideoUploads = async (
    tableId: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: TableContentStateTypes[],
    initPositioning?:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined
  ) => {
    await tableTopMongo.tableVideos?.uploads.uploadMetaData({
      tableId,
      videoId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              videoInstanceId: instanceId,
              positioning: initPositioning
                ? initPositioning
                : {
                    position: {
                      left: 32.5,
                      top: 32.5,
                    },
                    scale: {
                      x: 25,
                      y: 25,
                    },
                    rotation: 0,
                  },
              effects: structuredClone(defaultVideoEffects),
              effectStyles: structuredClone(defaultVideoEffectsStyles),
              videoPosition: 0,
            },
          ]
        : [],
    });
  };

  private handleMongoImageUploads = async (
    tableId: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: TableContentStateTypes[],
    initPositioning?:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined
  ) => {
    await tableTopMongo.tableImages?.uploads.uploadMetaData({
      tableId,
      imageId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              imageInstanceId: instanceId,
              positioning: initPositioning
                ? initPositioning
                : {
                    position: {
                      left: 32.5,
                      top: 32.5,
                    },
                    scale: {
                      x: 25,
                      y: 25,
                    },
                    rotation: 0,
                  },
              effects: structuredClone(defaultImageEffects),
              effectStyles: structuredClone(defaultImageEffectsStyles),
            },
          ]
        : [],
    });
  };

  private handleMongoSvgUploads = async (
    tableId: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: TableContentStateTypes[],
    initPositioning?:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined
  ) => {
    await tableTopMongo.tableSvgs?.uploads.uploadMetaData({
      tableId,
      svgId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              svgInstanceId: instanceId,
              positioning: initPositioning
                ? initPositioning
                : {
                    position: {
                      left: 32.5,
                      top: 32.5,
                    },
                    scale: {
                      x: 25,
                      y: 25,
                    },
                    rotation: 0,
                  },
              effects: structuredClone(defaultSvgEffects),
              effectStyles: structuredClone(defaultSvgEffectsStyles),
            },
          ]
        : [],
    });
  };

  private handleMongoSoundClipUploads = async (
    tableId: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: TableContentStateTypes[],
    initPositioning?:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined
  ) => {
    await tableTopMongo.tableSoundClips?.uploads.uploadMetaData({
      tableId,
      soundClipId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              soundClipInstanceId: instanceId,
              positioning: initPositioning
                ? initPositioning
                : {
                    position: {
                      left: 32.5,
                      top: 32.5,
                    },
                    scale: {
                      x: 25,
                      y: 25,
                    },
                    rotation: 0,
                  },
              effects: structuredClone(defaultAudioEffects),
            },
          ]
        : [],
    });
  };

  private handleMongoApplicationUploads = async (
    tableId: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: TableContentStateTypes[],
    initPositioning?:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined
  ) => {
    await tableTopMongo.tableApplications?.uploads.uploadMetaData({
      tableId,
      applicationId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              applicationInstanceId: instanceId,
              positioning: initPositioning
                ? initPositioning
                : {
                    position: {
                      left: 32.5,
                      top: 32.5,
                    },
                    scale: {
                      x: 25,
                      y: 25,
                    },
                    rotation: 0,
                  },
              effects: structuredClone(defaultApplicationEffects),
              effectStyles: structuredClone(defaultApplicationEffectsStyles),
            },
          ]
        : [],
    });
  };

  private handleMongoTextUploads = async (
    tableId: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: TableContentStateTypes[],
    initPositioning?:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined
  ) => {
    await tableTopMongo.tableText?.uploads.uploadMetaData({
      tableId,
      textId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              textInstanceId: instanceId,
              positioning: initPositioning
                ? initPositioning
                : {
                    position: {
                      left: 32.5,
                      top: 32.5,
                    },
                    scale: {
                      x: 25,
                      y: 25,
                    },
                    rotation: 0,
                  },
              effectStyles: structuredClone(defaultTextEffectsStyles),
            },
          ]
        : [],
    });
  };
}

export default Posts;
