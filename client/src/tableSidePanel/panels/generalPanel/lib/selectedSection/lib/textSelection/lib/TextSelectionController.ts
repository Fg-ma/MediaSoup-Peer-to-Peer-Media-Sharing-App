import { TextListenerTypes } from "../../../../../../../../media/fgTableText/TableTextMedia";
import { LoadingStateTypes } from "../../../../../../../../../../universal/contentTypeConstant";
import { GroupSignals } from "../../../../../../../../context/signalContext/lib/typeConstant";

class TextSelectionController {
  constructor(
    private instanceId: string,
    private setLoadingState: React.Dispatch<
      React.SetStateAction<LoadingStateTypes>
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
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

  handleGroupSignal = (signal: GroupSignals) => {
    if (signal.type === "groupElementMove") {
      const { instanceId: incomingInstanceId } = signal.data;
      if (incomingInstanceId === this.instanceId) {
        this.setRerender((prev) => !prev);
      }
    } else if (signal.type === "groupDrag") {
      this.setRerender((prev) => !prev);
    }
  };
}

export default TextSelectionController;
