import { v4 as uuidv4 } from "uuid";
import OneShotUploader from "./lib/oneShotUploader/OneShotUploader";
import ChunkedUploader from "./lib/chunkUploader/ChunkUploader";
import { UploadSignals } from "../context/uploadDownloadContext/lib/typeConstant";
import {
  TableContentStateTypes,
  UserContentStateTypes,
} from "../../../universal/contentTypeConstant";
import IndexedDB from "../db/indexedDB/IndexedDB";

const tableStaticContentServerBaseUrl =
  process.env.TABLE_STATIC_CONTENT_SERVER_BASE_URL;
const userStaticContentServerBaseUrl =
  process.env.USER_STATIC_CONTENT_SERVER_BASE_URL;

export type TableUploadDirections = "toTable" | "reupload" | "toTabled";

class Uploader {
  private ONE_SHOT_FILE_SIZE_CUTOFF = 1024 * 1024 * 100;

  private oneShotUploader = new OneShotUploader();

  constructor(
    private tableId: React.MutableRefObject<string>,
    private userId: React.MutableRefObject<string>,
    private sendUploadSignal: (signal: UploadSignals) => void,
    private addCurrentUpload: (id: string, upload: ChunkedUploader) => void,
    private removeCurrentUpload: (id: string) => void,
    private indexedDBController: React.MutableRefObject<IndexedDB>,
  ) {}

  uploadToTable = async (
    file: File,
    state: TableContentStateTypes[] = [],
    initPositioning?: {
      position: { top: number; left: number };
      scale: { x: number; y: number };
      rotation: number;
    },
    handle?: FileSystemFileHandle,
  ) => {
    if (!tableStaticContentServerBaseUrl) return;

    if (file.size < this.ONE_SHOT_FILE_SIZE_CUTOFF) {
      this.oneShotUploader.handleOneShotFileUpload(
        file,
        {
          tableId: this.tableId.current,
          contentId: uuidv4(),
          instanceId: uuidv4(),
          direction: "toTable",
          state,
          initPositioning,
        },
        tableStaticContentServerBaseUrl,
      );
    } else {
      const contentId = uuidv4();

      const metadata = {
        tableId: this.tableId.current,
        contentId,
        instanceId: uuidv4(),
        direction: "toTable",
        state,
        filename: file.name,
        mimeType: file.type,
        initPositioning,
      };

      if (handle)
        await this.indexedDBController.current.saveFileHandle(
          contentId,
          handle,
        );

      try {
        const metaRes = await fetch(
          tableStaticContentServerBaseUrl + "upload-chunk-meta",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(metadata),
          },
        );

        const { uploadId } = await metaRes.json();

        setTimeout(
          () =>
            this.sendUploadSignal({
              type: "uploadStart",
            }),
          250,
        );
        const uploader = new ChunkedUploader(
          file,
          uploadId,
          contentId,
          this.removeCurrentUpload,
          this.sendUploadSignal,
          this.indexedDBController,
          handle,
        );
        this.addCurrentUpload(contentId, uploader);
        uploader.start();
      } catch (error) {
        console.error("Error sending metadata:", error);
      }
    }
  };

  reuploadTableContent = async (file: File, contentId: string) => {
    if (!tableStaticContentServerBaseUrl) return;

    if (file.size < this.ONE_SHOT_FILE_SIZE_CUTOFF) {
      this.oneShotUploader.handleOneShotFileUpload(
        file,
        {
          tableId: this.tableId.current,
          contentId,
          direction: "reupload",
        },
        tableStaticContentServerBaseUrl,
      );
    } else {
      const contentId = uuidv4();

      const metadata = {
        tableId: this.tableId.current,
        contentId,
        direction: "reupload",
      };

      try {
        const metaRes = await fetch(
          tableStaticContentServerBaseUrl + "upload-chunk-meta",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(metadata),
          },
        );

        const { uploadId } = await metaRes.json();

        setTimeout(
          () =>
            this.sendUploadSignal({
              type: "uploadStart",
            }),
          250,
        );
        const uploader = new ChunkedUploader(
          file,
          uploadId,
          contentId,
          this.removeCurrentUpload,
          this.sendUploadSignal,
          undefined,
          undefined,
        );
        this.addCurrentUpload(contentId, uploader);
        uploader.start();
      } catch (error) {
        console.error("Error sending metadata:", error);
      }
    }
  };

  uploadToMuteStyle = async (
    file: File,
    state: UserContentStateTypes[] = [],
  ) => {
    if (!userStaticContentServerBaseUrl) return;

    if (file.size < this.ONE_SHOT_FILE_SIZE_CUTOFF) {
      this.oneShotUploader.handleOneShotFileUpload(
        file,
        {
          userId: this.userId.current,
          contentId: uuidv4(),
          instanceId: uuidv4(),
          direction: "toMuteStyle",
          state,
        },
        userStaticContentServerBaseUrl,
      );
    } else {
      const contentId = uuidv4();

      const metadata = {
        userId: this.userId.current,
        contentId,
        instanceId: uuidv4(),
        direction: "toMuteStyle",
        state,
        filename: file.name,
        mimeType: file.type,
      };

      try {
        const metaRes = await fetch(
          userStaticContentServerBaseUrl + "upload-chunk-meta",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(metadata),
          },
        );

        const { uploadId } = await metaRes.json();

        setTimeout(
          () =>
            this.sendUploadSignal({
              type: "uploadStart",
            }),
          250,
        );
        const uploader = new ChunkedUploader(
          file,
          uploadId,
          contentId,
          this.removeCurrentUpload,
          this.sendUploadSignal,
          undefined,
          undefined,
        );
        this.addCurrentUpload(contentId, uploader);
        uploader.start();
      } catch (error) {
        console.error("Error sending metadata:", error);
      }
    }
  };
}

export default Uploader;
