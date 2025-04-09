import { TextListenerTypes } from "../TextMedia";
import TextMediaInstance from "../TextMediaInstance";

class TextController {
  constructor(
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private textMediaInstance: TextMediaInstance,
    private text: React.MutableRefObject<string>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  handleTableScroll = () => {
    this.setSettingsActive(false);
  };

  private onDownloadComplete = () => {
    if (this.textMediaInstance.instanceText) {
      this.text.current = this.textMediaInstance.instanceText;
      this.setRerender((prev) => !prev);
    }
  };

  handleTextMessages = (event: TextListenerTypes) => {
    switch (event.type) {
      case "downloadComplete":
        this.onDownloadComplete();
        break;
      case "stateChanged":
        this.setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };
}

export default TextController;
