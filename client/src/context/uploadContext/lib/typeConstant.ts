export type UploadSignals = onUploadStartType | onUploadFinishType;

export type onUploadStartType = {
  type: "uploadStart";
};

export type onUploadFinishType = {
  type: "uploadFinish";
};
