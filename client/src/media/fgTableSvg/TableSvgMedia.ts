import { TableTopStaticMimeType } from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import {
  LoadingStateTypes,
  TableContentStateTypes,
} from "../../../../universal/contentTypeConstant";
import Downloader from "../../downloader/Downloader";
import { DownloadSignals } from "../../context/uploadDownloadContext/lib/typeConstant";
import TableStaticContentSocketController from "../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import {
  DownloadListenerTypes,
  onDownloadFinishType,
} from "../../downloader/lib/typeConstant";

export type SvgListenerTypes =
  | { type: "downloadComplete" }
  | { type: "downloadPaused" }
  | { type: "downloadResumed" }
  | { type: "downloadFailed" }
  | { type: "downloadRetry" }
  | { type: "stateChanged" };

class TableSvgMedia {
  svg: SVGSVGElement | undefined;

  private fileSize = 0;
  blobURL: string | undefined;
  loadingState: LoadingStateTypes = "downloading";
  aspect: number | undefined;

  private svgListeners: Set<(message: SvgListenerTypes) => void> = new Set();

  downloader: undefined | Downloader;

  constructor(
    public svgId: string,
    public filename: string,
    public mimeType: TableTopStaticMimeType,
    public state: TableContentStateTypes[],
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private sendDownloadSignal: (signal: DownloadSignals) => void,
    private addCurrentDownload: (id: string, upload: Downloader) => void,
    private removeCurrentDownload: (id: string) => void,
  ) {
    this.downloader = new Downloader(
      "svg",
      this.svgId,
      this.filename,
      this.mimeType,
      this.tableStaticContentSocket,
      this.sendDownloadSignal,
      this.removeCurrentDownload,
    );
    this.addCurrentDownload(this.svgId, this.downloader);
    this.downloader.addDownloadListener(this.handleDownloadMessage);
    this.downloader.start();
  }

  deconstructor = () => {
    if (this.blobURL) URL.revokeObjectURL(this.blobURL);

    this.svgListeners.clear();

    if (this.downloader) {
      this.removeCurrentDownload(this.svgId);
      this.downloader = undefined;
    }
  };

  private onDownloadFinish = async (message: onDownloadFinishType) => {
    const { blob, fileSize } = message.data;

    this.fileSize = fileSize;

    this.blobURL = URL.createObjectURL(blob);

    const response = await fetch(this.blobURL);
    const svgText = await response.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");

    this.svg = svgDoc.documentElement as unknown as SVGSVGElement;

    this.svg.setAttribute("height", "100%");
    this.svg.setAttribute("width", "auto");

    this.aspect = this.getSvgAspectRatio();

    this.loadingState = "downloaded";

    this.svgListeners.forEach((listener) => {
      listener({ type: "downloadComplete" });
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

        this.svgListeners.forEach((listener) => {
          listener({ type: "downloadFailed" });
        });
        break;
      case "downloadPaused":
        this.loadingState = "paused";
        this.svgListeners.forEach((listener) => {
          listener({ type: "downloadPaused" });
        });
        break;
      case "downloadResumed":
        this.loadingState = "downloading";
        this.svgListeners.forEach((listener) => {
          listener({ type: "downloadResumed" });
        });
        break;
      default:
        break;
    }
  };

  reloadContent = () => {
    this.fileSize = 0;
    this.blobURL && URL.revokeObjectURL(this.blobURL);
    this.blobURL = undefined;

    this.svg = undefined;

    this.aspect = undefined;

    this.downloader = new Downloader(
      "svg",
      this.svgId,
      this.filename,
      this.mimeType,
      this.tableStaticContentSocket,
      this.sendDownloadSignal,
      this.removeCurrentDownload,
    );
    this.addCurrentDownload(this.svgId, this.downloader);
    this.downloader.addDownloadListener(this.handleDownloadMessage);
    this.downloader.start();
  };

  addSvgListener = (listener: (message: SvgListenerTypes) => void): void => {
    this.svgListeners.add(listener);
  };

  removeSvgListener = (listener: (message: SvgListenerTypes) => void): void => {
    this.svgListeners.delete(listener);
  };

  private getSvgAspectRatio = () => {
    if (!this.svg) {
      return undefined;
    }

    const viewBox = this.svg.getAttribute("viewBox");
    if (viewBox) {
      const [, , width, height] = viewBox.split(" ").map(Number);
      if (width > 0 && height > 0) {
        return width / height;
      }
    }

    const width = parseFloat(this.svg.getAttribute("width") || "0");
    const height = parseFloat(this.svg.getAttribute("height") || "0");
    if (width > 0 && height > 0) {
      return width / height;
    }

    try {
      const bbox = this.svg.getBBox();
      if (bbox.width > 0 && bbox.height > 0) {
        return bbox.width / bbox.height;
      }
    } catch (e) {}

    return undefined;
  };

  setState = (state: TableContentStateTypes[]) => {
    this.state = state;

    this.svgListeners.forEach((listener) => {
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
      "svg",
      this.svgId,
      this.filename,
      this.mimeType,
      this.tableStaticContentSocket,
      this.sendDownloadSignal,
      this.removeCurrentDownload,
    );
    this.addCurrentDownload(this.svgId, this.downloader);
    this.downloader.addDownloadListener(this.handleDownloadMessage);
    this.downloader.start();

    this.svgListeners.forEach((listener) => {
      listener({ type: "downloadRetry" });
    });
  };
}

export default TableSvgMedia;
