import { IDBPDatabase } from "idb";
import { HandleListenerTypes, UploadDBSchema } from "./typeConstant";
import { StaticContentTypes } from "../../../../../../universal/contentTypeConstant";

class Posts {
  constructor(
    private uploadDB: IDBPDatabase<UploadDBSchema>,
    private handleListeners: Set<
      (message: HandleListenerTypes) => void
    > = new Set(),
  ) {}

  saveFileHandle = async (
    key: string,
    tableId: string,
    uploadId: string,
    staticContentType: StaticContentTypes,
    handle: FileSystemFileHandle,
    offset: number,
  ) => {
    await this.uploadDB?.put(
      "handles",
      { tableId, uploadId, staticContentType, handle, offset },
      key,
    );
    this.handleListeners.forEach((listener) => {
      listener({
        type: "handleAdded",
        header: {
          key,
          tableId,
          uploadId,
          staticContentType,
          offset,
        },
        data: {
          handle,
        },
      });
    });
  };

  updateProgress = async (key: string, offset: number) => {
    const existing = await this.uploadDB.get("handles", key);
    if (existing) {
      await this.uploadDB.put(
        "handles",
        {
          ...existing,
          offset,
        },
        key,
      );
    }
  };
}

export default Posts;
