import uWS from "uWebSockets.js";
import { v4 as uuidv4 } from "uuid";
import busboy from "busboy";
import { broadcaster, tableTopCeph, tableTopMongo } from "../index";
import Utils from "./lib/Utils";
import { contentTypeBucketMap } from "../typeConstant";
import {
  mimeToExtension,
  mimeTypeContentTypeMap,
  StaticContentTypes,
  StaticMimeTypes,
  UserContentStateTypes,
} from "../../../universal/contentTypeConstant";
import { getEmbedding } from "./embedding";
import { uploadEmbeddingToQdrant } from "./qdrant";
import { ChunkState, UploadSession } from "./lib/typeConstant";

const tableStaticContentUtils = new Utils();

class Posts {
  private chunkStates = new Map<string, ChunkState>();
  private uploadSessions = new Map<string, UploadSession>();

  constructor(app: uWS.TemplatedApp) {
    app.post("/upload-one-shot-file", (res, req) => {
      res.cork(() => {
        res.writeHeader(
          "Access-Control-Allow-Origin",
          "https://localhost:8080"
        );
      });

      const bb = busboy({ headers: this.collectHeaders(req) });

      let metadata: {
        userId: string;
        contentId: string;
        direction: string;
        state: UserContentStateTypes[];
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

      bb.on("file", (_, file, info) => {
        const { mimeType, filename } = info;

        const sanitizedFilename = tableStaticContentUtils.sanitizeString(
          filename.slice(0, -4)
        );
        const sanitizedMimeType =
          tableStaticContentUtils.sanitizeMimeType(mimeType);
        const completeFilename = `${sanitizedFilename}${
          mimeToExtension[sanitizedMimeType as StaticMimeTypes]
        }`;
        const staticContentType =
          mimeTypeContentTypeMap[mimeType as StaticMimeTypes] ?? ".bin";

        if (!metadata) return;

        // Save file
        tableTopCeph.posts
          .uploadFile(
            contentTypeBucketMap[staticContentType],
            metadata.contentId,
            file
          )
          .then(async () => {
            if (!metadata) return;

            switch (metadata.direction) {
              case "toMuteStyle":
                await this.handleToMuteStyle(
                  metadata.userId,
                  metadata.contentId,
                  mimeType as StaticMimeTypes,
                  completeFilename,
                  metadata.state
                );
                break;
              case "toUserContent":
                await this.handleToUserContent(
                  staticContentType,
                  metadata.userId,
                  metadata.contentId,
                  mimeType as StaticMimeTypes,
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
        res.cork(() => {
          console.log("Upload complete");
          res.writeStatus("200 OK").end("That's all folks!");
        });
      });

      this.pipeReqToBusboy(res, bb);
    });

    app.post("/upload-chunk-meta", (res, req) => {
      let buffer = "";

      res.cork(() => {
        res.writeHeader(
          "Access-Control-Allow-Origin",
          "https://localhost:8080"
        );
      });

      // Required to prevent crash if the client disconnects early
      let aborted = false;
      res.onAborted(() => {
        aborted = true;
        console.warn("Request aborted by client");
      });

      res.onData(async (chunk, isLast) => {
        buffer += Buffer.from(chunk).toString();

        if (isLast) {
          if (aborted) return;

          try {
            const metadata = JSON.parse(buffer);
            const { userId, contentId, direction, state, mimeType } = metadata;

            const staticContentType =
              mimeTypeContentTypeMap[mimeType as StaticMimeTypes];

            const uploadId = await tableTopCeph.posts.createMultipartUpload(
              contentTypeBucketMap[staticContentType as StaticContentTypes],
              contentId
            );
            if (!uploadId) return;

            this.chunkStates.set(uploadId, { uploadId, parts: [] });

            const sessionData = {
              direction,
              userId,
              contentId,
              staticContentType,
              mimeType,
              state,
            };

            this.uploadSessions.set(uploadId, sessionData);

            res.cork(() => {
              res
                .writeStatus("200 OK")
                .writeHeader("Content-Type", "application/json")
                .end(JSON.stringify({ uploadId }));
            });
          } catch (err) {
            console.error("Error in /upload-meta:", err);
            res.cork(() => {
              res
                .writeStatus("400 Bad Request")
                .writeHeader("Content-Type", "application/json")
                .end(
                  JSON.stringify({ error: "Invalid JSON or missing fields" })
                );
            });
          }
        }
      });
    });

    app.post("/upload-chunk/:uploadId", (res, req) => {
      res.cork(() => {
        res.writeHeader(
          "Access-Control-Allow-Origin",
          "https://localhost:8080"
        );
      });

      const uploadId = req.getParameter(0);
      if (!uploadId) {
        res.cork(() => {
          res.writeStatus("404").end("No upload id");
        });
        return;
      }

      const session = this.uploadSessions.get(uploadId);
      if (!session) {
        res.cork(() => {
          res.writeStatus("404").end("No session");
        });
        return;
      }

      const bb = busboy({ headers: this.collectHeaders(req) });
      let chunkIndex = -1,
        totalChunks = -1;
      let buffer = Buffer.alloc(0);

      bb.on("field", (name, val) => {
        if (name === "chunkIndex") chunkIndex = parseInt(val, 10);
        if (name === "totalChunks") totalChunks = parseInt(val, 10);
      });

      bb.on("file", (_fn, stream, info) => {
        const { mimeType, filename } = info;

        stream.on("data", (d) => (buffer = Buffer.concat([buffer, d])));

        stream.on("end", async () => {
          let state = this.chunkStates.get(uploadId);
          if (!state) return;

          // upload this part
          const ETag = await tableTopCeph.posts.uploadPart(
            contentTypeBucketMap[session.staticContentType],
            session.contentId,
            chunkIndex + 1,
            uploadId,
            buffer
          );
          if (!ETag) return;
          state.parts.push({ PartNumber: chunkIndex + 1, ETag });

          res.cork(() => {
            res.writeStatus("200 OK").end("Chunk received");
          });

          // if last chunk, complete
          if (state.parts.length === totalChunks) {
            tableTopCeph.posts
              .completeMultipartUpload(
                contentTypeBucketMap[session.staticContentType],
                session.contentId,
                uploadId,
                state.parts
              )
              .then(async () => {
                switch (session.direction) {
                  case "toMuteStyle":
                    await this.handleToMuteStyle(
                      session.userId,
                      session.contentId,
                      mimeType as StaticMimeTypes,
                      filename,
                      session.state
                    );
                    break;
                  case "toUserContent":
                    this.handleToUserContent(
                      session.staticContentType,
                      session.userId,
                      session.contentId,
                      mimeType as StaticMimeTypes,
                      filename,
                      session.state
                    );
                    break;
                  default:
                    break;
                }

                // Cleanup session
                this.uploadSessions.delete(uploadId);
                this.chunkStates.delete(uploadId);
              });
          }
        });
      });

      this.pipeReqToBusboy(res, bb, uploadId);
    });
  }

  private collectHeaders(req: uWS.HttpRequest) {
    const h: Record<string, string> = {};
    req.forEach((k, v) => (h[k] = v));
    return h;
  }

  private pipeReqToBusboy(
    res: uWS.HttpResponse,
    bb: busboy.Busboy,
    uploadId?: string
  ) {
    let buffer = Buffer.alloc(0);
    res.onData((chunk, isLast) => {
      buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
      if (isLast) {
        bb.end(buffer);
      }
    });

    res.onAborted(() => {
      bb.destroy();
      if (uploadId) this.uploadSessions.delete(uploadId);
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
