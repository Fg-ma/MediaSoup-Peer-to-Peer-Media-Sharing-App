class OneShotUploader {
  constructor() {}

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

      xhr.send(formData);
    } catch (error) {
      console.error("Error sending metadata:", error);
    }
  };
}

export default OneShotUploader;
