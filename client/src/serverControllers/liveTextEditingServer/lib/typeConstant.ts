export type OutGoingLiveTextEditingMessages =
  | onJoinTableType
  | onLeaveTableType
  | onGetInitialDocStateType
  | onDocUpdateType
  | onDocSaveType
  | onGetDownloadMetaType
  | onGetFileChunkType;

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

type onGetInitialDocStateType = {
  type: "getInitialDocState";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentId: string;
    instanceId: string;
  };
};

type onDocUpdateType = {
  type: "docUpdate";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentId: string;
    instanceId: string;
  };
  data: {
    payload: any;
  };
};

type onDocSaveType = {
  type: "docSave";
  header: {
    tableId: string;
    contentId: string;
    instanceId: string;
  };
};

type onGetDownloadMetaType = {
  type: "getDownloadMeta";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentId: string;
  };
};

type onGetFileChunkType = {
  type: "getFileChunk";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentId: string;
  };
  data: {
    idx: number;
  };
};

export type IncomingLiveTextEditingMessages =
  | onDocUpdatedType
  | onDocSavedType
  | onDocSavedNewContentType
  | onInitialDocResponded
  | onChunkType
  | onDownloadFinishedType
  | onChunkErrorType
  | onDownloadMetaType
  | onOneShotDownloadType
  | onDownloadErrorType;

export type onDocUpdatedType = {
  type: "docUpdated";
  header: { contentId: string; instanceId: string };
  data: { payload: Uint8Array<ArrayBuffer> };
};

export type onDocSavedType = {
  type: "docSaved";
  header: { contentId: string; instanceId: string };
};

export type onDocSavedNewContentType = {
  type: "docSavedNewContent";
  header: { oldContentId: string; newContentId: string; instanceId: string };
};

export type onInitialDocResponded = {
  type: "initialDocResponded";
  header: { contentId: string; instanceId: string };
  data: {
    payload: Uint8Array<ArrayBuffer>;
  };
};

export type onChunkType = {
  type: "chunk";
  header: {
    contentId: string;
    idx: number;
  };
  data: {
    payload: Uint8Array<ArrayBuffer>;
  };
};

export type onDownloadFinishedType = {
  type: "downloadFinished";
  header: {
    contentId: string;
  };
};

export type onChunkErrorType = {
  type: "chunkError";
  header: {
    contentId: string;
  };
};

export type onDownloadMetaType = {
  type: "downloadMeta";
  header: {
    contentId: string;
  };
  data: {
    fileSize: number;
  };
};

export type onOneShotDownloadType = {
  type: "oneShotDownload";
  header: {
    contentId: string;
  };
  data: {
    payload: Uint8Array<ArrayBuffer>;
    fileSize: number;
  };
};

export type onDownloadErrorType = {
  type: "downloadError";
  header: { contentId: string };
};
