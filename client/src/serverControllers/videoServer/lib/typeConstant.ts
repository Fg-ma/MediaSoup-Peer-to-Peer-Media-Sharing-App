import {
  TableContentStateTypes,
  StaticContentTypes,
  StaticMimeTypes,
} from "../../../../../universal/contentTypeConstant";

export type OutGoingVideoMessages =
  | onJoinTableType
  | onLeaveTableType
  | onGetDownloadMetaType
  | onGetFileChunkType
  | onUpdateVideoPositionType
  | onRequestCatchUpVideoPositionType
  | onResponseCatchUpVideoPositionType
  | onDeleteUploadSessionType
  | onSignalReuploadStartType;

type onJoinTableType = {
  type: "joinTable";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

type onLeaveTableType = {
  type: "leaveTable";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

type onGetDownloadMetaType = {
  type: "getDownloadMeta";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
};

type onGetFileChunkType = {
  type: "getFileChunk";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    range: string;
  };
};

type onUpdateVideoPositionType = {
  type: "updateVideoPosition";
  header: {
    tableId: string;
    contentType: "video";
    contentId: string;
    instanceId: string;
  };
  data: {
    videoPosition: number;
  };
};

type onRequestCatchUpVideoPositionType = {
  type: "requestCatchUpVideoPosition";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentType: "video";
    contentId: string;
    instanceId: string;
  };
};

type onResponseCatchUpVideoPositionType = {
  type: "responseCatchUpVideoPosition";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentType: "video";
    contentId: string;
    instanceId: string;
  };
  data: {
    currentVideoPosition: number;
  };
};

type onDeleteUploadSessionType = {
  type: "deleteUploadSession";
  header: { uploadId: string };
};

type onSignalReuploadStartType = {
  type: "signalReuploadStart";
  header: {
    tableId: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
};

export type IncomingVideoMessages =
  | { type: undefined }
  | onProcessingProgressType
  | onProcessingFinishedType
  | onVideoUploadedToTableType
  | onVideoUploadedToTabledType
  | onDashVideoReadyType
  | onContentReuploadedType
  | onChunkType
  | onChunkErrorType
  | onDownloadMetaType
  | onOneShotDownloadType
  | onDownloadErrorType
  | onUpdatedVideoPositionType
  | onRequestedCatchUpVideoPositionType
  | onRespondedCatchUpVideoPositionType
  | onReuploadStartedType
  | onReuploadCancelledType;

export type onProcessingProgressType = {
  type: "processingProgress";
  header: { contentId: string };
  data: { progress: number };
};

export type onProcessingFinishedType = {
  type: "processingFinished";
  header: { contentId: string };
};

export type onVideoUploadedToTableType = {
  type: "videoUploadedToTable";
  header: {
    contentId: string;
    instanceId: string;
  };
  data: {
    filename: string;
    mimeType: StaticMimeTypes;
    state: TableContentStateTypes[];
    initPositioning:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined;
  };
};

export type onVideoUploadedToTabledType = {
  type: "videoUploadedToTabled";
  header: {
    contentId: string;
  };
  data: {
    filename: string;
    mimeType: StaticMimeTypes;
    state: TableContentStateTypes[];
  };
};

export type onDashVideoReadyType = {
  type: "dashVideoReady";
  header: {
    videoId: string;
  };
  data: {
    filename: string;
  };
};

export type onContentReuploadedType = {
  type: "contentReuploaded";
  header: {
    contentId: string;
    contentType: StaticContentTypes;
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

export type onUpdatedVideoPositionType = {
  type: "updatedVideoPosition";
  header: {
    contentType: "video";
    contentId: string;
    instanceId: string;
  };
  data: {
    videoPosition: number;
  };
};

export type onRequestedCatchUpVideoPositionType = {
  type: "requestedCatchUpVideoPosition";
  header: {
    username: string;
    instance: string;
    contentType: "video";
    contentId: string;
    instanceId: string;
  };
};

export type onRespondedCatchUpVideoPositionType = {
  type: "respondedCatchUpVideoPosition";
  header: {
    contentType: "video";
    contentId: string;
    instanceId: string;
  };
  data: {
    currentVideoPosition: number;
  };
};

export type onReuploadStartedType = {
  type: "reuploadStarted";
  header: {
    contentType: StaticContentTypes;
    contentId: string;
  };
};

export type onReuploadCancelledType = {
  type: "reuploadCancelled";
  header: {
    contentType: StaticContentTypes;
    contentId: string;
  };
};
