import { v4 as uuidv4 } from "uuid";
import OneShotUploader from "./lib/oneShotUploader/OneShotUploader";
import ChunkedUploader from "./lib/chunkUploader/ChunkUploader";
import { UploadSignals } from "../context/uploadContext/lib/typeConstant";
import { TableContentStateTypes } from "../../../universal/contentTypeConstant";

const tableStaticContentServerBaseUrl =
  process.env.TABLE_STATIC_CONTENT_SERVER_BASE_URL;

export type TableUploadDirections = "toTable" | "reupload" | "toTabled";

class Uploader {
  private ONE_SHOT_FILE_SIZE_CUTOFF = 1024 * 1024 * 100;

  private oneShotUploader = new OneShotUploader();

  constructor(
    private tableId: React.MutableRefObject<string>,
    private sendUploadSignal: (signal: UploadSignals) => void,
    private addCurrentUpload: (id: string, upload: ChunkedUploader) => void,
    private removeCurrentUpload: (id: string) => void,
  ) {}

  uploadToTable = async (
    file: File,
    state: TableContentStateTypes[] = [],
    initPositioning?: {
      position: { top: number; left: number };
      scale: { x: number; y: number };
      rotation: number;
    },
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
