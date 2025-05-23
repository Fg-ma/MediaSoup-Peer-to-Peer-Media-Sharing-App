import { VideoListenerTypes } from "../../../../../../../../media/fgTableVideo/TableVideoMedia";
import { LoadingStateTypes } from "../../../../../../../../../../universal/contentTypeConstant";
import TableVideoMediaInstance from "../../../../../../../../media/fgTableVideo/TableVideoMediaInstance";
import { GroupSignals } from "../../../../../../../../context/signalContext/lib/typeConstant";

class VideoSelectionController {
  constructor(
    private instanceId: string,
    private videoInstanceMedia: TableVideoMediaInstance,
    private setLoadingState: React.Dispatch<
      React.SetStateAction<LoadingStateTypes>
    >,
    private setLargestDim: React.Dispatch<
      React.SetStateAction<"width" | "height">
    >,
    private mirrorCanvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  drawInstanceCanvas = async () => {
    const mirrorCanvas = this.mirrorCanvasRef.current;
    const video = this.videoInstanceMedia.videoMedia.video;
    if (!mirrorCanvas || !video) return;

    const ctx = mirrorCanvas.getContext("2d");
    if (!ctx) return;

    // Mirror canvas gets scaled dimensions
    const aspectRatio = video.videoWidth / video.videoHeight;
    let height: number;
    let width: number;
    if (video.videoWidth > video.videoHeight) {
      width = 192;
      height = width / aspectRatio;
      this.setLargestDim("width");
    } else {
      height = 192;
      width = height * aspectRatio;
      this.setLargestDim("height");
    }
    mirrorCanvas.width = width;
    mirrorCanvas.height = height;

    await new Promise((res, rej) => {
      if (video.readyState >= 1) {
        res(null);
      } else {
        video.onloadedmetadata = () => res(null);
        video.onerror = rej;
      }
    });
    video.currentTime = 0;
    await new Promise((res, rej) => {
      video.onseeked = res;
      video.onerror = rej;
    });

    ctx.drawImage(video, 0, 0, width, height);
  };

  handleVideoMessages = (event: VideoListenerTypes) => {
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

export default VideoSelectionController;
