import {
  IncomingTableStaticContentMessages,
  onChunkType,
  onDownloadCompleteType,
  onDownloadErrorType,
  onDownloadStartedType,
  TableTopStaticMimeType,
} from "../serverControllers/tableStaticContentServer/lib/typeConstant";
import { StaticContentTypes } from "../../../universal/contentTypeConstant";
import { DownloadSignals } from "../context/uploadDownloadContext/lib/typeConstant";
import TableStaticContentSocketController from "../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import { DownloadListenerTypes } from "./lib/typeConstant";

class Downloader {
  private downloadId: string | undefined;

  private _paused: boolean = false;

  private fileSize = 0;
  private currentSize = 0;
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

  private onChunk = (message: onChunkType) => {
    const { contentType, contentId } = message.header;

    if (contentType !== this.contentType || contentId !== this.contentId) {
      return;
    }

    const now = Date.now();
    const chunkData = new Uint8Array(message.data.chunk.data);
    const chunkBytes = chunkData.byteLength;

    this.currentSize += chunkBytes;
    this._progress = this.currentSize / (this.fileSize ?? 1);

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
  };

  private onDownloadComplete = (message: onDownloadCompleteType) => {
    const { contentType, contentId } = message.header;

    if (contentType !== this.contentType || contentId !== this.contentId) {
      return;
    }

    const mergedBuffer = new Uint8Array(this.currentSize);
    let offset = 0;

    for (const chunk of this.fileChunks) {
      mergedBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    const finishMessage = {
      type: "downloadFinish",
      data: { buffer: mergedBuffer, fileSize: this.currentSize },
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

  private onDownloadStarted = (message: onDownloadStartedType) => {
    const { contentType, contentId } = message.header;

    if (contentType !== this.contentType || contentId !== this.contentId) {
      return;
    }

    const { downloadId, fileSize } = message.data;

    this.downloadId = downloadId;
    this.fileSize = fileSize;

    this.sendDownloadSignal({ type: "downloadStart" });
  };

  private onDownloadError = (message: onDownloadErrorType) => {
    const { contentType, contentId } = message.header;

    if (contentType !== this.contentType || contentId !== this.contentId) {
      return;
    }

    this.removeCurrentDownload(this.contentId);

    this.sendDownloadSignal({ type: "downloadError" });

    this.deconstructor();
  };

  private downloadListener = (message: IncomingTableStaticContentMessages) => {
    switch (message.type) {
      case "chunk":
        this.onChunk(message);
        break;
      case "downloadComplete":
        this.onDownloadComplete(message);
        break;
      case "downloadStarted":
        this.onDownloadStarted(message);
        break;
      case "downloadError":
        this.onDownloadError(message);
        break;
      default:
        break;
    }
  };

  cancel = () => {
    if (!this.downloadId) return;

    this.tableStaticContentSocket.current?.sendMessage({
      type: "cancelDownload",
      header: { downloadId: this.downloadId },
    });

    this.removeCurrentDownload(this.contentId);

    this.sendDownloadSignal({ type: "downloadCancel" });

    this.deconstructor();
  };

  start = () => {
    this._paused = false;

    this.tableStaticContentSocket.current?.getFile(
      this.contentType,
      this.contentId,
    );
  };

  pause = () => {
    if (!this.downloadId || this._paused) return;

    this._paused = true;

    this.tableStaticContentSocket.current?.sendMessage({
      type: "pauseDownload",
      header: { downloadId: this.downloadId },
    });

    this.listeners.forEach((listener) => {
      listener({
        type: "downloadPaused",
      });
    });
  };

  resume = () => {
    if (!this._paused || !this.downloadId) return;

    this._paused = false;

    this.tableStaticContentSocket.current?.sendMessage({
      type: "resumeDownload",
      header: { downloadId: this.downloadId },
    });

    this.listeners.forEach((listener) => {
      listener({
        type: "downloadResumed",
      });
    });
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
