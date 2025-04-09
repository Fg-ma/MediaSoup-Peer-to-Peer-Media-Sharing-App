import {
  ContentStateTypes,
  StaticContentTypes,
} from "../../../../universal/contentTypeConstant";
import {
  IncomingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/lib/typeConstant";

export type TextMediaEvents = onTextFinishedLoadingType;

export type onTextFinishedLoadingType = {
  type: "textFinishedLoading";
};

export type TextListenerTypes =
  | { type: "downloadComplete" }
  | { type: "stateChanged" };

class TextMedia {
  text: string | undefined;

  private fileChunks: Uint8Array[] = [];
  private totalSize = 0;

  private textListeners: Set<(message: TextListenerTypes) => void> = new Set();

  constructor(
    public textId: string,
    public filename: string,
    public mimeType: TableTopStaticMimeType,
    public state: ContentStateTypes[],
    private getText: (
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
    this.getText("text", this.textId, this.filename);
    this.addMessageListener(this.getTextListener);
  }

  deconstructor = () => {
    this.removeMessageListener(this.getTextListener);

    this.textListeners.clear();
  };

  private getTextListener = (message: IncomingTableStaticContentMessages) => {
    if (message.type === "chunk") {
      const { contentType, contentId, key } = message.header;

      if (
        contentType !== "text" ||
        contentId !== this.textId ||
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
        contentType !== "text" ||
        contentId !== this.textId ||
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

      this.text = new TextDecoder("utf-8").decode(mergedBuffer);

      this.textListeners.forEach((listener) => {
        listener({ type: "downloadComplete" });
      });

      this.removeMessageListener(this.getTextListener);
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

  setState = (state: ContentStateTypes[]) => {
    this.state = state;

    this.textListeners.forEach((listener) => {
      listener({ type: "stateChanged" });
    });
  };
}

export default TextMedia;
