export type DownloadListenerTypes =
  | onDownloadFinishType
  | onDownloadPausedType
  | onDownloadResumedType
  | onDownloadProgressType
  | onDownloadFailedrType
  | onInitializedType;

export type onDownloadFinishType = {
  type: "downloadFinish";
  data: { payload: Uint8Array<ArrayBuffer>[]; fileSize: number };
};

export type onDownloadPausedType = {
  type: "downloadPaused";
};

export type onInitializedType = {
  type: "initialized";
  data: { payload: Uint8Array<ArrayBuffer>[] };
};

export type onDownloadResumedType = {
  type: "downloadResumed";
};

export type onDownloadProgressType = {
  type: "downloadProgress";
};

export type onDownloadFailedrType = {
  type: "downloadFailed";
};
