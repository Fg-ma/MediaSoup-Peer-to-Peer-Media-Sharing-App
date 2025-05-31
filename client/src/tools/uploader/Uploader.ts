import { v4 as uuidv4 } from "uuid";
import { GeneralSignals } from "../../context/signalContext/lib/typeConstant";
import { UploadSignals } from "../../context/uploadDownloadContext/lib/typeConstant";
import OneShotUploader from "./lib/oneShotUploader/OneShotUploader";
import ChunkUploader from "./lib/chunkUploader/ChunkUploader";
import {
  TableContentStateTypes,
  UserContentStateTypes,
} from "../../../../universal/contentTypeConstant";
import IndexedDB from "../../db/indexedDB/IndexedDB";
import ReasonableFileSizer from "../reasonableFileSizer.ts/ReasonableFileSizer";
import TextChunkUploader from "./lib/textChunkUploader/TextChunkUploader";
import TextOneShotUploader from "./lib/textOneShotUploader/TextOneShotUploader";

const tableStaticContentServerBaseUrl =
  process.env.TABLE_STATIC_CONTENT_SERVER_BASE_URL;
const userStaticContentServerBaseUrl =
  process.env.USER_STATIC_CONTENT_SERVER_BASE_URL;

export type TableUploadDirections = "toTable" | "reupload" | "toTabled";

class Uploader {
  private UPLOAD_SIZE_LIMIT = 1024 * 1024 * 1024;
  private ONE_SHOT_FILE_SIZE_CUTOFF = 1024 * 1024 * 40;

  private oneShotUploader: OneShotUploader;
  private textOneShotUploader: TextOneShotUploader;

  constructor(
    private tableId: React.MutableRefObject<string>,
    private userId: React.MutableRefObject<string>,
    private sendUploadSignal: (signal: UploadSignals) => void,
    private addCurrentUpload: (
      id: string,
      upload: ChunkUploader | TextChunkUploader,
    ) => void,
    private removeCurrentUpload: (id: string) => void,
    private reasonableFileSizer: React.MutableRefObject<ReasonableFileSizer>,
    private indexedDBController: React.MutableRefObject<IndexedDB>,
    private sendGeneralSignal: (signal: GeneralSignals) => void,
  ) {
    this.oneShotUploader = new OneShotUploader(this.sendGeneralSignal);
    this.textOneShotUploader = new TextOneShotUploader(this.sendGeneralSignal);
  }

  uploadToTable = async (
    file: File,
    state: TableContentStateTypes[] = [],
    initPositioning?: {
      position: { top: number; left: number };
      scale: { x: number; y: number };
      rotation: number;
    },
    handle?: FileSystemFileHandle,
    uploadId?: string,
    contentId?: string,
    offset = 0,
  ) => {
    if (file.size > this.UPLOAD_SIZE_LIMIT) {
      this.sendGeneralSignal({
        type: "tableInfoSignal",
        data: {
          message: `${file.name} exceeds upload size limit`,
          timeout: 2500,
        },
      });
      return;
    }

    if (!tableStaticContentServerBaseUrl || !this.tableId.current) return;

    if (file.size < this.ONE_SHOT_FILE_SIZE_CUTOFF) {
      this.sendGeneralSignal({
        type: "tableInfoSignal",
        data: {
          message: `Uploading ${file.name}...`,
          timeout: 2500,
        },
      });

      if (!file.type.startsWith("text/")) {
        this.oneShotUploader.handleOneShotFileUpload(
          file,
          {
            tableId: this.tableId.current,
            contentId: contentId !== undefined ? contentId : uuidv4(),
            instanceId: uuidv4(),
            direction: "toTable",
            state,
            initPositioning,
            mimeType: file.type,
            filename: file.name,
          },
          tableStaticContentServerBaseUrl,
        );
      } else {
        this.textOneShotUploader.handleOneShotFileUpload(
          file,
          {
            tableId: this.tableId.current,
            contentId: contentId !== undefined ? contentId : uuidv4(),
            instanceId: uuidv4(),
            direction: "toTable",
            state,
            initPositioning,
            mimeType: file.type,
            filename: file.name,
          },
          tableStaticContentServerBaseUrl,
        );
      }
    } else {
      const finalContentId = contentId !== undefined ? contentId : uuidv4();

      if (uploadId) {
        this.sendGeneralSignal({
          type: "tableInfoSignal",
          data: {
            message: `Attempting to resume ${file.name} upload...`,
            timeout: 2500,
          },
        });
      } else {
        this.sendGeneralSignal({
          type: "tableInfoSignal",
          data: {
            message: `Uploading ${file.name} this may take a second...`,
            timeout: 2500,
          },
        });
      }

      const metadata = {
        tableId: this.tableId.current,
        contentId: finalContentId,
        instanceId: uuidv4(),
        direction: "toTable",
        state,
        filename: file.name,
        mimeType: file.type,
        initPositioning,
      };

      try {
        let finalUploadId = uploadId;

        if (uploadId === undefined) {
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

          if (!metaRes.ok) return;

          const { uploadId: newUploadId } = await metaRes.json();

          finalUploadId = newUploadId;
        }

        if (!finalUploadId) return;

        if (handle) {
          await this.indexedDBController.current.uploadPosts?.saveFileHandle(
            finalContentId,
            this.tableId.current,
            finalUploadId,
            handle,
            offset,
          );
        }

        setTimeout(
          () =>
            this.sendUploadSignal({
              type: "uploadStart",
            }),
          250,
        );
        let uploader: ChunkUploader | TextChunkUploader;
        if (!file.type.startsWith("text/")) {
          uploader = new ChunkUploader(
            this.tableId,
            file,
            finalUploadId,
            finalContentId,
            this.removeCurrentUpload,
            this.sendUploadSignal,
            this.reasonableFileSizer,
            this.indexedDBController,
            "toTable",
            handle,
            offset,
            this.sendGeneralSignal,
            initPositioning,
            state,
          );
        } else {
          uploader = new TextChunkUploader(
            this.tableId,
            file,
            finalUploadId,
            finalContentId,
            this.removeCurrentUpload,
            this.sendUploadSignal,
            this.reasonableFileSizer,
            this.indexedDBController,
            "toTable",
            handle,
            offset,
            this.sendGeneralSignal,
            initPositioning,
            state,
          );
        }
        this.addCurrentUpload(finalContentId, uploader);
        uploader.start();
      } catch (error) {
        console.error("Error sending metadata:", error);
      }
    }
  };

  reuploadTableContent = async (file: File, contentId: string) => {
    if (file.size > this.UPLOAD_SIZE_LIMIT) {
      this.sendGeneralSignal({
        type: "tableInfoSignal",
        data: {
          message: `${file.name} exceeds upload size limit`,
          timeout: 2500,
        },
      });
      return;
    }

    if (!tableStaticContentServerBaseUrl) return;

    if (file.size < this.ONE_SHOT_FILE_SIZE_CUTOFF) {
      this.oneShotUploader.handleOneShotFileUpload(
        file,
        {
          tableId: this.tableId.current,
          contentId,
          direction: "reupload",
          mimeType: file.type,
          filename: file.name,
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

        if (!metaRes.ok) return;

        const { uploadId } = await metaRes.json();

        if (!uploadId) return;

        setTimeout(
          () =>
            this.sendUploadSignal({
              type: "uploadStart",
            }),
          250,
        );
        const uploader = new ChunkUploader(
          this.tableId,
          file,
          uploadId,
          contentId,
          this.removeCurrentUpload,
          this.sendUploadSignal,
          this.reasonableFileSizer,
          undefined,
          "reupload",
          undefined,
          undefined,
          this.sendGeneralSignal,
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
    if (file.size > this.UPLOAD_SIZE_LIMIT) {
      this.sendGeneralSignal({
        type: "tableInfoSignal",
        data: {
          message: `${file.name} exceeds upload size limit`,
          timeout: 2500,
        },
      });
      return;
    }

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
          mimeType: file.type,
          filename: file.name,
        },
        userStaticContentServerBaseUrl,
      );
    } else {
      const contentId = uuidv4();

      const metadata = {
        userId: this.userId.current,
        contentId,
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

        if (!metaRes.ok) return;

        const { uploadId } = await metaRes.json();

        if (!uploadId) return;

        setTimeout(
          () =>
            this.sendUploadSignal({
              type: "uploadStart",
            }),
          250,
        );
        const uploader = new ChunkUploader(
          this.tableId,
          file,
          uploadId,
          contentId,
          this.removeCurrentUpload,
          this.sendUploadSignal,
          this.reasonableFileSizer,
          undefined,
          "toMuteStyle",
          undefined,
          undefined,
          this.sendGeneralSignal,
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
