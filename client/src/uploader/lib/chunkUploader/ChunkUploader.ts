import { UploadSignals } from "../../../context/uploadContext/lib/typeConstant";

const tableStaticContentServerBaseUrl =
  process.env.TABLE_STATIC_CONTENT_SERVER_BASE_URL;

export type ChunkedUploadListenerTypes =
  | { type: "uploadPaused" }
  | { type: "uploadPlay" }
  | {
      type: "uploadProgress";
      data: { progress: number };
    };

class ChunkedUploader {
  private offset: number = 0;
  private _paused: boolean = false;
  private readonly CHUNK_SIZE = 1024 * 1024 * 5;
  readonly filename: string;
  readonly uploadUrl: string;
  private _progress: number = 0;

  private listeners: Set<(message: ChunkedUploadListenerTypes) => void> =
    new Set();

  constructor(
    private file: File,
    private uploadId: string,
    private contentId: string,
    private removeCurrentUpload: (id: string) => void,
    private sendUploadSignal: (signal: UploadSignals) => void,
  ) {
    this.filename = this.file.name;
    this.uploadUrl = URL.createObjectURL(this.file);
  }

  deconstructor = () => {
    URL.revokeObjectURL(this.uploadUrl);
    this.removeCurrentUpload(this.contentId);
    this.sendUploadSignal({ type: "uploadFinish" });
    this.listeners.clear();
  };

  async start() {
    this._paused = false;
    setTimeout(
      () =>
        this.listeners.forEach((listener) => {
          listener({
            type: "uploadPlay",
          });
        }),
      250,
    );
    await this.uploadLoop();
  }

  pause() {
    this._paused = true;
    this.listeners.forEach((listener) => {
      listener({
        type: "uploadPaused",
      });
    });
  }

  resume() {
    if (this._paused) {
      this.start();
    }
  }

  private async uploadLoop() {
    while (this.offset < this.file.size && !this._paused) {
      const chunk = this.file.slice(this.offset, this.offset + this.CHUNK_SIZE);
      const chunkIndex = Math.floor(this.offset / this.CHUNK_SIZE);
      const totalChunks = Math.ceil(this.file.size / this.CHUNK_SIZE);

      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("chunkIndex", chunkIndex.toString());
      formData.append("totalChunks", totalChunks.toString());

      try {
        await fetch(
          `${tableStaticContentServerBaseUrl}upload-chunk/${this.uploadId}`,
          {
            method: "POST",
            body: formData,
          },
        );

        this.offset += this.CHUNK_SIZE;

        this._progress = this.offset / this.file.size;

        this.listeners.forEach((listener) => {
          listener({
            type: "uploadProgress",
            data: { progress: this.offset / this.file.size },
          });
        });
      } catch (error) {
        console.error("Chunk upload failed:", error);
        break;
      }
    }

    if (this.offset >= this.file.size) {
      this.deconstructor();
    }
  }

  addChunkedUploadListener = (
    listener: (message: ChunkedUploadListenerTypes) => void,
  ): void => {
    this.listeners.add(listener);
  };

  removeChunkedUploadListener = (
    listener: (message: ChunkedUploadListenerTypes) => void,
  ): void => {
    this.listeners.delete(listener);
  };

  public get paused(): boolean {
    return this._paused;
  }

  public get progress(): number {
    return this._progress;
  }
}

export default ChunkedUploader;
