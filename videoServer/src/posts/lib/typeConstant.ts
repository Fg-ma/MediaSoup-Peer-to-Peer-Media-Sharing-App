import {
  StaticMimeTypes,
  TableContentStateTypes,
} from "../../../../universal/contentTypeConstant";

export type UploadSession =
  | {
      direction: "toTable";
      tableId: string;
      contentId: string;
      instanceId: string;
      state: TableContentStateTypes[];
      filename: string;
      mimeType: StaticMimeTypes;
    }
  | {
      direction: "reupload";
      tableId: string;
      contentId: string;
      mimeType: StaticMimeTypes;
    }
  | {
      direction: "toTabled";
      tableId: string;
      contentId: string;
      state: TableContentStateTypes[];
      filename: string;
      mimeType: StaticMimeTypes;
    };

export interface ChunkState {
  parts: { PartNumber: number }[];
  currentSize: number;
}
