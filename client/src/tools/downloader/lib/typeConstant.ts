export type DownloadListenerTypes =
  | onDownloadFinishType
  | onDownloadPausedType
  | onDownloadResumedType
  | onDownloadProgressType
  | onDownloadFailedrType;

export type onDownloadFinishType = {
  type: "downloadFinish";
  data: { blob: Blob; fileSize: number };
};

export type onDownloadPausedType = {
  type: "downloadPaused";
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
