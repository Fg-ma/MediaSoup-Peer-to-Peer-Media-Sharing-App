import {
  StaticMimeTypes,
  TableContentStateTypes,
} from "../../../../universal/contentTypeConstant";

export type UploadSession =
  | {
      tableId: string;
      username: string;
      instance: string;
      direction: "toTable";
      contentId: string;
      instanceId: string;
      state: TableContentStateTypes[];
      filename: string;
      mimeType: StaticMimeTypes;
    }
  | {
      tableId: string;
      username: string;
      instance: string;
      direction: "reupload";
      contentId: string;
      mimeType: StaticMimeTypes;
    }
  | {
      tableId: string;
      username: string;
      instance: string;
      direction: "toTabled";
      contentId: string;
      state: TableContentStateTypes[];
      filename: string;
      mimeType: StaticMimeTypes;
    };

export interface ChunkState {
  parts: number[];
  currentSize: number;
}
