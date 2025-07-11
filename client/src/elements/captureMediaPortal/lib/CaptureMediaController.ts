import {
  CameraEffectTypes,
  CaptureEffectTypes,
} from "../../../../../universal/effectsTypeConstant";
import CaptureMedia from "../../../media/capture/CaptureMedia";
import TableFunctionsController from "../../../tableFunctions/lib/TableFunctionsController";
import {
  CaptureMediaTypes,
  downloadImageMimeMap,
  downloadRecordingExtensionsMap,
  downloadRecordingMimeMap,
  Settings,
} from "./typeConstant";
import Uploader from "../../../tools/uploader/Uploader";

class CaptureMediaController {
  constructor(
    private captureEffects: React.MutableRefObject<{
      [effectType in CameraEffectTypes]: boolean;
    }>,
    private captureMedia: React.MutableRefObject<CaptureMedia | undefined>,
    private captureContainerRef: React.RefObject<HTMLDivElement>,
    private setCaptureMediaEffectsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private setCaptureMediaTypeActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private setInCaptureMedia: React.Dispatch<React.SetStateAction<boolean>>,
    private leaveTimer: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private movementTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private tintColor: React.MutableRefObject<string>,
    private mediaType: React.MutableRefObject<CaptureMediaTypes>,
    private setRecordingCount: React.Dispatch<React.SetStateAction<number>>,
    private recording: React.MutableRefObject<boolean>,
    private setFinalizeCapture: React.Dispatch<React.SetStateAction<boolean>>,
    private countDownTimeout: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private countDownInterval: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private captureMediaPortalRef: React.RefObject<HTMLDivElement>,
    private tableFunctionsController: React.MutableRefObject<TableFunctionsController>,
    private finalizingCapture: React.MutableRefObject<boolean>,
    private finalizedCaptureType: React.MutableRefObject<
      "video" | "image" | undefined
    >,
    private videoRef: React.RefObject<HTMLVideoElement>,
    private imageRef: React.RefObject<HTMLImageElement>,
    private settings: Settings,
    private timelineContainerRef: React.RefObject<HTMLDivElement>,
    private isScrubbing: React.MutableRefObject<boolean>,
    private wasPaused: React.MutableRefObject<boolean>,
    private setCaptureMediaActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private setDelayCountDown: React.Dispatch<React.SetStateAction<number>>,
    private delayTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private delayCountDownInterval: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private delaying: React.MutableRefObject<boolean>,
    private uploader: React.MutableRefObject<Uploader | undefined>,
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
    effect: CaptureEffectTypes | "clearAll",
    blockStateChange: boolean,
  ) => {
    if (effect !== "clearAll") {
      if (!blockStateChange) {
        this.captureEffects.current[effect] =
          !this.captureEffects.current[effect];
      }

      this.captureMedia.current?.changeEffects(
        effect,
        this.tintColor.current,
        blockStateChange,
      );
    } else {
      this.captureMedia.current?.clearAllEffects();
    }
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
      this.handlePointerMove,
    );

    if (this.leaveTimer.current) {
      clearTimeout(this.leaveTimer.current);
      this.leaveTimer.current = undefined;
    }
  };

  handlePointerLeave = () => {
    this.captureContainerRef.current?.removeEventListener(
      "pointermove",
      this.handlePointerMove,
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

  private cameraCapture = () => {
    clearInterval(this.countDownInterval.current);
    this.countDownInterval.current = undefined;
    clearTimeout(this.countDownTimeout.current);
    this.countDownTimeout.current = undefined;

    this.recording.current = true;

    this.setRecordingCount(0);

    this.captureMedia.current?.babylonScene?.takeSnapShot(
      downloadImageMimeMap[this.settings.downloadImageOptions.mimeType.value],
      this.settings.downloadImageOptions.quality.value,
    );

    this.countDownTimeout.current = setTimeout(() => {
      this.recording.current = false;

      clearInterval(this.countDownInterval.current);
      this.countDownInterval.current = undefined;
      clearTimeout(this.countDownTimeout.current);
      this.countDownTimeout.current = undefined;

      this.setRecordingCount(0);
    }, 150);

    this.setFinalizeCapture(true);
    this.finalizingCapture.current = true;
    this.finalizedCaptureType.current = "image";

    this.captureMedia.current?.babylonScene?.addScreenShotSuccessCallback(
      this.addScreenShotSuccessCallback,
    );
  };

  private startTimedVideoCapture = () => {
    this.captureMedia.current?.babylonScene?.startRecording(
      downloadRecordingMimeMap[
        this.settings.downloadVideoOptions.mimeType.value
      ],
      parseInt(this.settings.downloadVideoOptions.fps.value.slice(0, -4)),
      this.settings.downloadVideoOptions.bitRate.value !== "default"
        ? this.settings.downloadVideoOptions.bitRate.value * 1000000
        : this.settings.downloadVideoOptions.bitRate.value,
    );

    if (this.mediaType.current === "10s") {
      this.setRecordingCount(10);
    } else if (this.mediaType.current === "15s") {
      this.setRecordingCount(15);
    } else if (this.mediaType.current === "30s") {
      this.setRecordingCount(30);
    } else if (this.mediaType.current === "60s") {
      this.setRecordingCount(60);
    }

    this.countDownInterval.current = setInterval(() => {
      this.setRecordingCount((prev) => Math.max(0, prev - 1));
    }, 1000);
    this.countDownTimeout.current = setTimeout(
      () => {
        this.captureMedia.current?.babylonScene?.stopRecording();

        this.recording.current = false;

        this.setRerender((prev) => !prev);

        clearInterval(this.countDownInterval.current);
        this.countDownInterval.current = undefined;
        clearTimeout(this.countDownTimeout.current);
        this.countDownTimeout.current = undefined;

        if (this.mediaType.current === "10s") {
          this.setRecordingCount(10);
        } else if (this.mediaType.current === "15s") {
          this.setRecordingCount(15);
        } else if (this.mediaType.current === "30s") {
          this.setRecordingCount(30);
        } else if (this.mediaType.current === "60s") {
          this.setRecordingCount(60);
        }

        this.captureMedia.current?.babylonScene?.addVideoSuccessCallback(
          this.addVideoSuccessCallback,
        );
      },
      this.mediaType.current === "60s"
        ? 60000
        : this.mediaType.current === "30s"
          ? 30000
          : this.mediaType.current === "15s"
            ? 15000
            : this.mediaType.current === "10s"
              ? 10000
              : 0,
    );
  };

  private startVideoCapture = () => {
    this.setRecordingCount(1);

    this.countDownInterval.current = setInterval(() => {
      this.setRecordingCount((prev) => prev + 1);
    }, 1000);

    this.captureMedia.current?.babylonScene?.startRecording(
      downloadRecordingMimeMap[
        this.settings.downloadVideoOptions.mimeType.value
      ],
      parseInt(this.settings.downloadVideoOptions.fps.value.slice(0, -4)),
    );
  };

  private setDelay = (delayedFunction: () => void) => {
    this.delaying.current = true;
    this.setDelayCountDown(this.settings.delay.value);

    this.delayTimeout.current = setTimeout(() => {
      this.delaying.current = false;
      delayedFunction();

      clearTimeout(this.delayTimeout.current);
      this.delayTimeout.current = undefined;
      clearInterval(this.delayCountDownInterval.current);
      this.delayCountDownInterval.current = undefined;
    }, this.settings.delay.value * 1000);
    this.delayCountDownInterval.current = setInterval(() => {
      this.setDelayCountDown((prev) => Math.max(0, prev - 1));
    }, 1000);
  };

  clearDelay = () => {
    this.delaying.current = false;

    clearTimeout(this.delayTimeout.current);
    this.delayTimeout.current = undefined;
    clearInterval(this.delayCountDownInterval.current);
    this.delayCountDownInterval.current = undefined;

    this.recording.current = false;
    this.setRerender((prev) => !prev);
  };

  handleCapture = () => {
    this.setCaptureMediaTypeActive(false);

    if (
      this.mediaType.current === "10s" ||
      this.mediaType.current === "15s" ||
      this.mediaType.current === "30s" ||
      this.mediaType.current === "60s"
    ) {
      if (!this.recording.current) {
        if (this.settings.delay.value !== 0) {
          this.setDelay(this.startTimedVideoCapture);
        } else {
          this.startTimedVideoCapture();
        }
      } else {
        this.captureMedia.current?.babylonScene?.stopRecording();

        clearInterval(this.countDownInterval.current);
        this.countDownInterval.current = undefined;
        clearTimeout(this.countDownTimeout.current);
        this.countDownTimeout.current = undefined;

        if (this.mediaType.current === "10s") {
          this.setRecordingCount(10);
        } else if (this.mediaType.current === "15s") {
          this.setRecordingCount(15);
        } else if (this.mediaType.current === "30s") {
          this.setRecordingCount(30);
        } else if (this.mediaType.current === "60s") {
          this.setRecordingCount(60);
        }

        this.captureMedia.current?.babylonScene?.addVideoSuccessCallback(
          this.addVideoSuccessCallback,
        );
      }

      this.recording.current = !this.recording.current;
      this.setRerender((prev) => !prev);
    } else if (this.mediaType.current === "camera") {
      if (this.settings.delay.value !== 0) {
        this.setDelay(this.cameraCapture);
      } else {
        this.cameraCapture();
      }
    } else if (this.mediaType.current === "video") {
      if (!this.recording.current) {
        if (this.settings.delay.value !== 0) {
          this.setDelay(this.startVideoCapture);
        } else {
          this.startVideoCapture();
        }
      } else {
        this.captureMedia.current?.babylonScene?.stopRecording();

        clearInterval(this.countDownInterval.current);
        this.countDownInterval.current = undefined;

        this.captureMedia.current?.babylonScene?.addVideoSuccessCallback(
          this.addVideoSuccessCallback,
        );
      }

      this.recording.current = !this.recording.current;
      this.setRerender((prev) => !prev);
    }
  };

  confirmCapture = async () => {
    let file: File | undefined = undefined;

    if (this.videoRef.current && this.videoRef.current.src) {
      const response = await fetch(this.videoRef.current.src);
      const blob = await response.blob();
      const filename = `video.${
        downloadRecordingExtensionsMap[
          this.settings.downloadVideoOptions.mimeType.value
        ]
      }`;
      file = new File([blob], filename, {
        type: downloadRecordingMimeMap[
          this.settings.downloadVideoOptions.mimeType.value
        ],
      });
    } else if (this.imageRef.current && this.imageRef.current.src) {
      const response = await fetch(this.imageRef.current.src);
      const blob = await response.blob();
      const filename = `image.${this.settings.downloadImageOptions.mimeType.value}`;
      file = new File([blob], filename, {
        type: downloadImageMimeMap[
          this.settings.downloadImageOptions.mimeType.value
        ],
      });
    }

    if (!file) return;

    this.uploader.current?.uploadToTable(file);

    this.setFinalizeCapture(false);
    this.finalizingCapture.current = false;

    this.captureMedia.current?.deconstructor();
    this.captureMedia.current = undefined;
    this.setCaptureMediaActive(false);
  };

  downloadCapture = () => {
    if (this.finalizedCaptureType.current === "image") {
      const url =
        this.captureMedia.current?.babylonScene?.downloadSnapShotLink();

      if (!url) return;

      const link = document.createElement("a");
      link.href = url;
      link.download = `snapshot.${this.settings.downloadImageOptions.mimeType.value}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (this.finalizedCaptureType.current === "video") {
      this.captureMedia.current?.babylonScene?.downloadRecording();
    }
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      !this.captureMediaPortalRef.current?.classList.contains(
        "in-capture-media",
      ) ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    const tagName = document.activeElement?.tagName.toLowerCase();
    if (tagName === "input" || tagName === "textarea") return;

    switch (event.key.toLowerCase()) {
      case "e":
        this.handleEffects();
        break;
      case "h":
        this.handleCaptureMediaType();
        break;
      case "k":
        if (this.finalizingCapture.current) {
          this.handlePausePlay();
        } else {
          this.handleCapture();
        }
        break;
      case " ":
        if (this.finalizingCapture.current) {
          this.handlePausePlay();
        } else {
          this.handleCapture();
        }
        break;
      case "x":
        if (this.delaying.current) {
          this.clearDelay();
        } else if (this.finalizingCapture.current) {
          this.handleExitFinialization();
        } else {
          this.tableFunctionsController.current.stopVideo();
        }
        break;
      default:
        break;
    }
  };

  handlePausePlay = () => {
    if (!this.videoRef.current) return;

    if (this.videoRef.current.paused) {
      this.videoRef.current.play();
    } else {
      this.videoRef.current.pause();
    }
  };

  handleExitFinialization = () => {
    this.setFinalizeCapture(false);
    this.finalizingCapture.current = false;
  };

  private addScreenShotSuccessCallback = () => {
    this.setRerender((prev) => !prev);

    this.captureMedia.current?.stopVideo();

    this.captureMedia.current?.babylonScene?.removeScreenShotSuccessCallback(
      this.addScreenShotSuccessCallback,
    );
  };

  private addVideoSuccessCallback = () => {
    this.setFinalizeCapture(true);
    this.finalizingCapture.current = true;
    this.finalizedCaptureType.current = "video";

    this.captureMedia.current?.stopVideo();

    this.captureMedia.current?.babylonScene?.removeVideoSuccessCallback(
      this.addVideoSuccessCallback,
    );
  };

  handlePlaybackSpeed = (playbackSpeed: number) => {
    if (this.videoRef.current)
      this.videoRef.current.playbackRate = playbackSpeed;
  };

  timeUpdate = () => {
    if (!this.videoRef.current) return;

    const currentTime = this.videoRef.current.currentTime;

    const percent =
      currentTime /
      (isFinite(this.videoRef.current.duration)
        ? this.videoRef.current.duration
        : 1);

    this.timelineContainerRef.current?.style.setProperty(
      "--progress-position",
      `${percent}`,
    );
  };

  handleStartScrubbing = (event: React.PointerEvent) => {
    if (
      !this.timelineContainerRef.current ||
      !this.videoRef.current ||
      this.isScrubbing.current
    )
      return;

    document.addEventListener(
      "pointermove",
      this.handleScrubbingTimelineUpdate,
    );
    document.addEventListener("pointerup", this.handleStopScrubbing);

    this.isScrubbing.current = true;
    if (this.isScrubbing.current) {
      this.captureMediaPortalRef.current?.classList.add("scrubbing");
      this.wasPaused.current = this.videoRef.current.paused;
      this.videoRef.current.pause();
    }

    this.handleScrubbingTimelineUpdate(event as unknown as PointerEvent);
  };

  handleStopScrubbing = (event: PointerEvent) => {
    if (!this.timelineContainerRef.current || !this.videoRef.current) return;

    document.removeEventListener(
      "pointermove",
      this.handleScrubbingTimelineUpdate,
    );
    document.removeEventListener("pointerup", this.handleStopScrubbing);

    const rect = this.timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, event.clientX - rect.x), rect.width) / rect.width;

    this.isScrubbing.current = false;

    this.captureMediaPortalRef.current?.classList.remove("scrubbing");
    this.videoRef.current.currentTime =
      percent * this.videoRef.current.duration;

    if (!this.wasPaused.current) {
      this.videoRef.current.play();
    }

    this.handleScrubbingTimelineUpdate(event);
  };

  handleScrubbingTimelineUpdate = (event: PointerEvent) => {
    if (!this.timelineContainerRef.current) return;

    const rect = this.timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, event.clientX - rect.x), rect.width) / rect.width;
    this.timelineContainerRef.current.style.setProperty(
      "--preview-position",
      `${percent}`,
    );

    if (this.isScrubbing.current) {
      this.timelineContainerRef.current.style.setProperty(
        "--progress-position",
        `${percent}`,
      );
    }
  };

  handleHoverTimelineUpdate = (event: React.PointerEvent) => {
    if (!this.timelineContainerRef.current) return;

    const rect = this.timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, event.clientX - rect.x), rect.width) / rect.width;
    this.timelineContainerRef.current.style.setProperty(
      "--preview-position",
      `${percent}`,
    );
  };
}

export default CaptureMediaController;
