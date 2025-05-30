import {
  StaticContentTypes,
  StaticMimeTypes,
  UserContentStateTypes,
} from "../../../../universal/contentTypeConstant";

export type UploadSession =
  | {
      direction: "toMuteStyle";
      userId: string;
      contentId: string;
      state: UserContentStateTypes[];
      staticContentType: StaticContentTypes;
      filename: string;
    }
  | {
      direction: "toUserContent";
      userId: string;
      contentId: string;
      state: UserContentStateTypes[];
      staticContentType: StaticContentTypes;
      mimeType: StaticMimeTypes;
      filename: string;
    };

export interface ChunkState {
  parts: { PartNumber: number; ETag: string }[];
  currentSize: number;
}
