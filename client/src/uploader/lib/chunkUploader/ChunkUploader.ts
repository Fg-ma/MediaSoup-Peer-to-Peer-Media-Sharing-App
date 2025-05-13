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
  readonly uploadUrl: string;
  private _progress: number = 0;

  private uploadSpeedHistory: { time: number; speedKBps: number }[] = [];
  private uploadStartTime: number | null = null;

  private listeners: Set<(message: ChunkedUploadListenerTypes) => void> =
    new Set();

  constructor(
    private file: File,
    private uploadId: string,
    private contentId: string,
    private removeCurrentUpload: (id: string) => void,
    private sendUploadSignal: (signal: UploadSignals) => void,
  ) {
    this.filename = this.file.name;
    this.uploadUrl = URL.createObjectURL(this.file);
  }

  deconstructor = () => {
    URL.revokeObjectURL(this.uploadUrl);
    this.removeCurrentUpload(this.contentId);
    this.sendUploadSignal({ type: "uploadFinish" });
    this.listeners.clear();
  };

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
    this.uploadStartTime = performance.now();

    while (this.offset < this.file.size && !this._paused && !this.cancelled) {
      const chunk = this.file.slice(this.offset, this.offset + this.CHUNK_SIZE);
      const chunkIndex = Math.floor(this.offset / this.CHUNK_SIZE);
      const totalChunks = Math.ceil(this.file.size / this.CHUNK_SIZE);

      const start = performance.now();

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

        const end = performance.now();
        const durationMs = end - start;
        const speedKBps = this.CHUNK_SIZE / 1024 / (durationMs / 1000); // in KB/s

        this.uploadSpeedHistory.push({
          time: end - (this.uploadStartTime ?? 0),
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
  } => {
    return {
      mimeType: this.file.type || "unknown",
      fileSize: this.formatBytes(this.file.size),
      uploadSpeed: [...this.uploadSpeedHistory],
    };
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
