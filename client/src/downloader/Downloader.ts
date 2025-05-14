import {
  IncomingTableStaticContentMessages,
  onChunkErrorType,
  onChunkType,
  onDownloadErrorType,
  onDownloadMetaType,
  onOneShotDownloadType,
  TableTopStaticMimeType,
} from "../serverControllers/tableStaticContentServer/lib/typeConstant";
import { StaticContentTypes } from "../../../universal/contentTypeConstant";
import { DownloadSignals } from "../context/uploadDownloadContext/lib/typeConstant";
import TableStaticContentSocketController from "../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import { DownloadListenerTypes } from "./lib/typeConstant";

class Downloader {
  private DOWNLOAD_CHUNK_SIZE = 1024 * 1024;

  private _paused: boolean = false;

  private fileSize = 0;
  private offset = 0;
  private fileChunks: Uint8Array[] = [];

  private _progress: number = 0;

  private downloadSpeedHistory: { time: number; speedKBps: number }[] = [];
  private lastTimestamp: number | null = null;
  private bytesSinceLast: number = 0;

  private listeners: Set<(message: DownloadListenerTypes) => void> = new Set();

  constructor(
    private contentType: StaticContentTypes,
    private contentId: string,
    public filename: string,
    public mimeType: TableTopStaticMimeType,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private sendDownloadSignal: (signal: DownloadSignals) => void,
    private removeCurrentDownload: (id: string) => void,
  ) {
    tableStaticContentSocket.current?.addMessageListener(this.downloadListener);
  }

  deconstructor = () => {
    this.tableStaticContentSocket.current?.removeMessageListener(
      this.downloadListener,
    );
    this.listeners.clear();
  };

  private onDownloadMeta = (message: onDownloadMetaType) => {
    const { contentType, contentId } = message.header;

    if (contentType !== this.contentType || contentId !== this.contentId) {
      return;
    }

    this.fileSize = message.data.fileSize;

    this.requestNextChunk();
  };

  private requestNextChunk = () => {
    if (this.offset < this.fileSize)
      this.tableStaticContentSocket.current?.getChunk(
        this.contentType,
        this.contentId,
        `bytes=${this.offset}-${Math.min(this.fileSize, this.offset + 1024 * 1024)}`,
      );
  };

  private onChunk = (message: onChunkType) => {
    const { contentType, contentId } = message.header;

    if (contentType !== this.contentType || contentId !== this.contentId) {
      return;
    }

    const now = Date.now();
    const chunkData = message.data.chunk;
    const chunkBytes = chunkData.byteLength;

    this.offset += chunkBytes;
    this._progress = this.offset / (this.fileSize ?? 1);

    // 1) Append chunk as before
    this.fileChunks.push(chunkData);

    // 2) Initialize timing on first chunk
    if (this.lastTimestamp === null) {
      this.lastTimestamp = now;
      this.bytesSinceLast = 0;
    }

    // 3) Accumulate bytes
    this.bytesSinceLast += chunkBytes;

    // 4) Every ~200ms, compute instant speed
    if (now - this.lastTimestamp >= 200) {
      const intervalSec = (now - this.lastTimestamp) / 1000;
      const instantKBps = this.bytesSinceLast / 1024 / intervalSec;

      // 5) Store in history
      this.downloadSpeedHistory.push({
        time: now,
        speedKBps: instantKBps,
      });

      // 6) Reset counters
      this.lastTimestamp = now;
      this.bytesSinceLast = 0;
    }

    this.listeners.forEach((listener) => {
      listener({
        type: "downloadProgress",
      });
    });

    if (!this._paused) {
      if (this.offset < this.fileSize) {
        this.requestNextChunk();
      } else {
        const buffer = new Uint8Array(this.fileSize);

        let total = 0;
        for (const chunk of this.fileChunks) {
          buffer.set(chunk, total);
          total += chunk.length;
        }

        const finishMessage = {
          type: "downloadFinish",
          data: { buffer, fileSize: this.fileSize },
        };
        this.listeners.forEach((listener) => {
          listener(
            finishMessage as {
              type: "downloadFinish";
              data: { buffer: Uint8Array<ArrayBuffer>; fileSize: number };
            },
          );
        });

        this.removeCurrentDownload(this.contentId);

        this.sendDownloadSignal({ type: "downloadFinish" });

        this.deconstructor();
      }
    }
  };

  private onChunkError = (message: onChunkErrorType) => {
    const { contentType, contentId } = message.header;

    if (contentType !== this.contentType || contentId !== this.contentId) {
      return;
    }

    this.requestNextChunk();
  };

  private onOneShotDownloadComplete = (message: onOneShotDownloadType) => {
    const { contentType, contentId } = message.header;

    if (contentType !== this.contentType || contentId !== this.contentId) {
      return;
    }

    const { buffer } = message.data;

    const finishMessage = {
      type: "downloadFinish",
      data: { buffer, fileSize: this.fileSize },
    };
    this.listeners.forEach((listener) => {
      listener(
        finishMessage as {
          type: "downloadFinish";
          data: { buffer: Uint8Array<ArrayBuffer>; fileSize: number };
        },
      );
    });

    this.removeCurrentDownload(this.contentId);

    this.sendDownloadSignal({ type: "downloadFinish" });

    this.deconstructor();
  };

  private onDownloadError = (message: onDownloadErrorType) => {
    const { contentType, contentId } = message.header;

    if (contentType !== this.contentType || contentId !== this.contentId) {
      return;
    }

    this.listeners.forEach((listener) => {
      listener({
        type: "downloadFailed",
      });
    });

    this.removeCurrentDownload(this.contentId);

    this.sendDownloadSignal({ type: "downloadError" });

    this.deconstructor();
  };

  private downloadListener = (message: IncomingTableStaticContentMessages) => {
    switch (message.type) {
      case "downloadMeta":
        this.onDownloadMeta(message);
        break;
      case "chunk":
        this.onChunk(message);
        break;
      case "chunkError":
        this.onChunkError(message);
        break;
      case "oneShotDownload":
        this.onOneShotDownloadComplete(message);
        break;
      case "downloadError":
        this.onDownloadError(message);
        break;
      default:
        break;
    }
  };

  cancel = () => {
    this.removeCurrentDownload(this.contentId);

    this.sendDownloadSignal({ type: "downloadCancel" });

    this.listeners.forEach((listener) => {
      listener({
        type: "downloadFailed",
      });
    });

    this.deconstructor();
  };

  start = () => {
    this._paused = false;

    this.sendDownloadSignal({ type: "downloadStart" });

    this.tableStaticContentSocket.current?.getFile(
      this.contentType,
      this.contentId,
    );
  };

  pause = () => {
    if (this._paused) return;

    this._paused = true;

    this.listeners.forEach((listener) => {
      listener({
        type: "downloadPaused",
      });
    });
  };

  resume = () => {
    if (!this._paused) return;

    this._paused = false;

    this.listeners.forEach((listener) => {
      listener({
        type: "downloadResumed",
      });
    });

    this.requestNextChunk();
  };

  addDownloadListener = (
    listener: (message: DownloadListenerTypes) => void,
  ): void => {
    this.listeners.add(listener);
  };

  removeDownloadListener = (
    listener: (message: DownloadListenerTypes) => void,
  ): void => {
    this.listeners.delete(listener);
  };

  public get paused(): boolean {
    return this._paused;
  }

  public get progress(): number {
    return this._progress;
  }
}

export default Downloader;
