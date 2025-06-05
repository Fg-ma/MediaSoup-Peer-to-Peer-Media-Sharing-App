import { SvgListenerTypes } from "../../../../../../../../media/fgTableSvg/TableSvgMedia";
import { LoadingStateTypes } from "../../../../../../../../../../universal/contentTypeConstant";
import TableSvgMediaInstance, {
  SvgInstanceListenerTypes,
} from "../../../../../../../../media/fgTableSvg/TableSvgMediaInstance";
import { GroupSignals } from "../../../../../../../../context/signalContext/lib/typeConstant";

class SvgSelectionController {
  constructor(
    private instanceId: string,
    private svgInstanceMedia: TableSvgMediaInstance,
    private svgContainerRef: React.RefObject<HTMLDivElement>,
    private setLoadingState: React.Dispatch<
      React.SetStateAction<LoadingStateTypes>
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  handleInstanceEvents = (event: SvgInstanceListenerTypes) => {
    if (
      event.type === "effectsChanged" &&
      this.svgInstanceMedia.svgMedia.fileSize < 1024 * 1024 * 20 &&
      this.svgInstanceMedia.instanceSvg
    ) {
      this.svgContainerRef.current?.removeChild(
        this.svgContainerRef.current.getElementsByTagName("svg")[0],
      );
      this.svgContainerRef.current?.appendChild(
        this.svgInstanceMedia.instanceSvg.cloneNode(true)!,
      );
      this.setRerender((prev) => !prev);
    }
  };

  handleSvgMessages = (event: SvgListenerTypes) => {
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

export default SvgSelectionController;
