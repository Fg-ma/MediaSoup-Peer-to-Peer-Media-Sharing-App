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

      this.removeMessageListener(this.getSvgListener);
    }
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
}

export default SvgMedia;
