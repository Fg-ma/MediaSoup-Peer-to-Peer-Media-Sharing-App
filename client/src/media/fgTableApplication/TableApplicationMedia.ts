import {
  IncomingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import {
  TableContentStateTypes,
  StaticContentTypes,
} from "../../../../universal/contentTypeConstant";

export type ApplicationListenerTypes =
  | { type: "downloadComplete" }
  | { type: "stateChanged" }
  | { type: "rectifyEffectMeshCount" };

class TableApplicationMedia {
  application: HTMLImageElement | undefined;

  private fileChunks: Uint8Array[] = [];
  private totalSize = 0;
  blobURL: string | undefined;
  loadingState: "downloading" | "downloaded" = "downloading";
  aspect: number | undefined;

  private applicationListeners: Set<
    (message: ApplicationListenerTypes) => void
  > = new Set();

  constructor(
    public applicationId: string,
    public filename: string,
    public mimeType: TableTopStaticMimeType,
    public state: TableContentStateTypes[],
    private getApplication: (
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
    this.getApplication("application", this.applicationId, this.filename);
    this.addMessageListener(this.getApplicationListener);
  }

  deconstructor() {
    if (this.application) {
      this.application.src = "";
      this.application = undefined;
    }

    this.aspect = undefined;

    if (this.blobURL) URL.revokeObjectURL(this.blobURL);

    this.applicationListeners.clear();
  }

  private getApplicationListener = (
    message: IncomingTableStaticContentMessages,
  ) => {
    if (message.type === "chunk") {
      const { contentType, contentId } = message.header;

      if (contentType !== "application" || contentId !== this.applicationId) {
        return;
      }

      const chunkData = new Uint8Array(message.data.chunk.data);
      this.fileChunks.push(chunkData);
      this.totalSize += chunkData.length;
    } else if (message.type === "downloadComplete") {
      const { contentType, contentId } = message.header;

      if (contentType !== "application" || contentId !== this.applicationId) {
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
      this.application = document.createElement("img");
      this.application.src = this.blobURL;

      this.application.onload = () => {
        this.aspect =
          (this.application?.width ?? 1) / (this.application?.height ?? 1);

        this.loadingState = "downloading";

        this.applicationListeners.forEach((listener) => {
          listener({ type: "downloadComplete" });
        });
      };

      this.removeMessageListener(this.getApplicationListener);
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
}

export default TableApplicationMedia;
