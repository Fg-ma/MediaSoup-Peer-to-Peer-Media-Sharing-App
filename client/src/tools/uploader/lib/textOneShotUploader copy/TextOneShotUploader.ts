import * as Y from "yjs";

class TextOneShotUploader {
  constructor() {}

  handleOneShotFileUpload = async (
    file: File,
    metadata: Object,
    baseUrl: string,
  ) => {
    try {
      const text = await file.text();
      const ydoc = new Y.Doc();
      const ytext = ydoc.getText("monaco");

      ytext.insert(0, text);

      const update = Y.encodeStateAsUpdate(ydoc);

      const formData = new FormData();
      formData.append("metadata", JSON.stringify(metadata));
      formData.append(
        "file",
        new Blob([update], { type: "application/octet-stream" }),
      );

      const xhr = new XMLHttpRequest();

      xhr.open("POST", baseUrl + `upload-one-shot-file`, true);

      xhr.send(formData);
    } catch (error) {
      console.error("Error sending metadata:", error);
    }
  };
}

export default TextOneShotUploader;
