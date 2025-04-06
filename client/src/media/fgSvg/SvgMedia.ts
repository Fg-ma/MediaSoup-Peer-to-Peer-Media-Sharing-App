import {
  IncomingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import {
  ContentStateTypes,
  StaticContentTypes,
} from "../../../../universal/contentTypeConstant";

class SvgMedia {
  svg: SVGSVGElement | undefined;

  private fileChunks: Uint8Array[] = [];
  private totalSize = 0;
  blobURL: string | undefined;

  private downloadCompleteListeners: Set<() => void> = new Set();

  aspect: number | undefined;

  constructor(
    public svgId: string,
    public filename: string,
    public mimeType: TableTopStaticMimeType,
    public state: ContentStateTypes[],
    private getSVG: (
      contentType: StaticContentTypes,
      contentId: string,
      key: string
    ) => void,
    private addMessageListener: (
      listener: (message: IncomingTableStaticContentMessages) => void
    ) => void,
    private removeMessageListener: (
      listener: (message: IncomingTableStaticContentMessages) => void
    ) => void
  ) {
    this.getSVG("svg", this.svgId, this.filename);
    this.addMessageListener(this.getSvgListener);
  }

  deconstructor = () => {
    if (this.blobURL) URL.revokeObjectURL(this.blobURL);

    this.removeMessageListener(this.getSvgListener);

    this.downloadCompleteListeners.clear();
  };

  reloadContent = () => {
    this.fileChunks = [];
    this.totalSize = 0;
    this.blobURL && URL.revokeObjectURL(this.blobURL);
    this.blobURL = undefined;

    this.svg = undefined;

    this.aspect = undefined;

    this.getSVG("svg", this.svgId, this.filename);
    this.addMessageListener(this.getSvgListener);
  };

  private getSvgListener = async (
    message: IncomingTableStaticContentMessages
  ) => {
    if (message.type === "chunk") {
      const { contentType, contentId, key } = message.header;

      if (
        contentType !== "svg" ||
        contentId !== this.svgId ||
        key !== this.filename
      ) {
        return;
      }

      const chunkData = new Uint8Array(message.data.chunk.data);
      this.fileChunks.push(chunkData);
      this.totalSize += chunkData.length;
    } else if (message.type === "downloadComplete") {
      const { contentType, contentId, key } = message.header;

      if (
        contentType !== "svg" ||
        contentId !== this.svgId ||
        key !== this.filename
      ) {
        return;
      }

      const mergedBuffer = new Uint8Array(this.totalSize);
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

      this.downloadCompleteListeners.forEach((listener) => {
        listener();
      });

      this.removeMessageListener(this.getSvgListener);
    }
  };

  addDownloadCompleteListener = (listener: () => void): void => {
    this.downloadCompleteListeners.add(listener);
  };

  removeDownloadCompleteListener = (listener: () => void): void => {
    this.downloadCompleteListeners.delete(listener);
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
}

export default SvgMedia;
