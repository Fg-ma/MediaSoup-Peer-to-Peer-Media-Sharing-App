import { VideoListenerTypes } from "../../../../../../../../media/fgTableVideo/TableVideoMedia";
import { LoadingStateTypes } from "../../../../../../../../../../universal/contentTypeConstant";
import { GroupSignals } from "../../../../../../../../context/signalContext/lib/typeConstant";

class VideoSelectionController {
  constructor(
    private instanceId: string,
    private setLoadingState: React.Dispatch<
      React.SetStateAction<LoadingStateTypes>
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  handleVideoMessages = (event: VideoListenerTypes) => {
    switch (event.type) {
      case "downloadComplete":
        this.setLoadingState("downloaded");
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

export default VideoSelectionController;
