import { DownloadSignals } from "../../context/uploadDownloadContext/lib/typeConstant";
import { DownloadListenerTypes } from "./lib/typeConstant";
import LiveTextEditingSocketController from "../../serverControllers/liveTextEditingServer/LiveTextEditingSocketController";
import {
  IncomingLiveTextEditingMessages,
  onChunkErrorType,
  onChunkType,
  onDownloadErrorType,
  onDownloadFinishedType,
  onDownloadMetaType,
  onOneShotDownloadType,
} from "../../serverControllers/liveTextEditingServer/lib/typeConstant";
import { TableTopStaticMimeType } from "../../serverControllers/tableStaticContentServer/lib/typeConstant";

class LiveTextDownloader {
  private _paused: boolean = false;

  private idx = -1;
  private fileSize = 0;
  private offset = 0;
  private data: Uint8Array<ArrayBuffer>[] = [];

  private _progress: number = 0;

  private startTime: number = 0;
  private downloadSpeedHistory: { time: number; speedKBps: number }[] = [];
  private downloadAbsoluteSpeedHistory: { time: number; speedKBps: number }[] =
    [];
  private lastTimestamp: number | null = null;
  private bytesSinceLast: number = 0;

  private listeners: Set<(message: DownloadListenerTypes) => void> = new Set();

  private downloadWorker: Worker | undefined;

  private state: "downloading" | "waiting" = "waiting";

  constructor(
    private contentId: string,
    public filename: string,
    public mimeType: TableTopStaticMimeType,
    private liveTextEditingSocket: React.MutableRefObject<
      LiveTextEditingSocketController | undefined
    >,
    private sendDownloadSignal: (signal: DownloadSignals) => void,
    private removeCurrentDownload: (id: string) => void,
  ) {
    this.liveTextEditingSocket.current?.addMessageListener(
      this.downloadListener,
    );
  }

  deconstructor = () => {
    this.liveTextEditingSocket.current?.removeMessageListener(
      this.downloadListener,
    );
    this.listeners.clear();

    if (this.downloadWorker) {
      this.downloadWorker.terminate();
      this.downloadWorker = undefined;
    }
  };

  private onDownloadMeta = (message: onDownloadMetaType) => {
    const { contentId } = message.header;

    if (contentId !== this.contentId) {
      return;
    }

    this.fileSize = message.data.fileSize;

    if (this.state !== "downloading") {
      this.state = "downloading";
      this.requestNextChunk();
    }
  };

  private requestNextChunk = () => {
    this.idx += 1;
    if (this.idx === 5) {
      this.listeners.forEach((listener) => {
        listener({
          type: "initialized",
          data: { payload: this.data },
        });
      });
    }
    this.liveTextEditingSocket.current?.getChunk(this.contentId, this.idx);
  };

  private onChunk = (message: onChunkType) => {
    const { contentId } = message.header;

    if (contentId !== this.contentId) {
      return;
    }

    const now = Date.now();
    const chunkData = message.data.payload;
    const chunkBytes = chunkData.byteLength;

    this.offset += chunkBytes;
    this._progress = this.offset / (this.fileSize ?? 1);

    // 1) Append chunk as before
    this.data?.push(chunkData);

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
        time: now - this.startTime,
        speedKBps: instantKBps,
      });
      this.downloadAbsoluteSpeedHistory.push({
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
      this.requestNextChunk();
    }
  };

  private onDownloadFinished = (message: onDownloadFinishedType) => {
    const { contentId } = message.header;

    if (contentId !== this.contentId) {
      return;
    }

    this.listeners.forEach((listener) => {
      listener({
        type: "downloadFinish",
        data: { payload: this.data, fileSize: this.fileSize },
      });
    });

    if (this.downloadWorker) {
      this.downloadWorker.terminate();
      this.downloadWorker = undefined;
    }

    this.removeCurrentDownload(this.contentId);
    this.sendDownloadSignal({ type: "downloadFinish" });
    this.deconstructor();
  };

  private onChunkError = (message: onChunkErrorType) => {
    const { contentId } = message.header;

    if (contentId !== this.contentId) {
      return;
    }

    if (this.state !== "downloading") {
      this.state = "downloading";
      this.requestNextChunk();
    }
  };

  private onOneShotDownloadComplete = (message: onOneShotDownloadType) => {
    const { contentId } = message.header;

    if (contentId !== this.contentId) return;

    const { payload, fileSize } = message.data;

    const finishMessage = {
      type: "downloadFinish",
      data: { payload: [payload], fileSize },
    };
    this.listeners.forEach((listener) => {
      listener(
        finishMessage as {
          type: "downloadFinish";
          data: { payload: Uint8Array<ArrayBuffer>[]; fileSize: number };
        },
      );
    });

    this.removeCurrentDownload(this.contentId);

    this.sendDownloadSignal({ type: "downloadFinish" });

    this.deconstructor();
  };

  private onDownloadError = (message: onDownloadErrorType) => {
    const { contentId } = message.header;

    if (contentId !== this.contentId) {
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

  private downloadListener = (message: IncomingLiveTextEditingMessages) => {
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
      case "downloadFinished":
        this.onDownloadFinished(message);
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

    this.liveTextEditingSocket.current?.getFile(this.contentId);

    this.startTime = Date.now();
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

    if (this.state !== "downloading") {
      this.state = "downloading";
      this.requestNextChunk();
    }
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

  getFileInfo = (): {
    mimeType: string;
    fileSize: string;
    downloadSpeed: { time: number; speedKBps: number }[];
    ETA: string;
  } => {
    let ETA = "";

    if (
      !this._paused &&
      this.downloadSpeedHistory.length > 0 &&
      this._progress > 0
    ) {
      const totalSpeed = this.downloadSpeedHistory.reduce(
        (sum, entry) => sum + entry.speedKBps,
        0,
      );
      const avgSpeed = totalSpeed / this.downloadSpeedHistory.length;

      if (avgSpeed > 0) {
        const remainingBytes = this.fileSize - this.offset;
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
      mimeType: this.mimeType,
      fileSize: this.formatBytes(this.fileSize),
      downloadSpeed: [...this.downloadSpeedHistory],
      ETA,
    };
  };

  getAbsoluteSpeedHistory = (): { time: number; speedKBps: number }[] => {
    return [...this.downloadAbsoluteSpeedHistory];
  };

  private formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
}

export default LiveTextDownloader;
