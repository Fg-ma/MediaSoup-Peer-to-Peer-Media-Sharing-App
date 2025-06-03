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
  mimeToExtension,
  mimeTypeContentTypeMap,
  StaticContentTypes,
  StaticMimeTypes,
  UserContentStateTypes,
} from "../../../universal/contentTypeConstant";
import { ChunkState, UploadSession } from "./lib/typeConstant";

const tableStaticContentUtils = new Utils();

class Posts {
  private readonly REDIS_UPLOAD_LIFE_TIME = 1800;

  constructor(app: uWS.TemplatedApp) {
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
        userId: string;
        contentId: string;
        direction: string;
        state: UserContentStateTypes[];
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

      bb.on("file", (_, file) => {
        if (!metadata || aborted) return;

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
              case "toMuteStyle":
                await this.handleToMuteStyle(
                  metadata.userId,
                  metadata.contentId,
                  metadata.mimeType as StaticMimeTypes,
                  completeFilename,
                  metadata.state
                );
                break;
              case "toUserContent":
                await this.handleToUserContent(
                  staticContentType,
                  metadata.userId,
                  metadata.contentId,
                  metadata.mimeType as StaticMimeTypes,
                  completeFilename,
                  metadata.state
                );
                break;
              default:
                break;
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

    app.post("/upload-chunk-meta", (res, _req) => {
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
            const { userId, contentId, direction, state, mimeType, filename } =
              metadata;

            if (
              userId === undefined ||
              contentId === undefined ||
              mimeType === undefined
            ) {
              this.sendResponse(
                res,
                "400 Bad Request",
                "text/plain",
                "Missing fields"
              );
              return;
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
              "USCCS",
              uploadId,
              {
                parts: [],
                currentSize: 0,
              },
              this.REDIS_UPLOAD_LIFE_TIME
            );

            const sessionData = {
              direction,
              userId,
              contentId,
              staticContentType,
              mimeType,
              state,
              filename,
            };

            await tableTopRedis.posts.post(
              "USCUS",
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
        return;
      }

      bb.on("field", async (name, val) => {
        if (name === "totalChunks") totalChunks = parseInt(val, 10);
        if (name === "chunkIndex") {
          chunkIndex = parseInt(val, 10);

          state = (await tableTopRedis.gets.get(
            "USCCS",
            uploadId
          )) as ChunkState;
          if (!state) {
            this.sendResponse(res, "404 Not Found", "text/plain", "No state");
            aborted = true;
            return;
          }

          const alreadyUploaded = state.parts.some(
            (part) => part.PartNumber === chunkIndex + 1
          );
          if (alreadyUploaded) {
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

      bb.on("file", async (_fn, stream, info) => {
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
            { prefix: "USCUS", id: uploadId },
            { prefix: "USCCS", id: uploadId },
          ]);

          return;
        });

        session = (await tableTopRedis.gets.get(
          "USCUS",
          uploadId
        )) as UploadSession;
        if (!session) {
          this.sendResponse(res, "404 Not Found", "text/plain", "No session");
          aborted = true;
          return;
        }

        if (!state) {
          state = (await tableTopRedis.gets.get(
            "USCCS",
            uploadId
          )) as ChunkState;
        }
        if (!state) {
          this.sendResponse(res, "404 Not Found", "text/plain", "No state");
          aborted = true;
          return;
        }

        const { mimeType } = info;

        stream.on("data", (d) => (buffer = Buffer.concat([buffer, d])));

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
              { prefix: "USCUS", id: uploadId },
              { prefix: "USCCS", id: uploadId },
            ]);

            return;
          }

          if (aborted) return;

          await tableTopRedis.posts.post(
            "USCCS",
            uploadId,
            state,
            this.REDIS_UPLOAD_LIFE_TIME
          );
          await tableTopRedis.posts.extendLife(
            "USCUS",
            uploadId,
            this.REDIS_UPLOAD_LIFE_TIME
          );

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
                  case "toMuteStyle":
                    await this.handleToMuteStyle(
                      session!.userId,
                      session!.contentId,
                      mimeType as StaticMimeTypes,
                      session!.filename,
                      session!.state
                    );
                    break;
                  case "toUserContent":
                    this.handleToUserContent(
                      session!.staticContentType,
                      session!.userId,
                      session!.contentId,
                      mimeType as StaticMimeTypes,
                      session!.filename,
                      session!.state
                    );
                    break;
                  default:
                    break;
                }

                // Cleanup session
                await tableTopRedis.deletes.delete([
                  { prefix: "USCUS", id: uploadId },
                  { prefix: "USCCS", id: uploadId },
                ]);
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
        "USCUS",
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

          await tableTopRedis.deletes.delete([
            { prefix: "USCUS", id: uploadId },
            { prefix: "USCCS", id: uploadId },
          ]);

          if (!aborted) {
            this.sendResponse(res, "200 OK", "text/plain", "Upload cancelled");
          }
        } catch (_) {
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

  private handleToMuteStyle = async (
    userId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    state: UserContentStateTypes[]
  ) => {
    await this.handleMongoSvgUploads(
      userId,
      contentId,
      mimeType,
      filename,
      state
    );

    broadcaster.broadcastToUser(userId, {
      type: "svgUploadedToUserContent",
      header: { contentId },
      data: { filename, mimeType, state },
    });
  };

  private handleToUserContent = async (
    staticContentType: StaticContentTypes,
    userId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    state: UserContentStateTypes[]
  ) => {
    switch (staticContentType) {
      case "video":
        await this.handleMongoVideoUploads(
          userId,
          contentId,
          mimeType,
          filename,
          state
        );

        broadcaster.broadcastToUser(userId, {
          type: "videoUploadedToUserContent",
          header: {
            contentId,
          },
          data: {
            filename,
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
          userId,
          contentId,
          mimeType,
          filename,
          state
        );

        broadcaster.broadcastToUser(userId, {
          type: "imageUploadedToUserContent",
          header: { contentId },
          data: { filename, mimeType, state },
        });
        break;
      case "svg":
        await this.handleMongoSvgUploads(
          userId,
          contentId,
          mimeType,
          filename,
          state
        );

        broadcaster.broadcastToUser(userId, {
          type: "svgUploadedToUserContent",
          header: { contentId },
          data: { filename, mimeType, state },
        });
        break;
      case "soundClip":
        await this.handleMongoSoundClipUploads(
          userId,
          contentId,
          mimeType,
          filename,
          state
        );

        broadcaster.broadcastToUser(userId, {
          type: "soundClipUploadedToUserContent",
          header: { contentId },
          data: { filename, mimeType, state },
        });
        break;
      case "application":
        await this.handleMongoApplicationUploads(
          userId,
          contentId,
          mimeType,
          filename,
          state
        );

        broadcaster.broadcastToUser(userId, {
          type: "applicationUploadedToUserContent",
          header: { contentId },
          data: { filename, mimeType },
        });
        break;
      case "text":
        await this.handleMongoTextUploads(
          userId,
          contentId,
          mimeType,
          filename,
          state
        );

        broadcaster.broadcastToUser(userId, {
          type: "textUploadedToUserContent",
          header: { contentId },
          data: { filename, mimeType, state },
        });
        break;
      default:
        console.warn(`Unsupported file type uploaded: ${mimeType}`);
        break;
    }
  };

  private handleMongoVideoUploads = async (
    userId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    state: UserContentStateTypes[]
  ) => {
    await tableTopMongo.userVideos?.uploads.uploadMetaData({
      userId,
      videoId: contentId,
      filename,
      mimeType,
      state,
    });
  };

  private handleMongoImageUploads = async (
    userId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    state: UserContentStateTypes[]
  ) => {
    await tableTopMongo.userImages?.uploads.uploadMetaData({
      userId,
      imageId: contentId,
      filename,
      mimeType,
      state,
    });
  };

  private handleMongoSvgUploads = async (
    userId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    state: UserContentStateTypes[]
  ) => {
    await tableTopMongo.userSvgs?.uploads.uploadMetaData({
      userId,
      svgId: contentId,
      filename,
      mimeType,
      state,
    });
  };

  private handleMongoSoundClipUploads = async (
    userId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    state: UserContentStateTypes[]
  ) => {
    await tableTopMongo.userSoundClips?.uploads.uploadMetaData({
      userId,
      soundClipId: contentId,
      filename,
      mimeType,
      state,
    });
  };

  private handleMongoApplicationUploads = async (
    userId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    state: UserContentStateTypes[]
  ) => {
    await tableTopMongo.userApplications?.uploads.uploadMetaData({
      userId,
      applicationId: contentId,
      filename,
      mimeType,
      state,
    });
  };

  private handleMongoTextUploads = async (
    userId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    state: UserContentStateTypes[]
  ) => {
    await tableTopMongo.userText?.uploads.uploadMetaData({
      userId,
      textId: contentId,
      filename,
      mimeType,
      state,
    });
  };
}

export default Posts;
