import { openDB, IDBPDatabase, DBSchema } from "idb";

interface UploadDBSchema extends DBSchema {
  handles: {
    key: string;
    value: { tableId: string; handle: FileSystemFileHandle };
  };
}

class IndexedDB {
  uploadDB: undefined | IDBPDatabase<UploadDBSchema>;

  constructor() {
    void this.init();
  }

  init = async () => {
    this.uploadDB = await openDB("upload-db", 1, {
      upgrade(db) {
        db.createObjectStore("handles");
      },
    });
  };

  saveFileHandle = async (key: string, handle: FileSystemFileHandle) => {
    await this.uploadDB?.put("handles", handle, key);
  };

  getFileHandle = async (
    key: string,
  ): Promise<FileSystemFileHandle | undefined> => {
    return await this.uploadDB?.get("handles", key);
  };

  deleteFileHandle = async (key: string) => {
    await this.uploadDB?.delete("handles", key);
  };

  getAllFileHandles = async (): Promise<
    { key: string; handle: FileSystemFileHandle }[]
  > => {
    if (!this.uploadDB) throw new Error("IndexedDB not initialized");

    const keys = await this.uploadDB.getAllKeys("handles");
    const entries: { key: string; handle: FileSystemFileHandle }[] = [];

    for (const key of keys) {
      const handle = await this.uploadDB.get("handles", key as string);
      if (handle) {
        entries.push({ key: key as string, handle });
      }
    }

    return entries;
  };

  addHandleObjStoreListener;
}

export default IndexedDB;
