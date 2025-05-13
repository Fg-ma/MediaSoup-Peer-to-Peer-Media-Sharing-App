export type UploadSignals = onUploadStartType | onUploadFinishType;

export type onUploadStartType = {
  type: "uploadStart";
};

export type onUploadFinishType = {
  type: "uploadFinish";
};

export type DownloadSignals =
  | onDownloadStartType
  | onDownloadFinishType
  | onDownloadErrorType
  | onDownloadCancelType;

export type onDownloadStartType = {
  type: "downloadStart";
};

export type onDownloadFinishType = {
  type: "downloadFinish";
};

export type onDownloadErrorType = {
  type: "downloadError";
};

export type onDownloadCancelType = {
  type: "downloadCancel";
};
