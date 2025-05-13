export type DownloadListenerTypes =
  | onDownloadFinishType
  | onDownloadPausedType
  | onDownloadResumedType
  | onDownloadProgressType;

export type onDownloadFinishType = {
  type: "downloadFinish";
  data: { buffer: Uint8Array<ArrayBuffer>; fileSize: number };
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
