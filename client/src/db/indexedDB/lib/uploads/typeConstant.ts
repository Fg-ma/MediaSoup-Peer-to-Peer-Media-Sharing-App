import { DBSchema } from "idb";

export interface UploadDBSchema extends DBSchema {
  handles: {
    key: string;
    value: {
      tableId: string;
      uploadId: string;
      handle: FileSystemFileHandle;
      offset: number;
      totalSize: number;
    };
  };
}

export type HandleListenerTypes =
  | {
      type: "handleAdded";
      header: {
        tableId: string;
        uploadId: string;
        key: string;
        offset: number;
        totalSize: number;
      };
      data: {
        handle: FileSystemFileHandle;
      };
    }
  | {
      type: "handleDeleted";
      header: {
        key: string;
      };
    };
