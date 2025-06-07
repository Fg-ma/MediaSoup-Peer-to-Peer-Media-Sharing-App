// @ts-expect-error bullmq types missing
import { Worker } from "bullmq";
import path from "path";
import fs from "fs/promises";
import { spawn } from "child_process";
import { broadcaster, tableTopCeph, tableTopMongo } from "src";
import {
  StaticMimeTypes,
  TableContentStateTypes,
} from "../../../../universal/contentTypeConstant";
import {
  defaultVideoEffects,
  defaultVideoEffectsStyles,
} from "../../../../universal/effectsTypeConstant";

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
            videoPosition: 0,
          },
        ]
      : [],
  });
};

new Worker(
  "videoTranscodeQueue",
  async (job: {
    data: {
      tmpDir: string;
      contentId: string;
      tableId: string;
      filename: string;
      direction: "toTable" | "reupload" | "toTabled";
      mimeType: StaticMimeTypes;
      instanceId: string;
      state: [];
    };
  }) => {
    const { tmpDir, contentId, filename, direction, ...sessionMeta } = job.data;

    const outputPath = path.join(tmpDir, "input.mp4");
    const hlsDir = path.join(tmpDir, "hls");
    const mp4Path = path.join(tmpDir, "output.mp4");

    await fs.mkdir(hlsDir);

    // HLS Transcoding
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-i",
        outputPath,
        "-preset",
        "fast",
        "-g",
        "48",
        "-sc_threshold",
        "0",
        "-map",
        "0:0",
        "-map",
        "0:1",
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
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

    // MP4 fallback
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-i",
        outputPath,
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-c:a",
        "aac",
        mp4Path,
      ]);
      ffmpeg.on("close", resolve);
      ffmpeg.on("error", reject);
    });

    // Upload to Ceph
    const files = await fs.readdir(hlsDir);
    for (const file of files) {
      const content = await fs.readFile(path.join(hlsDir, file));
      await tableTopCeph.posts.uploadFile(
        "adaptive-videos",
        `${contentId}/hls/${file}`,
        content
      );
    }

    const mp4Content = await fs.readFile(mp4Path);
    await tableTopCeph.posts.uploadFile(
      "adaptive-videos",
      `${contentId}/video.mp4`,
      mp4Content
    );

    switch (direction) {
      case "toTable":
        await handleToTable(
          sessionMeta.tableId,
          contentId,
          sessionMeta.instanceId,
          sessionMeta.mimeType,
          filename,
          sessionMeta.state
        );
        break;
      case "reupload":
        handleReupload(sessionMeta.tableId, contentId);
        break;
      case "toTabled":
        await handleToTabled(
          sessionMeta.tableId,
          contentId,
          sessionMeta.mimeType,
          filename,
          sessionMeta.state
        );
        break;
    }

    // Cleanup
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
);
