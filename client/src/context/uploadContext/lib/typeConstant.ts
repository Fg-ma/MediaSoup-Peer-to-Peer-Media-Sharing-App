export type UploadSignals =
  | onUploadStartType
  | onUploadProgressType
  | onUploadFinishType
  | onUploadErrorType;

export type onUploadStartType = {
  type: "uploadStart";
  header: {
    contentId: string;
  };
};

export type onUploadProgressType = {
  type: "uploadProgress";
  header: {
    contentId: string;
  };
  data: {
    progress: number;
  };
};

export type onUploadFinishType = {
  type: "uploadFinish";
  header: {
    contentId: string;
  };
};

export type onUploadErrorType = {
  type: "uploadError";
  header: {
    contentId: string;
  };
};

export type TableUpload = {
  uploadUrl: string;
  mimeType: string;
  size: number;
  filename: string;
  progress: number;
  paused: boolean;
};
