export type UploadSignals =
  | onUploadStartType
  | onUploadProgressType
  | onUploadFinishType
  | onUploadErrorType;

export type onUploadStartType = {
  type: "uploadStart";
  header: {
    filename: string;
  };
};

export type onUploadProgressType = {
  type: "uploadProgress";
  header: {
    filename: string;
  };
  data: {
    progress: number;
  };
};

export type onUploadFinishType = {
  type: "uploadFinish";
  header: {
    filename: string;
  };
};

export type onUploadErrorType = {
  type: "uploadError";
  header: {
    filename: string;
  };
};

export type TableUpload = {
  uploadUrl: string;
  mimeType: string;
  size: number;
  filename: string;
};
