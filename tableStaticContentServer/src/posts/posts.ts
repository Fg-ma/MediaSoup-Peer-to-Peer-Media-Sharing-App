import uWS from "uWebSockets.js";
import busboy from "busboy";
import { broadcaster, tableTopCeph, tableTopMongo } from "../index";
import Utils from "./lib/Utils";
import {
  contentTypeBucketMap,
  mimeToExtension,
  mimeTypeContentTypeMap,
  StaticMimeTypes,
} from "../typeConstant";

const utils = new Utils();

class Posts {
  constructor(app: uWS.TemplatedApp) {
    app.post("/upload/*", (res, req) => {
      const url = req.getUrl();
      const split = url.split("/");
      const table_id = split[2];
      const contentId = split[3];
      const visible = split[4];

      res.cork(() => {
        res.writeHeader(
          "Access-Control-Allow-Origin",
          "https://localhost:8080"
        );
      });

      const headers: { [header: string]: string } = {};
      req.forEach((key, value) => {
        headers[key] = value;
      });

      const bb = busboy({ headers });

      bb.on("file", (name, file, info) => {
        const { mimeType, filename } = info;

        const sanitizedFilename = utils.sanitizeString(filename);
        const sanitizedMimeType = utils.sanitizeMimeType(mimeType);

        const completeFilename = `${sanitizedFilename}${
          mimeToExtension[sanitizedMimeType as StaticMimeTypes]
        }`;
        const staticContentType =
          mimeTypeContentTypeMap[mimeType as StaticMimeTypes] ?? ".bin";

        tableTopCeph
          .uploadFile(
            contentTypeBucketMap[staticContentType],
            completeFilename,
            file
          )
          .then(async () => {
            if (staticContentType === "video") {
              await this.handleVideoUploads(
                table_id,
                contentId,
                mimeType as StaticMimeTypes,
                completeFilename
              );
            } else if (staticContentType === "image") {
              await this.handleImageUploads(
                table_id,
                contentId,
                mimeType as StaticMimeTypes,
                completeFilename
              );
            } else if (staticContentType === "svg") {
              await this.handleSvgUploads(
                table_id,
                contentId,
                mimeType as StaticMimeTypes,
                completeFilename,
                visible === "false" ? false : true
              );
            } else if (staticContentType === "soundClip") {
              await this.handleAudioUploads(
                table_id,
                contentId,
                mimeType as StaticMimeTypes,
                completeFilename
              );
            } else if (staticContentType === "application") {
              await this.handleApplicationUploads(
                table_id,
                contentId,
                mimeType as StaticMimeTypes,
                completeFilename
              );
            } else if (staticContentType === "text") {
              await this.handleTextUploads(
                table_id,
                contentId,
                mimeType as StaticMimeTypes,
                completeFilename
              );
            } else {
              console.warn(`Unsupported file type uploaded: ${mimeType}`);
            }
          });

        file.on("error", (err) => {
          console.error(`Error writing file ${completeFilename}:`, err);
        });
      });

      bb.on("close", () => {
        res.cork(() => {
          console.log("Upload complete");
          res.writeStatus("200 OK").end("That's all folks!");
        });
      });

      let bodyBuffer = Buffer.alloc(0);

      res.onData((chunk, isLast) => {
        bodyBuffer = Buffer.concat([bodyBuffer, Buffer.from(chunk)]);

        if (isLast) {
          bb.end(bodyBuffer);
        } else {
          bb.write(bodyBuffer);
          bodyBuffer = Buffer.alloc(0);
        }
      });

      res.onAborted(() => {
        bb.destroy();
      });
    });
  }

  private handleVideoUploads = async (
    table_id: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string
  ) => {
    await tableTopMongo.tableVideos?.uploads.uploadMetaData({
      table_id,
      videoId: contentId,
      filename,
      mimeType,
      positioning: {
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
      effects: {
        postProcess: false,
        hideBackground: false,
        blur: false,
        tint: false,
        glasses: false,
        beards: false,
        mustaches: false,
        masks: false,
        hats: false,
        pets: false,
      },
      effectStyles: {
        postProcess: {
          style: "prismaColors",
        },
        hideBackground: {
          style: "beach",
          color: "#d40213",
        },
        tint: {
          color: "#d40213",
        },
        glasses: {
          style: "defaultGlasses",
        },
        beards: {
          style: "classicalCurlyBeard",
        },
        mustaches: {
          style: "mustache1",
        },
        masks: {
          style: "baseMask",
        },
        hats: {
          style: "stylishHat",
        },
        pets: {
          style: "beardedDragon",
        },
      },
      videoPosition: 0,
    });

    broadcaster.broadcastToTable(table_id, {
      type: "originalVideoReady",
      header: {
        videoId: contentId,
      },
      data: {
        filename,
        mimeType,
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

    //   tableContentController.setContent(table_id, "video", contentId, [
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
    //   broadcaster.broadcastToTable(table_id, dashVideoMessage);
    // } catch (error) {
    //   console.error("Error during video processing:", error);
    // }
  };

  private handleImageUploads = async (
    table_id: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string
  ) => {
    await tableTopMongo.tableImages?.uploads.uploadMetaData({
      table_id,
      imageId: contentId,
      filename,
      mimeType,
      positioning: {
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
      effects: {
        postProcess: false,
        hideBackground: false,
        blur: false,
        tint: false,
        glasses: false,
        beards: false,
        mustaches: false,
        masks: false,
        hats: false,
        pets: false,
      },
      effectStyles: {
        postProcess: {
          style: "prismaColors",
        },
        hideBackground: {
          style: "beach",
          color: "#d40213",
        },
        tint: {
          color: "#d40213",
        },
        glasses: {
          style: "defaultGlasses",
        },
        beards: {
          style: "classicalCurlyBeard",
        },
        mustaches: {
          style: "mustache1",
        },
        masks: {
          style: "baseMask",
        },
        hats: {
          style: "stylishHat",
        },
        pets: {
          style: "beardedDragon",
        },
      },
    });

    broadcaster.broadcastToTable(table_id, {
      type: "imageReady",
      header: { contentId },
      data: { filename: filename, mimeType },
    });
  };

  private handleSvgUploads = async (
    table_id: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    visible: boolean
  ) => {
    await tableTopMongo.tableSvgs?.uploads.uploadMetaData({
      table_id,
      svgId: contentId,
      filename,
      mimeType,
      positioning: {
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
      visible,
    });

    broadcaster.broadcastToTable(table_id, {
      type: "svgReady",
      header: { contentId },
      data: { filename: filename, mimeType, visible },
    });
  };

  private handleAudioUploads = async (
    table_id: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string
  ) => {
    await tableTopMongo.tableSoundClips?.uploads.uploadMetaData({
      table_id,
      soundClipId: contentId,
      filename,
      mimeType,
      positioning: {
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
      effects: {
        robot: false,
        echo: false,
        alien: false,
        underwater: false,
        telephone: false,
        space: false,
        distortion: false,
        vintage: false,
        psychedelic: false,
        deepBass: false,
        highEnergy: false,
        ambient: false,
        glitch: false,
        muffled: false,
        crystal: false,
        heavyMetal: false,
        dreamy: false,
        horror: false,
        sciFi: false,
        dystopian: false,
        retroGame: false,
        ghostly: false,
        metallic: false,
        hypnotic: false,
        cyberpunk: false,
        windy: false,
        radio: false,
        explosion: false,
        whisper: false,
        submarine: false,
        windTunnel: false,
        crushedBass: false,
        ethereal: false,
        electroSting: false,
        heartbeat: false,
        underworld: false,
        sizzling: false,
        staticNoise: false,
        bubbly: false,
        thunder: false,
        echosOfThePast: false,
      },
    });

    broadcaster.broadcastToTable(table_id, {
      type: "audioReady",
      header: { contentId },
      data: { filename: filename, mimeType },
    });
  };

  private handleApplicationUploads = async (
    table_id: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string
  ) => {
    await tableTopMongo.tableApplications?.uploads.uploadMetaData({
      table_id,
      applicationId: contentId,
      filename,
      mimeType,
      positioning: {
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
      effects: {
        postProcess: false,
        blur: false,
        tint: false,
      },
      effectStyles: {
        postProcess: {
          style: "prismaColors",
        },
        tint: {
          color: "#d40213",
        },
      },
    });

    broadcaster.broadcastToTable(table_id, {
      type: "applicationReady",
      header: { contentId },
      data: { filename: filename, mimeType },
    });
  };

  private handleTextUploads = async (
    table_id: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string
  ) => {
    await tableTopMongo.tableText?.uploads.uploadMetaData({
      table_id,
      textId: contentId,
      filename,
      mimeType,
      positioning: {
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
    });

    broadcaster.broadcastToTable(table_id, {
      type: "textReady",
      header: { contentId },
      data: { filename, mimeType },
    });
  };
}

export default Posts;
