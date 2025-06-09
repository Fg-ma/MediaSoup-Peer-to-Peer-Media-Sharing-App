import { Worker } from "bullmq";
import path from "path";
import fs from "fs/promises";
import { spawn } from "child_process";
import { broadcaster, tableTopCeph, tableTopMongo, tableTopRedis } from "src";
import {
  StaticMimeTypes,
  TableContentStateTypes,
} from "../../../../universal/contentTypeConstant";
import {
  defaultVideoEffects,
  defaultVideoEffectsStyles,
} from "../../../../universal/effectsTypeConstant";
import { redisConnection } from "./queues";

const handleToTable = async (
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
  await handleMongoVideoUploads(
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
};

const handleReupload = (tableId: string, contentId: string) => {
  broadcaster.broadcastToTable(tableId, {
    type: "contentReuploaded",
    header: { contentId },
  });
};

const handleToTabled = async (
  tableId: string,
  contentId: string,
  mimeType: StaticMimeTypes,
  completeFilename: string,
  state: TableContentStateTypes[]
) => {
  await handleMongoVideoUploads(
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
};

const handleMongoVideoUploads = async (
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
            meta: {
              isPlaying: false,
              lastKnownPosition: 0,
              videoPlaybackSpeed: 1,
            },
          },
        ]
      : [],
  });
};

const isReencodingNeeded = async (filePath: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const probe = spawn("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=codec_name",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    let codec = "";
    probe.stdout.on("data", (data) => {
      codec += data.toString();
    });

    probe.on("close", () => {
      resolve(codec.trim() !== "h264");
    });

    probe.on("error", reject);
  });
};

new Worker(
  "videoTranscodeQueue",
  async (job: {
    data: {
      tableId: string;
      username: string;
      instance: string;
      uploadId: string | undefined;
      tmpDir: string;
      fileExtension: string;
      contentId: string;
      filename: string;
      direction: "toTable" | "reupload" | "toTabled";
      mimeType: StaticMimeTypes;
      instanceId: string;
      state: [];
    };
  }) => {
    const {
      tableId,
      username,
      instance,
      uploadId,
      tmpDir,
      fileExtension,
      contentId,
      filename,
      direction,
      ...sessionMeta
    } = job.data;

    broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "processingProgress",
      header: { contentId },
      data: { progress: 0 },
    });

    const inputPath = path.join(tmpDir, `input${fileExtension}`);
    const hlsDir = path.join(tmpDir, "hls");
    const mp4Path = path.join(tmpDir, "output.mp4");

    await fs.mkdir(hlsDir);

    const needsEncoding = await isReencodingNeeded(inputPath);

    broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "processingProgress",
      header: { contentId },
      data: { progress: 0.1 },
    });

    // Re-encode only if needed
    if (needsEncoding) {
      await new Promise((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", [
          "-i",
          inputPath,
          "-vf",
          "scale=trunc(iw/2)*2:trunc(ih/2)*2",
          "-c:v",
          "libx264",
          "-preset",
          "veryfast",
          "-crf",
          "28",
          "-c:a",
          "aac",
          "-b:a",
          "96k",
          "-movflags",
          "+faststart",
          mp4Path,
        ]);
        ffmpeg.on("close", (code) => {
          if (code !== 0) {
            return reject(new Error(`FFmpeg exited with code ${code}`));
          }
          resolve(null);
        });
        ffmpeg.on("error", (error) => {
          return reject(new Error(`FFmpeg exited with error ${error}`));
        });
      });
    } else {
      await fs.copyFile(inputPath, mp4Path);
    }

    broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "processingProgress",
      header: { contentId },
      data: { progress: 0.4 },
    });

    // HLS Transcoding
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-i",
        mp4Path,
        "-preset",
        "veryfast",
        "-crf",
        "28",
        "-g",
        "48",
        "-sc_threshold",
        "0",
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        "-f",
        "hls",
        "-hls_time",
        "6",
        "-hls_playlist_type",
        "vod",
        path.join(hlsDir, "index.m3u8"),
      ]);
      ffmpeg.on("close", resolve);
      ffmpeg.on("error", reject);
    });

    broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "processingProgress",
      header: { contentId },
      data: { progress: 0.8 },
    });

    // Upload to Ceph
    const files = await fs.readdir(hlsDir);
    for (const file of files) {
      const content = await fs.readFile(path.join(hlsDir, file));
      await tableTopCeph.posts.uploadFile(
        "table-videos",
        `${contentId}/hls/${file}`,
        content
      );
    }

    broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "processingProgress",
      header: { contentId },
      data: { progress: 0.9 },
    });

    const mp4Content = await fs.readFile(mp4Path);
    await tableTopCeph.posts.uploadFile(
      "table-videos",
      `${contentId}/video.mp4`,
      mp4Content
    );

    broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "processingProgress",
      header: { contentId },
      data: { progress: 0.95 },
    });

    switch (direction) {
      case "toTable":
        await handleToTable(
          tableId,
          contentId,
          sessionMeta.instanceId,
          sessionMeta.mimeType,
          filename,
          sessionMeta.state
        );
        break;
      case "reupload":
        handleReupload(tableId, contentId);
        break;
      case "toTabled":
        await handleToTabled(
          tableId,
          contentId,
          sessionMeta.mimeType,
          filename,
          sessionMeta.state
        );
        break;
    }

    broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "processingProgress",
      header: { contentId },
      data: { progress: 0.975 },
    });

    // Cleanup
    // await fs.rm(tmpDir, { recursive: true, force: true });

    const redisDeletes = [
      ...(uploadId
        ? [
            { prefix: "VUS", id: uploadId },
            { prefix: "VCS", id: uploadId },
          ]
        : []),
      direction === "reupload" ? { prefix: "VRU", id: contentId } : undefined,
    ].filter((del) => del !== undefined);
    if (redisDeletes.length !== 0) {
      await tableTopRedis.deletes.delete(redisDeletes);
    }

    broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "processingFinished",
      header: { contentId },
    });
  },
  { connection: redisConnection }
);
