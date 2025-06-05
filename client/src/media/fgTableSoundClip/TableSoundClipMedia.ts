import {
  TableContentStateTypes,
  LoadingStateTypes,
  StaticMimeTypes,
} from "../../../../universal/contentTypeConstant";
import Downloader from "../../tools/downloader/Downloader";
import TableStaticContentSocketController from "../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import { DownloadSignals } from "../../context/uploadDownloadContext/lib/typeConstant";
import {
  DownloadListenerTypes,
  onDownloadFinishType,
} from "../../tools/downloader/lib/typeConstant";

export type SoundClipListenerTypes =
  | { type: "downloadComplete" }
  | { type: "downloadPaused" }
  | { type: "downloadResumed" }
  | { type: "downloadFailed" }
  | { type: "downloadRetry" }
  | { type: "stateChanged" };

class TableSoundClipMedia {
  soundClip: HTMLAudioElement | undefined;

  private fileSize = 0;
  blobURL: string | undefined;
  loadingState: LoadingStateTypes = "downloading";

  private soundClipListeners: Set<(message: SoundClipListenerTypes) => void> =
    new Set();

  downloader: undefined | Downloader;

  constructor(
    public soundClipId: string,
    public filename: string,
    public mimeType: StaticMimeTypes,
    public state: TableContentStateTypes[],
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private sendDownloadSignal: (signal: DownloadSignals) => void,
    private addCurrentDownload: (id: string, upload: Downloader) => void,
    private removeCurrentDownload: (id: string) => void,
  ) {
    this.downloader = new Downloader(
      "soundClip",
      this.soundClipId,
      this.filename,
      this.mimeType,
      this.tableStaticContentSocket,
      this.sendDownloadSignal,
      this.removeCurrentDownload,
    );
    this.addCurrentDownload(this.soundClipId, this.downloader);
    this.downloader.addDownloadListener(this.handleDownloadMessage);
    this.downloader.start();
  }

  deconstructor = () => {
    if (this.blobURL) URL.revokeObjectURL(this.blobURL);

    this.soundClipListeners.clear();

    if (this.downloader) {
      this.removeCurrentDownload(this.soundClipId);
      this.downloader = undefined;
    }
  };

  private onDownloadFinish = async (message: onDownloadFinishType) => {
    const { blob, fileSize } = message.data;

    this.fileSize = fileSize;

    this.blobURL = URL.createObjectURL(blob);

    this.soundClip = new Audio(this.blobURL);

    this.loadingState = "downloaded";

    this.soundClip.onload = () => {
      this.soundClipListeners.forEach((listener) => {
        listener({ type: "downloadComplete" });
      });
    };

    this.downloader = undefined;
  };

  private handleDownloadMessage = (message: DownloadListenerTypes) => {
    switch (message.type) {
      case "downloadFinish":
        this.onDownloadFinish(message);
        break;
      case "downloadFailed":
        this.loadingState = "failed";
        this.downloader = undefined;

        this.soundClipListeners.forEach((listener) => {
          listener({ type: "downloadFailed" });
        });
        break;
      case "downloadPaused":
        this.loadingState = "paused";
        this.soundClipListeners.forEach((listener) => {
          listener({ type: "downloadPaused" });
        });
        break;
      case "downloadResumed":
        this.loadingState = "downloading";
        this.soundClipListeners.forEach((listener) => {
          listener({ type: "downloadResumed" });
        });
        break;
      default:
        break;
    }
  };

  addSoundClipListener = (
    listener: (message: SoundClipListenerTypes) => void,
  ): void => {
    this.soundClipListeners.add(listener);
  };

  removeSoundClipListener = (
    listener: (message: SoundClipListenerTypes) => void,
  ): void => {
    this.soundClipListeners.delete(listener);
  };

  setState = (state: TableContentStateTypes[]) => {
    this.state = state;

    this.soundClipListeners.forEach((listener) => {
      listener({ type: "stateChanged" });
    });
  };

  getFileSize = () => {
    return this.formatBytes(this.fileSize);
  };

  private formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  retryDownload = () => {
    if (this.downloader || this.loadingState === "downloaded") return;

    this.loadingState = "downloading";

    this.downloader = new Downloader(
      "soundClip",
      this.soundClipId,
      this.filename,
      this.mimeType,
      this.tableStaticContentSocket,
      this.sendDownloadSignal,
      this.removeCurrentDownload,
    );
    this.addCurrentDownload(this.soundClipId, this.downloader);
    this.downloader.addDownloadListener(this.handleDownloadMessage);
    this.downloader.start();

    this.soundClipListeners.forEach((listener) => {
      listener({ type: "downloadRetry" });
    });
  };
}

export default TableSoundClipMedia;
