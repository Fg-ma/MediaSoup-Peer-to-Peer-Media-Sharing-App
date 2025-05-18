import { UploadSignals } from "../../../context/uploadDownloadContext/lib/typeConstant";

const tableStaticContentServerBaseUrl =
  process.env.TABLE_STATIC_CONTENT_SERVER_BASE_URL;

export type ChunkedUploadListenerTypes =
  | { type: "uploadPaused" }
  | { type: "uploadPlay" }
  | {
      type: "uploadProgress";
      data: { progress: number };
    };

class ChunkedUploader {
  private readonly CHUNK_SIZE = 1024 * 1024 * 5;

  private offset: number = 0;

  private _paused: boolean = false;
  private cancelled: boolean = false;

  readonly filename: string;
  uploadUrl: string | undefined;
  private _progress: number = 0;

  private uploadSpeedHistory: { time: number; speedKBps: number }[] = [];
  private uploadAbsoluteSpeedHistory: { time: number; speedKBps: number }[] =
    [];
  private uploadStartTime: number | null = null;

  private listeners: Set<(message: ChunkedUploadListenerTypes) => void> =
    new Set();

  constructor(
    public file: File,
    private uploadId: string,
    private contentId: string,
    private removeCurrentUpload: (id: string) => void,
    private sendUploadSignal: (signal: UploadSignals) => void,
  ) {
    this.filename = this.file.name;
    if (file.type.startsWith("video/")) {
      this.extractFirstVideoFrame(file)
        .then((url) => (this.uploadUrl = url))
        .catch((err) => {
          this.uploadUrl = URL.createObjectURL(file);
        });
    } else {
      this.uploadUrl = URL.createObjectURL(file);
    }
  }

  deconstructor = () => {
    if (this.uploadUrl) URL.revokeObjectURL(this.uploadUrl);
    this.removeCurrentUpload(this.contentId);
    this.sendUploadSignal({ type: "uploadFinish" });
    this.listeners.clear();
  };

  private extractFirstVideoFrame(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;

      // 1. once metadata is loaded, we know dimensions
      video.addEventListener(
        "loadedmetadata",
        () => {
          // ensure there's a video duration and size
          if (!video.videoWidth || !video.videoHeight) {
            return reject(new Error("video metadata missing dimensions"));
          }

          // set the canvas to those dimensions
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return reject(new Error("2D context not available"));
          }

          // 2. seek to the very first frame
          video.currentTime = 0;
          video.addEventListener(
            "seeked",
            () => {
              // 3. draw it
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

              // export to PNG blob → object URL
              canvas.toBlob((blob) => {
                if (blob) {
                  const imgUrl = URL.createObjectURL(blob);

                  // clean up the video URL, element, and canvas
                  URL.revokeObjectURL(video.src);
                  video.remove();
                  canvas.remove();

                  resolve(imgUrl);
                } else {
                  reject(new Error("canvas.toBlob() produced no blob"));
                }
              }, "image/png");
            },
            { once: true },
          );
        },
        { once: true },
      );

      video.addEventListener(
        "error",
        (e) => {
          URL.revokeObjectURL(video.src);
          reject(new Error("video load error"));
        },
        { once: true },
      );
    });
  }

  cancel = async () => {
    this.cancelled = true;

    try {
      await fetch(
        `${tableStaticContentServerBaseUrl}cancel-upload/${this.uploadId}`,
        {
          method: "POST",
        },
      );
    } catch (e) {
      console.warn("Failed to notify server of cancellation:", e);
    }

    this.deconstructor();
  };

  start = async () => {
    this._paused = false;
    setTimeout(
      () =>
        this.listeners.forEach((listener) => {
          listener({
            type: "uploadPlay",
          });
        }),
      250,
    );
    await this.uploadLoop();
  };

  pause = () => {
    this._paused = true;

    this.listeners.forEach((listener) => {
      listener({
        type: "uploadPaused",
      });
    });
  };

  resume = () => {
    if (this._paused) {
      this.start();
    }
  };

  private uploadLoop = async () => {
    this.uploadStartTime = Date.now();

    while (this.offset < this.file.size && !this._paused && !this.cancelled) {
      const chunk = this.file.slice(this.offset, this.offset + this.CHUNK_SIZE);
      const chunkIndex = Math.floor(this.offset / this.CHUNK_SIZE);
      const totalChunks = Math.ceil(this.file.size / this.CHUNK_SIZE);

      const start = Date.now();

      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("chunkIndex", chunkIndex.toString());
      formData.append("totalChunks", totalChunks.toString());

      try {
        await fetch(
          `${tableStaticContentServerBaseUrl}upload-chunk/${this.uploadId}`,
          {
            method: "POST",
            body: formData,
          },
        );

        const end = Date.now();
        const durationMs = end - start;
        const speedKBps = this.CHUNK_SIZE / 1024 / (durationMs / 1000); // in KB/s

        this.uploadSpeedHistory.push({
          time: end - (this.uploadStartTime ?? 0),
          speedKBps,
        });
        this.uploadAbsoluteSpeedHistory.push({
          time: end,
          speedKBps,
        });

        this.offset += this.CHUNK_SIZE;

        this._progress = this.offset / this.file.size;

        this.listeners.forEach((listener) => {
          listener({
            type: "uploadProgress",
            data: { progress: this.offset / this.file.size },
          });
        });
      } catch (error) {
        console.error("Chunk upload failed:", error);
        break;
      }
    }

    if (this.offset >= this.file.size) {
      this.deconstructor();
    }
  };

  addChunkedUploadListener = (
    listener: (message: ChunkedUploadListenerTypes) => void,
  ): void => {
    this.listeners.add(listener);
  };

  removeChunkedUploadListener = (
    listener: (message: ChunkedUploadListenerTypes) => void,
  ): void => {
    this.listeners.delete(listener);
  };

  getFileInfo = (): {
    mimeType: string;
    fileSize: string;
    uploadSpeed: { time: number; speedKBps: number }[];
    ETA: string;
  } => {
    let ETA = "";

    if (
      !this._paused &&
      this.uploadSpeedHistory.length > 0 &&
      this._progress > 0
    ) {
      const totalSpeed = this.uploadSpeedHistory.reduce(
        (sum, entry) => sum + entry.speedKBps,
        0,
      );
      const avgSpeed = totalSpeed / this.uploadSpeedHistory.length;

      if (avgSpeed > 0) {
        const remainingBytes = this.file.size - this.offset;
        const remainingSeconds = remainingBytes / 1024 / avgSpeed;

        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = Math.floor(remainingSeconds % 60);

        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

        ETA = parts.join(" ");
      }
    }

    return {
      mimeType: this.file.type || "unknown",
      fileSize: this.formatBytes(this.file.size),
      uploadSpeed: [...this.uploadSpeedHistory],
      ETA,
    };
  };

  getAbsoluteSpeedHistory = (): { time: number; speedKBps: number }[] => {
    return [...this.uploadAbsoluteSpeedHistory];
  };

  private formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  public get paused(): boolean {
    return this._paused;
  }

  public get progress(): number {
    return this._progress;
  }
}

export default ChunkedUploader;
