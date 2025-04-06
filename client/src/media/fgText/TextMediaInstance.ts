import TextMedia from "./TextMedia";

class TextMediaInstance {
  instanceText: undefined | string;

  constructor(
    public textMedia: TextMedia,
    public textInstanceId: string,
    public initPositioning: {
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    }
  ) {
    if (this.textMedia.text) {
      this.instanceText = this.textMedia.text;
    }
    this.textMedia.addDownloadCompleteListener(() => {
      this.instanceText = this.textMedia.text;
    });
  }

  deconstructor = () => {};
}

export default TextMediaInstance;
