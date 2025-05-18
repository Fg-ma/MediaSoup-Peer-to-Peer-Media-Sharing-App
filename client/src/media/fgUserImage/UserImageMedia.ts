import { TableTopStaticMimeType } from "../../serverControllers/userStaticContentServer/lib/typeConstant";
import {
  UserContentStateTypes,
  LoadingStateTypes,
} from "../../../../universal/contentTypeConstant";
import Downloader from "../../downloader/Downloader";
import UserStaticContentSocketController from "../../serverControllers/userStaticContentServer/UserStaticContentSocketController";
import { DownloadSignals } from "../../context/uploadDownloadContext/lib/typeConstant";
import {
  DownloadListenerTypes,
  onDownloadFinishType,
} from "../../downloader/lib/typeConstant";

export type ImageListenerTypes =
  | { type: "downloadComplete" }
  | { type: "downloadPaused" }
  | { type: "downloadResumed" }
  | { type: "downloadFailed" }
  | { type: "downloadRetry" }
  | { type: "stateChanged" };

class UserImageMedia {
  image: HTMLImageElement | undefined;

  private fileSize = 0;
  blobURL: string | undefined;
  loadingState: LoadingStateTypes = "downloading";
  aspect: number | undefined;

  private imageListeners: Set<(message: ImageListenerTypes) => void> =
    new Set();

  downloader: undefined | Downloader;

  constructor(
    public imageId: string,
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
      "image",
      this.imageId,
      this.filename,
      this.mimeType,
      this.userStaticContentSocket,
      this.sendDownloadSignal,
      this.removeCurrentDownload,
    );
    this.addCurrentDownload(this.imageId, this.downloader);
    this.downloader.addDownloadListener(this.handleDownloadMessage);
    this.downloader.start();
  }

  deconstructor() {
    if (this.image) {
      this.image.src = "";
      this.image = undefined;
    }

    this.aspect = undefined;

    if (this.blobURL) URL.revokeObjectURL(this.blobURL);

    this.imageListeners.clear();

    if (this.downloader) {
      this.removeCurrentDownload(this.imageId);
      this.downloader = undefined;
    }
  }

  private onDownloadFinish = async (message: onDownloadFinishType) => {
    const { blob, fileSize } = message.data;

    this.fileSize = fileSize;

    const bitmap = await createImageBitmap(blob);

    // replace your createImageBitmap + canvas block with:
    const MAX_DIM = 1024;
    const { width: origW, height: origH } = bitmap;
    const scale = Math.min(1, MAX_DIM / origW, MAX_DIM / origH);
    const targetW = Math.round(origW * scale);
    const targetH = Math.round(origH * scale);

    const resizedBitmap = await createImageBitmap(bitmap, {
      resizeWidth: targetW,
      resizeHeight: targetH,
      resizeQuality: "high",
    });

    const canvas = new OffscreenCanvas(targetW, targetH);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(resizedBitmap, 0, 0);
    const blobOut = await canvas.convertToBlob();

    this.blobURL = URL.createObjectURL(blobOut);
    this.image = document.createElement("img");
    this.image.src = this.blobURL;

    this.image.onload = () => {
      this.aspect = (this.image?.width ?? 1) / (this.image?.height ?? 1);

      this.loadingState = "downloaded";

      this.imageListeners.forEach((listener) => {
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
        this.imageListeners.forEach((listener) => {
          listener({ type: "downloadFailed" });
        });
        break;
      case "downloadPaused":
        this.loadingState = "paused";
        this.imageListeners.forEach((listener) => {
          listener({ type: "downloadPaused" });
        });
        break;
      case "downloadResumed":
        this.loadingState = "downloading";
        this.imageListeners.forEach((listener) => {
          listener({ type: "downloadResumed" });
        });
        break;
      default:
        break;
    }
  };

  addImageListener = (
    listener: (message: ImageListenerTypes) => void,
  ): void => {
    this.imageListeners.add(listener);
  };

  removeImageListener = (
    listener: (message: ImageListenerTypes) => void,
  ): void => {
    this.imageListeners.delete(listener);
  };

  setState = (state: UserContentStateTypes[]) => {
    this.state = state;

    this.imageListeners.forEach((listener) => {
      listener({ type: "stateChanged" });
    });
  };

  downloadImage = () => {
    if (!this.blobURL) {
      return;
    }

    const link = document.createElement("a");
    link.href = this.blobURL;
    link.download = "downloaded-image.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      "image",
      this.imageId,
      this.filename,
      this.mimeType,
      this.userStaticContentSocket,
      this.sendDownloadSignal,
      this.removeCurrentDownload,
    );
    this.addCurrentDownload(this.imageId, this.downloader);
    this.downloader.addDownloadListener(this.handleDownloadMessage);
    this.downloader.start();

    this.imageListeners.forEach((listener) => {
      listener({ type: "downloadRetry" });
    });
  };
}

export default UserImageMedia;
