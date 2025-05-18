import UserStaticContentSocketController from "../../serverControllers/userStaticContentServer/UserStaticContentSocketController";
import {
  UserContentStateTypes,
  LoadingStateTypes,
} from "../../../../universal/contentTypeConstant";
import { TableTopStaticMimeType } from "../../serverControllers/userStaticContentServer/lib/typeConstant";
import { DownloadSignals } from "../../context/uploadDownloadContext/lib/typeConstant";
import Downloader from "../../downloader/Downloader";
import {
  DownloadListenerTypes,
  onDownloadFinishType,
} from "../../downloader/lib/typeConstant";

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

class UserTextMedia {
  text: string | undefined;

  private fileSize = 0;
  loadingState: LoadingStateTypes = "downloading";

  private textListeners: Set<(message: TextListenerTypes) => void> = new Set();

  downloader: undefined | Downloader;

  constructor(
    public textId: string,
    public filename: string,
    public mimeType: TableTopStaticMimeType,
    public state: UserContentStateTypes[],
    private userStaticContentSocket: React.MutableRefObject<
      UserStaticContentSocketController | undefined
    >,
    private sendDownloadSignal: (signal: DownloadSignals) => void,
    private addCurrentDownload: (id: string, upload: Downloader) => void,
    private removeCurrentDownload: (id: string) => void,
  ) {
    this.downloader = new Downloader(
      "text",
      this.textId,
      this.filename,
      this.mimeType,
      this.userStaticContentSocket,
      this.sendDownloadSignal,
      this.removeCurrentDownload,
    );
    this.addCurrentDownload(this.textId, this.downloader);
    this.downloader.addDownloadListener(this.handleDownloadMessage);
    this.downloader.start();
  }

  deconstructor = () => {
    this.textListeners.clear();

    if (this.downloader) {
      this.removeCurrentDownload(this.textId);
      this.downloader = undefined;
    }
  };

  private onDownloadFinish = async (message: onDownloadFinishType) => {
    const { blob, fileSize } = message.data;

    this.fileSize = fileSize;

    blob.arrayBuffer().then((arrayBuffer) => {
      this.text = new TextDecoder("utf-8").decode(arrayBuffer);

      this.loadingState = "downloaded";

      this.textListeners.forEach((listener) => {
        listener({ type: "downloadComplete" });
      });
    });

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
    if (!this.text) {
      console.error("No text available for download.");
      return;
    }

    // Create a Blob with the text content
    const blob = new Blob([this.text], { type: "text/plain" });
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

  setState = (state: UserContentStateTypes[]) => {
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
    if (this.downloader || this.loadingState === "downloaded") return;

    this.loadingState = "downloading";

    this.downloader = new Downloader(
      "text",
      this.textId,
      this.filename,
      this.mimeType,
      this.userStaticContentSocket,
      this.sendDownloadSignal,
      this.removeCurrentDownload,
    );
    this.addCurrentDownload(this.textId, this.downloader);
    this.downloader.addDownloadListener(this.handleDownloadMessage);
    this.downloader.start();

    this.textListeners.forEach((listener) => {
      listener({ type: "downloadRetry" });
    });
  };
}

export default UserTextMedia;
