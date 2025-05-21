import { DBSchema } from "idb";

export interface UploadDBSchema extends DBSchema {
  handles: {
    key: string;
    value: {
      tableId: string;
      uploadId: string;
      handle: FileSystemFileHandle;
      offset: number;
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
