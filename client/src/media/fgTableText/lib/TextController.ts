import { TextListenerTypes } from "../TableTextMedia";
import { TextInstanceListenerTypes } from "../TableTextMediaInstance";

class TextController {
  constructor(
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  handleTableScroll = () => {
    this.setSettingsActive(false);
  };

  private onDownloadComplete = () => {
    this.setRerender((prev) => !prev);
  };

  handleTextMessages = (event: TextListenerTypes) => {
    switch (event.type) {
      case "downloadComplete":
        this.onDownloadComplete();
        break;
      case "stateChanged":
        this.setRerender((prev) => !prev);
        break;
      case "downloadFailed":
        this.setRerender((prev) => !prev);
        break;
      case "downloadPaused":
        this.setRerender((prev) => !prev);
        break;
      case "downloadResumed":
        this.setRerender((prev) => !prev);
        break;
      case "downloadRetry":
        this.setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  handleTextInstanceMessage = (msg: TextInstanceListenerTypes) => {
    switch (msg.type) {
      case "initialized":
        this.setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };
}

export default TextController;
