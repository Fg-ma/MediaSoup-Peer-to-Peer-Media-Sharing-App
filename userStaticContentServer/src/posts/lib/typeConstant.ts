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
    }
  | {
      direction: "toUserContent";
      userId: string;
      contentId: string;
      state: UserContentStateTypes[];
      staticContentType: StaticContentTypes;
      mimeType: StaticMimeTypes;
    };

export interface ChunkState {
  uploadId: string;
  parts: { PartNumber: number; ETag: string }[];
}
