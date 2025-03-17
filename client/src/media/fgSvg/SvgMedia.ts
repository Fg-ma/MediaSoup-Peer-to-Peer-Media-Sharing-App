import {
  IncomingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import { StaticContentTypes } from "../../../../universal/typeConstant";
import {
  defaultSvgEffectsStyles,
  defaultSvgStreamEffects,
  UserEffectsStylesType,
  UserStreamEffectsType,
} from "../../context/effectsContext/typeConstant";

class SvgMedia {
  svg?: SVGSVGElement;

  filename: string;
  mimeType: TableTopStaticMimeType;
  visible: boolean;

  private fileChunks: Uint8Array[] = [];
  private totalSize = 0;
  blobURL: string | undefined;

  initPositioning: {
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  };

  private downloadCompleteListeners: Set<() => void> = new Set();

  constructor(
    private svgId: string,
    filename: string,
    mimeType: TableTopStaticMimeType,
    visible: boolean,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userStreamEffects: React.MutableRefObject<UserStreamEffectsType>,
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
    ) => void,
    initPositioning: {
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    }
  ) {
    this.filename = filename;
    this.mimeType = mimeType;
    this.visible = visible;
    this.initPositioning = initPositioning;

    if (!this.userStreamEffects.current.svg[this.svgId]) {
      this.userStreamEffects.current.svg[this.svgId] = structuredClone(
        defaultSvgStreamEffects
      );
    }

    if (!this.userEffectsStyles.current.svg[this.svgId]) {
      this.userEffectsStyles.current.svg[this.svgId] = structuredClone(
        defaultSvgEffectsStyles
      );
    }

    this.getSVG("svg", this.svgId, this.filename);
    this.addMessageListener(this.getSvgListener);
  }

  deconstructor() {
    if (this.blobURL) URL.revokeObjectURL(this.blobURL);

    this.removeMessageListener(this.getSvgListener);

    this.downloadCompleteListeners.clear();
  }

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
      this.svg.setAttribute("width", "100%");
      this.svg.setAttribute("height", "100%");
      this.svg.setAttribute("fill", "white");
      this.svg.setAttribute("stroke", "white");

      this.downloadCompleteListeners.forEach((listener) => {
        listener();
      });
      this.downloadCompleteListeners.clear();

      this.removeMessageListener(this.getSvgListener);
    }
  };

  addDownloadCompleteListener = (listener: () => void): void => {
    this.downloadCompleteListeners.add(listener);
  };

  removeDownloadCompleteListener = (listener: () => void): void => {
    this.downloadCompleteListeners.delete(listener);
  };

  downloadSvg = () => {
    if (!this.blobURL) {
      return;
    }

    const link = document.createElement("a");
    link.href = this.blobURL;
    link.download = "downloaded-vector-image.svg";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // copyToClipBoardBezierCurve = () => {
  //   let svg = this.getCurrentDownloadableSVG();

  //   if (this.settings.downloadOptions.compression.value === "Minified")
  //     svg = this.minifySVG(svg);

  //   navigator.clipboard.writeText(svg).then(() => {
  //     this.setCopied(true);

  //     if (this.copiedTimeout.current) {
  //       clearTimeout(this.copiedTimeout.current);
  //       this.copiedTimeout.current = undefined;
  //     }

  //     this.copiedTimeout.current = setTimeout(() => {
  //       this.setCopied(false);
  //     }, 2250);
  //   });
  // };

  // private getCurrentDownloadableSVG = () => {
  //   const { size } = this.settings.downloadOptions;
  //   const svgWidth = size.value;
  //   const svgHeight = size.value;

  //   return `
  //   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${svgWidth}" height="${svgHeight}" style="background-color: ${
  //     this.settings.backgroundColor.value
  //   };">
  //     ${this.isFilter() ? this.getFilters() : ""}
  //     ${this.isFilter() ? `<g filter="${this.getFilterURLs()}">` : ""}
  //       <path
  //         d="${this.getPathData()}"
  //         stroke="${this.settings.color.value}"
  //         fill="none"
  //         stroke-width="4"
  //         stroke-linecap="round"
  //         stroke-linejoin="round"
  //       />
  //     ${this.isFilter() ? "</g>" : ""}
  //   </svg>
  // `;
  // };

  // downloadBezierCurve = () => {
  //   const { mimeType, compression } = this.settings.downloadOptions;

  //   // Construct the SVG string
  //   let SVG = this.getCurrentDownloadableSVG();

  //   switch (compression.value) {
  //     case "Minified":
  //       SVG = this.minifySVG(SVG);
  //       break;
  //     case "Zipped":
  //       return this.convertToSVGZ(SVG);
  //     case "Plain":
  //     default:
  //       break;
  //   }

  //   const blob = new Blob([SVG], { type: "image/svg+xml" });
  //   const url = URL.createObjectURL(blob);

  //   switch (mimeType.value) {
  //     case "svg":
  //     case "svgz":
  //       this.downloadFile(
  //         url,
  //         `${this.name.current ? this.name.current : "download"}.${
  //           mimeType.value
  //         }`
  //       );
  //       break;
  //     case "png":
  //     case "jpg":
  //     case "webp":
  //     case "tiff":
  //     case "heic":
  //       this.convertSVGToImage(SVG, mimeType.value);
  //       break;
  //     default:
  //       break;
  //   }
  // };

  // private minifySVG = (svgString: string) => {
  //   return svgString.replace(/\s+/g, " ").trim();
  // };

  // private downloadFile = (url: string, filename: string) => {
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = filename;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };
}

export default SvgMedia;
