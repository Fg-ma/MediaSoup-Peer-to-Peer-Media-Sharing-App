import {
  StaticContentTypes,
  UserContentStateTypes,
} from "../../../../../universal/contentTypeConstant";

export type TableTopStaticMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "video/mp4"
  | "video/mpeg"
  | "image/gif"
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type OutGoingUserStaticContentMessages =
  | onConnectType
  | onDisconnectType
  | onDeleteContentType
  | onGetDownloadMetaType
  | onGetFileChunkType
  | onChangeContentStateType
  | onSearchUserContentRequestType
  | onMuteStylesRequestType;

type onConnectType = {
  type: "connect";
  header: {
    userId: string;
    instance: string;
  };
};

type onDisconnectType = {
  type: "disconnect";
  header: {
    userId: string;
    instance: string;
  };
};

type onDeleteContentType = {
  type: "deleteContent";
  header: {
    userId: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
};

type onGetDownloadMetaType = {
  type: "getDownloadMeta";
  header: {
    userId: string;
    instance: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
};

type onGetFileChunkType = {
  type: "getFileChunk";
  header: {
    userId: string;
    instance: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    range: string;
  };
};

type onChangeContentStateType = {
  type: "changeContentState";
  header: {
    userId: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    state: UserContentStateTypes[];
  };
};

type onSearchUserContentRequestType = {
  type: "searchUserContentRequest";
  header: {
    userId: string;
    instance: string;
    contentType: StaticContentTypes | "all";
  };
  data: {
    name: string;
  };
};

type onMuteStylesRequestType = {
  type: "muteStylesRequest";
  header: {
    userId: string;
    instance: string;
  };
};

export type IncomingUserStaticContentMessages =
  | { type: undefined }
  | onApplicationUploadedToUserContentType
  | onSoundClipUploadedToUserContentType
  | onVideoUploadedToUserContentType
  | onImageUploadedToUserContentType
  | onSvgUploadedToUserContentType
  | onTextUploadedToUserContentType
  | onChunkType
  | onChunkErrorType
  | onDownloadMetaType
  | onOneShotDownloadType
  | onDownloadErrorType
  | onContentDeletedType
  | onContentStateChangedType
  | onMuteStylesResponseType;

export type onVideoUploadedToUserContentType = {
  type: "videoUploadedToUserContent";
  header: {
    contentId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: UserContentStateTypes[];
  };
};

export type onImageUploadedToUserContentType = {
  type: "imageUploadedToUserContent";
  header: {
    contentId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: UserContentStateTypes[];
  };
};

export type onSvgUploadedToUserContentType = {
  type: "svgUploadedToUserContent";
  header: {
    contentId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: UserContentStateTypes[];
  };
};

export type onTextUploadedToUserContentType = {
  type: "textUploadedToUserContent";
  header: {
    contentId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: UserContentStateTypes[];
  };
};

export type onApplicationUploadedToUserContentType = {
  type: "applicationUploadedToUserContent";
  header: {
    contentId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: UserContentStateTypes[];
  };
};

export type onSoundClipUploadedToUserContentType = {
  type: "soundClipUploadedToUserContent";
  header: {
    contentId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: UserContentStateTypes[];
  };
};

export type onChunkType = {
  type: "chunk";
  header: {
    contentType: StaticContentTypes;
    contentId: string;
    range: string;
  };
  data: {
    chunk: Uint8Array<any>;
  };
};

export type onChunkErrorType = {
  type: "chunkError";
  header: {
    contentType: StaticContentTypes;
    contentId: string;
  };
};

export type onDownloadMetaType = {
  type: "downloadMeta";
  header: {
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    fileSize: number;
  };
};

export type onOneShotDownloadType = {
  type: "oneShotDownload";
  header: {
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    buffer: Uint8Array<any>;
  };
};

export type onDownloadErrorType = {
  type: "downloadError";
  header: { contentType: StaticContentTypes; contentId: string };
};

export type onContentDeletedType = {
  type: "contentDeleted";
  header: {
    contentType: StaticContentTypes;
    contentId: string;
  };
};

export type onContentStateChangedType = {
  type: "contentStateChanged";
  header: { contentType: StaticContentTypes; contentId: string };
  data: { state: UserContentStateTypes[] };
};

export type onSearchUserContentRespondedType = {
  type: "searchUserContentResponded";
  data: any;
};

export type onMuteStylesResponseType = {
  type: "muteStylesResponse";
  data: {
    svgs: {
      userId: string;
      svgId: string;
      filename: string;
      mimeType: TableTopStaticMimeType;
      state: UserContentStateTypes[];
    }[];
  };
};
