import * as Y from "yjs";
import {
  TableContentStateTypes,
  LoadingStateTypes,
} from "../../../../universal/contentTypeConstant";
import { TableTopStaticMimeType } from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import { DownloadSignals } from "../../context/uploadDownloadContext/lib/typeConstant";
import LiveTextDownloader from "../../tools/liveTextDownloader/LiveTextDownloader";
import LiveTextEditingSocketController from "../../serverControllers/liveTextEditingServer/LiveTextEditingSocketController";
import {
  DownloadListenerTypes,
  onDownloadFinishType,
} from "../../tools/liveTextDownloader/lib/typeConstant";

export type TextMediaEvents = onTextFinishedLoadingType;

export type onTextFinishedLoadingType = {
  type: "textFinishedLoading";
};

export type TextListenerTypes =
  | { type: "downloadComplete" }
  | { type: "downloadPaused" }
  | { type: "downloadResumed" }
  | { type: "downloadFailed" }
  | { type: "downloadRetry" }
  | { type: "stateChanged" };

class TableTextMedia {
  textData: Uint8Array | undefined;

  fileSize = 0;
  loadingState: LoadingStateTypes = "downloading";

  private textListeners: Set<(message: TextListenerTypes) => void> = new Set();

  liveTextDownloader: LiveTextDownloader | undefined;

  constructor(
    public textId: string,
    public filename: string,
    public mimeType: TableTopStaticMimeType,
    public state: TableContentStateTypes[],
    private liveTextEditingSocket: React.MutableRefObject<
      LiveTextEditingSocketController | undefined
    >,
    private sendDownloadSignal: (signal: DownloadSignals) => void,
    private addCurrentDownload: (
      id: string,
      download: LiveTextDownloader,
    ) => void,
    private removeCurrentDownload: (id: string) => void,
    initTextData?: Uint8Array,
    initFileSize?: number,
  ) {
    if (initTextData !== undefined && initFileSize !== undefined) {
      this.loadingState = "downloaded";
      this.textData = initTextData;
      this.fileSize = initFileSize;
    } else {
      this.liveTextDownloader = new LiveTextDownloader(
        this.textId,
        this.filename,
        this.mimeType,
        this.liveTextEditingSocket,
        this.sendDownloadSignal,
        this.removeCurrentDownload,
      );
      this.addCurrentDownload(this.textId, this.liveTextDownloader);
      this.liveTextDownloader.addDownloadListener(this.handleDownloadMessage);
      this.liveTextDownloader.start();
    }
  }

  deconstructor = () => {
    this.textListeners.clear();

    if (this.liveTextDownloader) {
      this.removeCurrentDownload(this.textId);
      this.liveTextDownloader = undefined;
    }
  };

  private onDownloadFinish = async (message: onDownloadFinishType) => {
    const { payload, fileSize } = message.data;

    this.fileSize = fileSize;
    this.textData = payload;

    this.loadingState = "downloaded";

    this.textListeners.forEach((listener) => {
      listener({ type: "downloadComplete" });
    });

    this.liveTextDownloader = undefined;
  };

  private handleDownloadMessage = (message: DownloadListenerTypes) => {
    switch (message.type) {
      case "downloadFinish":
        this.onDownloadFinish(message);
        break;
      case "downloadFailed":
        this.loadingState = "failed";
        this.liveTextDownloader = undefined;

        this.textListeners.forEach((listener) => {
          listener({ type: "downloadFailed" });
        });
        break;
      case "downloadPaused":
        this.loadingState = "paused";
        this.textListeners.forEach((listener) => {
          listener({ type: "downloadPaused" });
        });
        break;
      case "downloadResumed":
        this.loadingState = "downloading";
        this.textListeners.forEach((listener) => {
          listener({ type: "downloadResumed" });
        });
        break;
      default:
        break;
    }
  };

  downloadText = () => {
    if (!this.textData) return;

    const ydoc = new Y.Doc();
    Y.applyUpdate(ydoc, this.textData);

    const ytext = ydoc.getText("monaco");

    const text = ytext.toString();

    // Create a Blob with the text content
    const blob = new Blob([text], { type: "text/plain" });
    const blobURL = URL.createObjectURL(blob);

    // Create and trigger a download link
    const link = document.createElement("a");
    link.href = blobURL;
    link.download = "downloaded-text.txt";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release memory by revoking the Blob URL
    URL.revokeObjectURL(blobURL);
  };

  addTextListener = (listener: (message: TextListenerTypes) => void): void => {
    this.textListeners.add(listener);
  };

  removeTextListener = (
    listener: (message: TextListenerTypes) => void,
  ): void => {
    this.textListeners.delete(listener);
  };

  setState = (state: TableContentStateTypes[]) => {
    this.state = state;

    this.textListeners.forEach((listener) => {
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
    if (this.liveTextDownloader || this.loadingState === "downloaded") return;

    this.loadingState = "downloading";

    this.liveTextDownloader = new LiveTextDownloader(
      this.textId,
      this.filename,
      this.mimeType,
      this.liveTextEditingSocket,
      this.sendDownloadSignal,
      this.removeCurrentDownload,
    );
    this.addCurrentDownload(this.textId, this.liveTextDownloader);
    this.liveTextDownloader.addDownloadListener(this.handleDownloadMessage);
    this.liveTextDownloader.start();

    this.textListeners.forEach((listener) => {
      listener({ type: "downloadRetry" });
    });
  };
}

export default TableTextMedia;
