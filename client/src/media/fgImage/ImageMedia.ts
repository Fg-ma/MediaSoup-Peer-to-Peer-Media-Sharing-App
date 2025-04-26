import {
  IncomingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import {
  ContentStateTypes,
  StaticContentTypes,
} from "../../../../universal/contentTypeConstant";

export type ImageListenerTypes =
  | { type: "downloadComplete" }
  | { type: "stateChanged" };

class ImageMedia {
  image: HTMLImageElement | undefined;

  private fileChunks: Uint8Array[] = [];
  private totalSize = 0;
  blobURL: string | undefined;
  loadingState: "downloading" | "downloaded" = "downloading";
  aspect: number | undefined;

  private imageListeners: Set<(message: ImageListenerTypes) => void> =
    new Set();

  constructor(
    public imageId: string,
    public filename: string,
    public mimeType: TableTopStaticMimeType,
    public state: ContentStateTypes[],
    private getImage: (
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
    this.getImage("image", this.imageId, this.filename);
    this.addMessageListener(this.getImageListener);
  }

  deconstructor() {
    if (this.image) {
      this.image.src = "";
      this.image = undefined;
    }

    this.aspect = undefined;

    if (this.blobURL) URL.revokeObjectURL(this.blobURL);

    this.imageListeners.clear();
  }

  private getImageListener = (message: IncomingTableStaticContentMessages) => {
    if (message.type === "chunk") {
      const { contentType, contentId, key } = message.header;

      if (
        contentType !== "image" ||
        contentId !== this.imageId ||
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
        contentType !== "image" ||
        contentId !== this.imageId ||
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
      this.image = document.createElement("img");
      this.image.src = this.blobURL;

      this.image.onload = () => {
        this.aspect = (this.image?.width ?? 1) / (this.image?.height ?? 1);

        this.loadingState = "downloaded";

        this.imageListeners.forEach((listener) => {
          listener({ type: "downloadComplete" });
        });
      };

      this.removeMessageListener(this.getImageListener);
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

  setState = (state: ContentStateTypes[]) => {
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
}

export default ImageMedia;
