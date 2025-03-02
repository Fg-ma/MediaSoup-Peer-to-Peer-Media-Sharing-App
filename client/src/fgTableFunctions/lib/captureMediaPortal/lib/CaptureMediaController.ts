import { CameraEffectTypes } from "../../../../context/effectsContext/typeConstant";
import CaptureMedia from "../../../../media/capture/CaptureMedia";
import TableFunctionsController from "../../TableFunctionsController";
import { CaptureMediaTypes } from "./typeConstant";

class CaptureMediaController {
  constructor(
    private captureStreamEffects: React.MutableRefObject<{
      [effectType in CameraEffectTypes]: boolean;
    }>,
    private captureMedia: React.RefObject<CaptureMedia | undefined>,
    private captureContainerRef: React.RefObject<HTMLDivElement>,
    private captureMediaEffectsActive: boolean,
    private setCaptureMediaEffectsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private captureMediaTypeActive: boolean,
    private setCaptureMediaTypeActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private setInCaptureMedia: React.Dispatch<React.SetStateAction<boolean>>,
    private leaveTimer: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private movementTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private tintColor: React.MutableRefObject<string>,
    private mediaType: CaptureMediaTypes,
    private setRecordingCount: React.Dispatch<React.SetStateAction<number>>,
    private recording: boolean,
    private setRecording: React.Dispatch<React.SetStateAction<boolean>>,
    private finalizeCapture: boolean,
    private setFinalizeCapture: React.Dispatch<React.SetStateAction<boolean>>,
    private countDownTimeout: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private countDownInterval: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private shiftPressed: React.MutableRefObject<boolean>,
    private controlPressed: React.MutableRefObject<boolean>,
    private captureMediaPortalRef: React.RefObject<HTMLDivElement>,
    private tableFunctionsController: TableFunctionsController
  ) {}

  handleEffects = () => {
    this.setCaptureMediaEffectsActive((prev) => !prev);

    this.setCaptureMediaTypeActive(false);
  };

  handleCaptureMediaType = () => {
    this.setCaptureMediaTypeActive((prev) => !prev);

    this.setCaptureMediaEffectsActive(false);
  };

  handleCaptureEffect = async (
    effect: CameraEffectTypes,
    blockStateChange: boolean
  ) => {
    if (!blockStateChange) {
      this.captureStreamEffects.current[effect] =
        !this.captureStreamEffects.current[effect];
    }

    this.captureMedia.current?.changeEffects(
      effect,
      this.tintColor.current,
      blockStateChange
    );
  };

  handlePointerMove = () => {
    this.setInCaptureMedia(true);

    if (this.captureContainerRef.current) {
      clearTimeout(this.movementTimeout.current);
      this.movementTimeout.current = undefined;
    }

    this.movementTimeout.current = setTimeout(() => {
      this.setInCaptureMedia(false);
    }, 3500);
  };

  handlePointerEnter = () => {
    this.setInCaptureMedia(true);

    this.captureContainerRef.current?.addEventListener(
      "pointermove",
      this.handlePointerMove
    );

    if (this.leaveTimer.current) {
      clearTimeout(this.leaveTimer.current);
      this.leaveTimer.current = undefined;
    }
  };

  handlePointerLeave = () => {
    this.captureContainerRef.current?.removeEventListener(
      "pointermove",
      this.handlePointerMove
    );

    if (this.captureContainerRef.current) {
      clearTimeout(this.movementTimeout.current);
      this.movementTimeout.current = undefined;
    }

    this.leaveTimer.current = setTimeout(() => {
      this.setInCaptureMedia(false);
      clearTimeout(this.leaveTimer.current);
      this.leaveTimer.current = undefined;
    }, 1250);
  };

  handleCapture = () => {
    if (
      this.mediaType === "10s" ||
      this.mediaType === "15s" ||
      this.mediaType === "30s" ||
      this.mediaType === "60s"
    ) {
      if (!this.recording) {
        if (this.mediaType === "10s") {
          this.setRecordingCount(10);
        } else if (this.mediaType === "15s") {
          this.setRecordingCount(15);
        } else if (this.mediaType === "30s") {
          this.setRecordingCount(30);
        } else if (this.mediaType === "60s") {
          this.setRecordingCount(60);
        }

        this.countDownInterval.current = setInterval(() => {
          this.setRecordingCount((prev) => Math.max(0, prev - 1));
        }, 1000);
        this.countDownTimeout.current = setTimeout(
          () => {
            this.setRecording(false);

            clearInterval(this.countDownInterval.current);
            this.countDownInterval.current = undefined;
            clearTimeout(this.countDownTimeout.current);
            this.countDownTimeout.current = undefined;

            if (this.mediaType === "10s") {
              this.setRecordingCount(10);
            } else if (this.mediaType === "15s") {
              this.setRecordingCount(15);
            } else if (this.mediaType === "30s") {
              this.setRecordingCount(30);
            } else if (this.mediaType === "60s") {
              this.setRecordingCount(60);
            }
          },
          this.mediaType === "60s"
            ? 60000
            : this.mediaType === "30s"
            ? 30000
            : this.mediaType === "15s"
            ? 15000
            : this.mediaType === "10s"
            ? 10000
            : 0
        );
      } else {
        clearInterval(this.countDownInterval.current);
        this.countDownInterval.current = undefined;
        clearTimeout(this.countDownTimeout.current);
        this.countDownTimeout.current = undefined;

        if (this.mediaType === "10s") {
          this.setRecordingCount(10);
        } else if (this.mediaType === "15s") {
          this.setRecordingCount(15);
        } else if (this.mediaType === "30s") {
          this.setRecordingCount(30);
        } else if (this.mediaType === "60s") {
          this.setRecordingCount(60);
        }
      }

      this.setRecording((prev) => !prev);
    } else if (this.mediaType === "camera") {
      clearInterval(this.countDownInterval.current);
      this.countDownInterval.current = undefined;
      clearTimeout(this.countDownTimeout.current);
      this.countDownTimeout.current = undefined;

      this.setRecordingCount(0);

      this.setRecording(true);

      this.captureMedia.current?.babylonScene?.takeSnapShot();

      this.countDownTimeout.current = setTimeout(() => {
        this.setRecording(false);

        clearInterval(this.countDownInterval.current);
        this.countDownInterval.current = undefined;
        clearTimeout(this.countDownTimeout.current);
        this.countDownTimeout.current = undefined;

        this.setRecordingCount(0);
      }, 150);

      this.setFinalizeCapture(true);

      this.captureMedia.current?.babylonScene?.addScreenShotSuccessCallback(
        this.addScreenShotSuccessCallback
      );
    } else if (this.mediaType === "video") {
      clearInterval(this.countDownInterval.current);
      this.countDownInterval.current = undefined;
      clearTimeout(this.countDownTimeout.current);
      this.countDownTimeout.current = undefined;

      this.setRecordingCount(0);

      if (!this.recording) {
        this.captureMedia.current?.babylonScene?.startRecording(
          "video/webm; codecs=vp9",
          30
        );
      } else {
        this.captureMedia.current?.babylonScene?.stopRecording();
      }

      this.setRecording((prev) => !prev);
    }
  };

  confirmCapture = () => {};

  downloadCapture = () => {};

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      !this.captureMediaPortalRef.current?.classList.contains(
        "in-capture-media"
      ) ||
      this.controlPressed.current ||
      this.shiftPressed.current
    ) {
      return;
    }

    const tagName = document.activeElement?.tagName.toLowerCase();
    if (tagName === "input") return;

    switch (event.key.toLowerCase()) {
      case "shift":
        this.shiftPressed.current = true;
        break;
      case "control":
        this.controlPressed.current = true;
        break;
      case "e":
        this.handleEffects();
        break;
      case "h":
        this.handleCaptureMediaType();
        break;
      case "k":
        this.handleCapture();
        break;
      case " ":
        this.handleCapture();
        break;
      case "x":
        if (this.finalizeCapture) {
          this.handleExitFinialization();
        } else {
          this.tableFunctionsController.stopVideo();
        }
        break;
      default:
        break;
    }
  };

  handleKeyUp = (event: KeyboardEvent) => {
    if (!event.key) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case "shift":
        this.shiftPressed.current = false;
        break;
      case "control":
        this.controlPressed.current = false;
        break;
    }
  };

  handleExitFinialization = () => {
    this.setFinalizeCapture(false);
  };

  private addScreenShotSuccessCallback = () => {
    this.captureMedia.current?.stopVideo();

    this.captureMedia.current?.babylonScene?.removeScreenShotSuccessCallback(
      this.addScreenShotSuccessCallback
    );
  };
}

export default CaptureMediaController;
