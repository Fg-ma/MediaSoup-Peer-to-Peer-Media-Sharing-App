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

export type ApplicationListenerTypes =
  | { type: "downloadComplete" }
  | { type: "downloadPaused" }
  | { type: "downloadResumed" }
  | { type: "downloadFailed" }
  | { type: "downloadRetry" }
  | { type: "stateChanged" }
  | { type: "rectifyEffectMeshCount" };

class TableApplicationMedia {
  application: HTMLImageElement | undefined;

  private fileSize = 0;
  blobURL: string | undefined;
  loadingState: LoadingStateTypes = "downloading";
  aspect: number | undefined;

  private applicationListeners: Set<
    (message: ApplicationListenerTypes) => void
  > = new Set();

  downloader: undefined | Downloader;

  constructor(
    public applicationId: string,
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
      "application",
      this.applicationId,
      this.filename,
      this.mimeType,
      this.tableStaticContentSocket,
      this.sendDownloadSignal,
      this.removeCurrentDownload,
    );
    this.addCurrentDownload(this.applicationId, this.downloader);
    this.downloader.addDownloadListener(this.handleDownloadMessage);
    this.downloader.start();
  }

  deconstructor() {
    if (this.application) {
      this.application.src = "";
      this.application = undefined;
    }

    this.aspect = undefined;

    if (this.blobURL) URL.revokeObjectURL(this.blobURL);

    this.applicationListeners.clear();

    if (this.downloader) {
      this.removeCurrentDownload(this.applicationId);
      this.downloader = undefined;
    }
  }

  private onDownloadFinish = async (message: onDownloadFinishType) => {
    const { blob, fileSize } = message.data;

    this.fileSize = fileSize;

    this.blobURL = URL.createObjectURL(blob);
    this.application = document.createElement("img");
    this.application.src = this.blobURL;

    this.application.onload = () => {
      this.aspect =
        (this.application?.width ?? 1) / (this.application?.height ?? 1);

      this.loadingState = "downloaded";

      this.applicationListeners.forEach((listener) => {
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

        this.applicationListeners.forEach((listener) => {
          listener({ type: "downloadFailed" });
        });
        break;
      case "downloadPaused":
        this.loadingState = "paused";
        this.applicationListeners.forEach((listener) => {
          listener({ type: "downloadPaused" });
        });
        break;
      case "downloadResumed":
        this.loadingState = "downloading";
        this.applicationListeners.forEach((listener) => {
          listener({ type: "downloadResumed" });
        });
        break;
      default:
        break;
    }
  };

  downloadApplication = () => {
    if (!this.blobURL) {
      return;
    }

    const link = document.createElement("a");
    link.href = this.blobURL;
    link.download = "downloaded-application.docx";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  addApplicationListener = (
    listener: (message: ApplicationListenerTypes) => void,
  ): void => {
    this.applicationListeners.add(listener);
  };

  removeApplicationListener = (
    listener: (message: ApplicationListenerTypes) => void,
  ): void => {
    this.applicationListeners.delete(listener);
  };

  setState = (state: TableContentStateTypes[]) => {
    this.state = state;

    this.applicationListeners.forEach((listener) => {
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
      "application",
      this.applicationId,
      this.filename,
      this.mimeType,
      this.tableStaticContentSocket,
      this.sendDownloadSignal,
      this.removeCurrentDownload,
    );
    this.addCurrentDownload(this.applicationId, this.downloader);
    this.downloader.addDownloadListener(this.handleDownloadMessage);
    this.downloader.start();

    this.applicationListeners.forEach((listener) => {
      listener({ type: "downloadRetry" });
    });
  };
}

export default TableApplicationMedia;
