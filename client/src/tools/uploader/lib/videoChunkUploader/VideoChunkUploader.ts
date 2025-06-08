import { v4 as uuidv4 } from "uuid";
import IndexedDB from "../../../../db/indexedDB/IndexedDB";
import { UploadSignals } from "../../../../context/uploadDownloadContext/lib/typeConstant";
import { TableContentStateTypes } from "../../../../../../universal/contentTypeConstant";
import ReasonableFileSizer from "../../../reasonableFileSizer.ts/ReasonableFileSizer";
import { GeneralSignals } from "../../../../context/signalContext/lib/typeConstant";
import VideoSocketController from "../../../../serverControllers/videoServer/VideoSocketController";
import { IncomingVideoMessages } from "src/serverControllers/videoServer/lib/typeConstant";

const videoServerBaseUrl = process.env.VIDEO_SERVER_BASE_URL;

export type ChunkedUploadListenerTypes =
  | { type: "uploadPaused" }
  | { type: "uploadPlay" }
  | {
      type: "uploadProgress";
      data: { progress: number };
    };

class VideoChunkUploader {
  private readonly CHUNK_SIZE = 1024 * 1024 * 12;

  private offset: number = 0;

  private _paused: boolean = false;
  private cancelled: boolean = false;
  private currentChunkAbortController: AbortController | null = null;

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
    private videoSocket: React.MutableRefObject<
      VideoSocketController | undefined
    >,
    private tableId: React.MutableRefObject<string>,
    public file: File,
    private uploadId: string,
    private contentId: string,
    private removeCurrentUpload: (id: string) => void,
    private sendUploadSignal: (signal: UploadSignals) => void,
    private reasonableFileSizer: React.MutableRefObject<ReasonableFileSizer>,
    private indexedDBController: React.MutableRefObject<IndexedDB> | undefined,
    private direction: string,
    private handle: FileSystemFileHandle | undefined,
    offset: number | undefined,
    private sendGeneralSignal: (signal: GeneralSignals) => void,
    private initPositioning?: {
      position: { top: number; left: number };
      scale: { x: number; y: number };
      rotation: number;
    },
    private state: TableContentStateTypes[] = [],
  ) {
    this.filename = this.file.name;
    if (offset) {
      this.offset = offset;
      this._progress = offset / this.file.size;
    }

    this.init();

    this.videoSocket.current?.addMessageListener(
      this.handleVideoSocketMessages,
    );
  }

  init = async () => {
    this.uploadUrl = await this.reasonableFileSizer?.current.getUrl(this.file);
  };

  deconstructor = async () => {
    this.videoSocket.current?.removeMessageListener(
      this.handleVideoSocketMessages,
    );
    if (this.uploadUrl) URL.revokeObjectURL(this.uploadUrl);
    this.removeCurrentUpload(this.contentId);
    this.listeners.clear();
  };

  cancel = async () => {
    this.cancelled = true;

    if (this.currentChunkAbortController) {
      this.currentChunkAbortController.abort();
    }

    try {
      await fetch(`${videoServerBaseUrl}cancel-upload/${this.uploadId}`, {
        method: "POST",
      });
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

    while (
      this.offset * this.CHUNK_SIZE < this.file.size &&
      !this._paused &&
      !this.cancelled
    ) {
      const chunk = this.file.slice(
        this.offset * this.CHUNK_SIZE,
        this.offset * this.CHUNK_SIZE + this.CHUNK_SIZE,
      );
      const totalChunks = Math.ceil(this.file.size / this.CHUNK_SIZE);

      const start = Date.now();

      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("chunkIndex", this.offset.toString());
      formData.append("totalChunks", totalChunks.toString());

      try {
        this.currentChunkAbortController = new AbortController();
        const response = await fetch(
          `${videoServerBaseUrl}upload-chunk/${this.uploadId}`,
          {
            method: "POST",
            body: formData,
            signal: this.currentChunkAbortController.signal,
          },
        );
        this.currentChunkAbortController = null;

        if (!response.ok) {
          if (response.status === 413) {
            this.sendGeneralSignal({
              type: "tableInfoSignal",
              data: {
                message: `${this.filename} exceeds upload size limit`,
                timeout: 3500,
              },
            });
            this.deconstructor();
            return;
          }
          if (response.status !== 409) {
            this.chunkErrorRetryUpload();
            break;
          }
        }

        if (response.status !== 409) {
          const end = Date.now();
          const durationMs = end - start;
          const speedKBps = this.CHUNK_SIZE / 1024 / (durationMs / 1000);

          this.uploadSpeedHistory.push({
            time: end - (this.uploadStartTime ?? 0),
            speedKBps,
          });
          this.uploadAbsoluteSpeedHistory.push({
            time: end,
            speedKBps,
          });
        }

        this.offset += 1;

        this._progress = (this.offset * this.CHUNK_SIZE) / this.file.size;

        this.listeners.forEach((listener) => {
          listener({
            type: "uploadProgress",
            data: { progress: this._progress },
          });
        });
        if (this.handle) {
          this.indexedDBController?.current.uploadPosts?.updateProgress(
            this.contentId,
            this.offset * this.CHUNK_SIZE,
          );
        }
      } catch (error) {
        console.error("Chunk upload failed:", error);
        break;
      }
    }

    if (this.offset * this.CHUNK_SIZE >= this.file.size) {
      await this.indexedDBController?.current.uploadDeletes?.deleteFileHandle(
        this.contentId,
      );
      this.sendUploadSignal({ type: "uploadProcessing" });
    }
  };

  private chunkErrorRetryUpload = async () => {
    this._progress = 0;
    this.offset = 0;
    this.uploadSpeedHistory = [];
    this.uploadAbsoluteSpeedHistory = [];

    this.listeners.forEach((listener) => {
      listener({
        type: "uploadProgress",
        data: { progress: this._progress },
      });
    });

    if (this.handle)
      await this.indexedDBController?.current.uploadDeletes?.deleteFileHandle(
        this.contentId,
      );

    if (!videoServerBaseUrl) return;

    const metadata = {
      tableId: this.tableId.current,
      contentId: this.contentId,
      instanceId: uuidv4(),
      direction: this.direction,
      state: this.state,
      filename: this.file.name,
      mimeType: this.file.type,
      initPositioning: this.initPositioning,
    };

    try {
      const metaRes = await fetch(videoServerBaseUrl + "upload-chunk-meta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      if (!metaRes.ok) {
        this.deconstructor();
        return;
      }

      const { uploadId } = await metaRes.json();

      if (!uploadId) {
        this.deconstructor();
        return;
      }

      this.uploadId = uploadId;

      if (this.handle) {
        await this.indexedDBController?.current.uploadPosts?.saveFileHandle(
          this.contentId,
          this.tableId.current,
          this.uploadId,
          this.handle,
          0,
        );
      }

      setTimeout(
        () =>
          this.sendUploadSignal({
            type: "uploadStart",
          }),
        250,
      );
    } catch (_) {}

    this.uploadLoop();
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

  handleVideoSocketMessages = (message: IncomingVideoMessages) => {
    switch (message.type) {
      case "processingProgress": {
        const { contentId } = message.header;

        if (contentId === this.contentId) {
          const { progress } = message.data;
          this._progress = progress;

          const msg = {
            type: "uploadProgress",
            data: { progress },
          } as {
            type: "uploadProgress";
            data: { progress: number };
          };
          this.listeners.forEach((listener) => {
            listener(msg);
          });
        }
        break;
      }
      case "processingFinished": {
        const { contentId } = message.header;
        if (contentId === this.contentId) {
          this.sendUploadSignal({
            type: "uploadProcessingFinished",
          });
          this.deconstructor();
        }
        break;
      }
      default:
        break;
    }
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
        const remainingBytes = this.file.size - this.offset * this.CHUNK_SIZE;
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

export default VideoChunkUploader;
