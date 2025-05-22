import CameraMedia from "../../../../../../../../media/fgVisualMedia/CameraMedia";
import { GroupSignals } from "../../../../../../../../context/signalContext/lib/typeConstant";
import ScreenMedia from "../../../../../../../../media/fgVisualMedia/ScreenMedia";

class VisualMediaSelectionController {
  constructor(
    private instanceId: string,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private visualMedia:
      | CameraMedia
      | ScreenMedia
      | MediaStreamTrack
      | undefined,
    private mirrorVideoRef: React.MutableRefObject<HTMLVideoElement | null>,
    private mirrorCanvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
    private largestDim: React.MutableRefObject<"width" | "height" | undefined>,
  ) {}

  updateMirrors = () => {
    const canvas = this.mirrorCanvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (
      !ctx ||
      !(
        this.visualMedia instanceof CameraMedia ||
        this.visualMedia instanceof ScreenMedia
      )
    )
      return;

    const src = this.visualMedia.canvas;

    ctx.clearRect(
      0,
      0,
      this.largestDim.current === "width"
        ? 184
        : 192 * (this.visualMedia.aspectRatio ?? 1),
      this.largestDim.current === "width"
        ? 184 / (this.visualMedia.aspectRatio ?? 1)
        : 192,
    );
    ctx.drawImage(
      src,
      0,
      0,
      this.largestDim.current === "width"
        ? 184
        : 192 * (this.visualMedia.aspectRatio ?? 1),
      this.largestDim.current === "width"
        ? 184 / (this.visualMedia.aspectRatio ?? 1)
        : 192,
    );

    requestAnimationFrame(this.updateMirrors);
  };

  private onMeta = () => {
    this.mirrorVideoRef.current?.removeEventListener(
      "loadedmetadata",
      this.onMeta,
    );

    if (!this.mirrorVideoRef.current) return;

    this.largestDim.current =
      this.mirrorVideoRef.current.videoWidth >
      this.mirrorVideoRef.current.videoHeight
        ? "width"
        : "height";

    this.setRerender((prev) => !prev);
  };

  handleStream = async () => {
    if (
      !this.mirrorVideoRef.current ||
      !this.visualMedia ||
      !(this.visualMedia instanceof MediaStreamTrack)
    )
      return;

    const stream = new MediaStream([this.visualMedia]);
    this.mirrorVideoRef.current.srcObject = stream;
    this.mirrorVideoRef.current.srcObject = stream;
    this.mirrorVideoRef.current.playsInline = true;
    this.mirrorVideoRef.current.muted = true;
    this.mirrorVideoRef.current.autoplay = true;

    this.mirrorVideoRef.current.addEventListener("loadedmetadata", this.onMeta);
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

export default VisualMediaSelectionController;
