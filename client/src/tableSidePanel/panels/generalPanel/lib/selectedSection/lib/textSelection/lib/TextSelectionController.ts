import { TextListenerTypes } from "../../../../../../../../media/fgTableText/TableTextMedia";
import { LoadingStateTypes } from "../../../../../../../../../../universal/contentTypeConstant";

class TextSelectionController {
  constructor(
    private setLoadingState: React.Dispatch<
      React.SetStateAction<LoadingStateTypes>
    >,
  ) {}

  handleTextMessages = (event: TextListenerTypes) => {
    switch (event.type) {
      case "downloadComplete":
        this.setLoadingState("downloaded");
        break;
      case "downloadFailed":
        this.setLoadingState("failed");
        break;
      case "downloadPaused":
        this.setLoadingState("paused");
        break;
      case "downloadResumed":
        this.setLoadingState("downloading");
        break;
      case "downloadRetry":
        this.setLoadingState("downloading");
        break;
      default:
        break;
    }
  };
}

export default TextSelectionController;
