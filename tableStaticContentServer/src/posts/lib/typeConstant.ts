import {
  StaticContentTypes,
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
      staticContentType: StaticContentTypes;
      filename: string;
      mimeType: StaticMimeTypes;
    }
  | {
      direction: "reupload";
      tableId: string;
      contentId: string;
      staticContentType: StaticContentTypes;
      mimeType: StaticMimeTypes;
    }
  | {
      direction: "toTabled";
      tableId: string;
      contentId: string;
      state: TableContentStateTypes[];
      staticContentType: StaticContentTypes;
      filename: string;
      mimeType: StaticMimeTypes;
    };

export interface ChunkState {
  uploadId: string;
  parts: { PartNumber: number; ETag: string }[];
  lastUsed: number;
}
