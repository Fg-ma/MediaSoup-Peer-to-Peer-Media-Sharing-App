import {
  IncomingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import {
  TableContentStateTypes,
  StaticContentTypes,
} from "../../../../universal/contentTypeConstant";

export type SvgListenerTypes =
  | { type: "downloadComplete" }
  | { type: "stateChanged" };

class TableSvgMedia {
  svg: SVGSVGElement | undefined;

  private fileChunks: Uint8Array[] = [];
  private fileSize = 0;
  blobURL: string | undefined;
  loadingState: "downloading" | "downloaded" = "downloading";
  aspect: number | undefined;

  private svgListeners: Set<(message: SvgListenerTypes) => void> = new Set();

  constructor(
    public svgId: string,
    public filename: string,
    public mimeType: TableTopStaticMimeType,
    public state: TableContentStateTypes[],
    private getSVG: (
      contentType: StaticContentTypes,
      contentId: string,
      key: string,
    ) => void,
    private addMessageListener: (
      listener: (message: IncomingTableStaticContentMessages) => void,
    ) => void,
    private removeMessageListener: (
      listener: (message: IncomingTableStaticContentMessages) => void,
    ) => void,
  ) {
    this.getSVG("svg", this.svgId, this.filename);
    this.addMessageListener(this.getSvgListener);
  }

  deconstructor = () => {
    if (this.blobURL) URL.revokeObjectURL(this.blobURL);

    this.removeMessageListener(this.getSvgListener);

    this.svgListeners.clear();
  };

  reloadContent = () => {
    this.fileChunks = [];
    this.fileSize = 0;
    this.blobURL && URL.revokeObjectURL(this.blobURL);
    this.blobURL = undefined;

    this.svg = undefined;

    this.aspect = undefined;

    this.getSVG("svg", this.svgId, this.filename);
    this.addMessageListener(this.getSvgListener);
  };

  private getSvgListener = async (
    message: IncomingTableStaticContentMessages,
  ) => {
    if (message.type === "chunk") {
      const { contentType, contentId } = message.header;

      if (contentType !== "svg" || contentId !== this.svgId) {
        return;
      }

      const chunkData = new Uint8Array(message.data.chunk.data);
      this.fileChunks.push(chunkData);
      this.fileSize += chunkData.length;
    } else if (message.type === "downloadComplete") {
      const { contentType, contentId } = message.header;

      if (contentType !== "svg" || contentId !== this.svgId) {
        return;
      }

      const mergedBuffer = new Uint8Array(this.fileSize);
      let offset = 0;

      for (const chunk of this.fileChunks) {
        mergedBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      const blob = new Blob([mergedBuffer], { type: this.mimeType });
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

      this.removeMessageListener(this.getSvgListener);
    }
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
}

export default TableSvgMedia;
