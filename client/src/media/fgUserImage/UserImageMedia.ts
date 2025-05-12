import {
  IncomingUserStaticContentMessages,
  TableTopStaticMimeType,
} from "../../serverControllers/userStaticContentServer/lib/typeConstant";
import {
  UserContentStateTypes,
  StaticContentTypes,
} from "../../../../universal/contentTypeConstant";

export type ImageListenerTypes =
  | { type: "downloadComplete" }
  | { type: "stateChanged" };

class UserImageMedia {
  image: HTMLImageElement | undefined;

  private fileChunks: Uint8Array[] = [];
  private fileSize = 0;
  blobURL: string | undefined;
  loadingState: "downloading" | "downloaded" = "downloading";
  aspect: number | undefined;

  private imageListeners: Set<(message: ImageListenerTypes) => void> =
    new Set();

  constructor(
    public imageId: string,
    public filename: string,
    public mimeType: TableTopStaticMimeType,
    public state: UserContentStateTypes[],
    private getImage: (
      contentType: StaticContentTypes,
      contentId: string,
      key: string,
    ) => void,
    private addMessageListener: (
      listener: (message: IncomingUserStaticContentMessages) => void,
    ) => void,
    private removeMessageListener: (
      listener: (message: IncomingUserStaticContentMessages) => void,
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

  private getImageListener = (message: IncomingUserStaticContentMessages) => {
    if (message.type === "chunk") {
      const { contentType, contentId } = message.header;

      if (contentType !== "image" || contentId !== this.imageId) {
        return;
      }

      const chunkData = new Uint8Array(message.data.chunk.data);
      this.fileChunks.push(chunkData);
      this.fileSize += chunkData.length;
    } else if (message.type === "downloadComplete") {
      const { contentType, contentId } = message.header;

      if (contentType !== "image" || contentId !== this.imageId) {
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
}

export default UserImageMedia;
