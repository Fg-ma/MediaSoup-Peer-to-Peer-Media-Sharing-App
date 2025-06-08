import { GeneralSignals } from "../../../../context/signalContext/lib/typeConstant";

class VideoOneShotUploader {
  constructor(private sendGeneralSignal: (signal: GeneralSignals) => void) {}

  handleOneShotFileUpload = async (
    file: File,
    metadata: Object,
    baseUrl: string,
  ) => {
    try {
      const formData = new FormData();
      formData.append("metadata", JSON.stringify(metadata));
      formData.append("file", file, file.name);

      const xhr = new XMLHttpRequest();

      xhr.open("POST", baseUrl + `upload-one-shot-file`, true);

      xhr.onload = () => {
        if (xhr.status === 413) {
          this.sendGeneralSignal({
            type: "tableInfoSignal",
            data: {
              message: `${file.name} exceeds upload size limit`,
              timeout: 3500,
            },
          });
        }
        if (xhr.status === 409) {
          this.sendGeneralSignal({
            type: "tableInfoSignal",
            data: {
              message: "File already reuploading",
              timeout: 2500,
            },
          });
        }
        return;
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Error sending metadata:", error);
    }
  };
}

export default VideoOneShotUploader;
