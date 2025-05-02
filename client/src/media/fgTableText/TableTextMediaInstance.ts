import TableTextMedia, { TextListenerTypes } from "./TableTextMedia";

class TableTextMediaInstance {
  instanceText: undefined | string;

  constructor(
    public textMedia: TableTextMedia,
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
    },
  ) {
    if (this.textMedia.text) {
      this.instanceText = this.textMedia.text;
    }
    this.textMedia.addTextListener(this.handleTextMessages);
  }

  deconstructor = () => {
    this.textMedia.removeTextListener(this.handleTextMessages);
  };

  private handleTextMessages = (event: TextListenerTypes) => {
    switch (event.type) {
      case "downloadComplete":
        this.onDownloadComplete();
        break;
      default:
        break;
    }
  };

  private onDownloadComplete = () => {
    this.instanceText = this.textMedia.text;
  };
}

export default TableTextMediaInstance;
