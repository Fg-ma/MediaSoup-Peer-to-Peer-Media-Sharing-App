import { StaticContentTypes } from "../../../../universal/typeConstant";
import {
  IncomingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/lib/typeConstant";

export type TextMediaEvents = onTextFinishedLoadingType;

export type onTextFinishedLoadingType = {
  type: "textFinishedLoading";
};

class TextMedia {
  static textCache: Map<string, string> = new Map();
  text: string | undefined;

  private listeners: Set<(message: TextMediaEvents) => void> = new Set();

  private fileChunks: Uint8Array[] = [];
  private totalSize = 0;

  constructor(
    public textId: string,
    public filename: string,
    public mimeType: TableTopStaticMimeType,
    public tabled: boolean,
    private getText: (
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
    if (TextMedia.textCache.has(this.textId)) {
      this.text = TextMedia.textCache.get(this.textId);
    } else {
      this.getText("text", this.textId, this.filename);
      this.addMessageListener(this.getTextListener);
    }
  }

  deconstructor = () => {};

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

      this.emitEvent({ type: "textFinishedLoading" });

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

  private emitEvent = (event: TextMediaEvents) => {
    this.listeners.forEach((listener) => {
      listener(event);
    });
  };

  addListener = (listener: (message: TextMediaEvents) => void): void => {
    this.listeners.add(listener);
  };

  removeListener = (listener: (message: TextMediaEvents) => void): void => {
    this.listeners.delete(listener);
  };
}

export default TextMedia;
