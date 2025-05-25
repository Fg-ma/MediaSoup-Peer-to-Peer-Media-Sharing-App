export type DownloadListenerTypes =
  | onDownloadFinishType
  | onDownloadPausedType
  | onDownloadResumedType
  | onDownloadProgressType
  | onDownloadFailedrType;

export type onDownloadFinishType = {
  type: "downloadFinish";
  data: { payload: Uint8Array<ArrayBuffer>[]; fileSize: number };
};

export type onDownloadPausedType = {
  type: "downloadPaused";
};

export type onDownloadResumedType = {
  type: "downloadResumed";
};

export type onDownloadProgressType = {
  type: "downloadProgress";
  data: Uint8Array<ArrayBuffer>;
};

export type onDownloadFailedrType = {
  type: "downloadFailed";
};
