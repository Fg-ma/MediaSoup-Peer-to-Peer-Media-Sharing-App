import {
  IncomingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import {
  ContentStateTypes,
  StaticContentTypes,
} from "../../../../universal/contentTypeConstant";

export type SoundClipListenerTypes =
  | { type: "downloadComplete" }
  | { type: "stateChanged" };

class SoundClipMedia {
  soundClip: HTMLAudioElement | undefined;

  private fileChunks: Uint8Array[] = [];
  private totalSize = 0;
  blobURL: string | undefined;

  private soundClipListeners: Set<(message: SoundClipListenerTypes) => void> =
    new Set();

  constructor(
    public soundClipId: string,
    public filename: string,
    public mimeType: TableTopStaticMimeType,
    public state: ContentStateTypes[],
    private getSoundClip: (
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
    this.getSoundClip("soundClip", this.soundClipId, this.filename);
    this.addMessageListener(this.getSoundClipListener);
  }

  deconstructor = () => {
    if (this.blobURL) URL.revokeObjectURL(this.blobURL);

    this.removeMessageListener(this.getSoundClipListener);

    this.soundClipListeners.clear();
  };

  private getSoundClipListener = async (
    message: IncomingTableStaticContentMessages,
  ) => {
    if (message.type === "chunk") {
      const { contentType, contentId, key } = message.header;

      if (
        contentType !== "soundClip" ||
        contentId !== this.soundClipId ||
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
        contentType !== "soundClip" ||
        contentId !== this.soundClipId ||
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

      this.soundClip = new Audio(this.blobURL);

      this.soundClip.onload = () => {
        this.soundClipListeners.forEach((listener) => {
          listener({ type: "downloadComplete" });
        });
      };

      this.removeMessageListener(this.getSoundClipListener);
    }
  };

  addSoundClipListener = (
    listener: (message: SoundClipListenerTypes) => void,
  ): void => {
    this.soundClipListeners.add(listener);
  };

  removeSoundClipListener = (
    listener: (message: SoundClipListenerTypes) => void,
  ): void => {
    this.soundClipListeners.delete(listener);
  };

  setState = (state: ContentStateTypes[]) => {
    this.state = state;

    this.soundClipListeners.forEach((listener) => {
      listener({ type: "stateChanged" });
    });
  };
}

export default SoundClipMedia;
