import { DBSchema } from "idb";
import { StaticContentTypes } from "../../../../../../universal/contentTypeConstant";

export interface UploadDBSchema extends DBSchema {
  handles: {
    key: string;
    value: {
      tableId: string;
      uploadId: string;
      staticContentType: StaticContentTypes;
      offset: number;
      handle: FileSystemFileHandle;
    };
  };
}

export type HandleListenerTypes =
  | {
      type: "handleAdded";
      header: {
        tableId: string;
        uploadId: string;
        staticContentType: StaticContentTypes;
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
