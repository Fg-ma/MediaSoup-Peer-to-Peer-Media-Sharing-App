import { IDBPDatabase } from "idb";
import { UploadDBSchema } from "./typeConstant";

class Gets {
  constructor(private uploadDB: IDBPDatabase<UploadDBSchema>) {}

  getFileHandle = async (
    key: string,
  ): Promise<
    | {
        tableId: string;
        uploadId: string;
        offset: number;
        totalSize: number;
        handle: FileSystemFileHandle;
      }
    | undefined
  > => {
    return await this.uploadDB?.get("handles", key);
  };

  getAllFileHandles = async (): Promise<
    {
      key: string;
      tableId: string;
      uploadId: string;
      offset: number;
      totalSize: number;
      handle: FileSystemFileHandle;
    }[]
  > => {
    if (!this.uploadDB) throw new Error("IndexedDB not initialized");

    const keys = await this.uploadDB.getAllKeys("handles");
    const entries: {
      key: string;
      tableId: string;
      uploadId: string;
      offset: number;
      totalSize: number;
      handle: FileSystemFileHandle;
    }[] = [];

    for (const key of keys) {
      const data = await this.uploadDB.get("handles", key);
      if (data) {
        entries.push({ key, ...data });
      }
    }

    return entries;
  };
}

export default Gets;
