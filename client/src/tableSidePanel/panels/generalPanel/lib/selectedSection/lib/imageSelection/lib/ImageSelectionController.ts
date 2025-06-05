import TableImageMediaInstance, {
  ImageInstanceListenerTypes,
} from "../../../../../../../../media/fgTableImage/TableImageMediaInstance";
import { ImageListenerTypes } from "../../../../../../../..//media/fgTableImage/TableImageMedia";
import { LoadingStateTypes } from "../../../../../../../../../../universal/contentTypeConstant";
import { GroupSignals } from "../../../../../../../../context/signalContext/lib/typeConstant";

class ImageSelectionController {
  constructor(
    private instanceId: string,
    private imageInstanceMedia: TableImageMediaInstance,
    private mirrorCanvasRef: React.RefObject<HTMLCanvasElement>,
    private setLargestDim: React.Dispatch<
      React.SetStateAction<"width" | "height">
    >,
    private setLoadingState: React.Dispatch<
      React.SetStateAction<LoadingStateTypes>
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  drawInstanceCanvas = async () => {
    const mirrorCanvas = this.mirrorCanvasRef.current;
    const sourceCanvas = this.imageInstanceMedia.instanceCanvas;
    if (!mirrorCanvas || !sourceCanvas) return;

    const ctx = mirrorCanvas.getContext("2d");
    if (!ctx) return;

    // Mirror canvas gets scaled dimensions
    const aspectRatio = sourceCanvas.width / sourceCanvas.height;
    let height;
    let width;
    if (sourceCanvas.width > sourceCanvas.height) {
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

    const url = await this.imageInstanceMedia.babylonScene?.getSnapShotURL();
    if (!url) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = url;
  };

  handleInstanceEvents = (event: ImageInstanceListenerTypes) => {
    if (event.type === "effectsChanged") {
      setTimeout(() => {
        this.drawInstanceCanvas();
        this.setRerender((prev) => !prev);
      }, 100);
    }
  };

  handleImageMessages = (event: ImageListenerTypes) => {
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

export default ImageSelectionController;
