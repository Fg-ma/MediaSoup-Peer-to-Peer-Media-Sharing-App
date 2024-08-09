import {
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../context/StreamsContext";
import { defaultFgVideoOptions, FgVideoOptions } from "../FgVideo";
import Controls from "src/fgVideoControls/lib/Controls";

class FgVideoController {
  private videoId: string;
  private type: "camera" | "screen";

  private controls: Controls;

  private videoStream: MediaStream | undefined;

  private videoRef: React.RefObject<HTMLVideoElement>;
  private videoContainerRef: React.RefObject<HTMLDivElement>;
  private audioRef: React.RefObject<HTMLAudioElement>;
  private captions: React.MutableRefObject<TextTrack | undefined>;
  private timelineContainerRef: React.RefObject<HTMLDivElement>;
  private currentTimeRef: React.RefObject<HTMLDivElement>;

  private fgVideoOptions: FgVideoOptions;
  private handleEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;

  constructor(
    videoId: string,
    type: "camera" | "screen",
    controls: Controls,
    videoStream: MediaStream | undefined,
    videoRef: React.RefObject<HTMLVideoElement>,
    videoContainerRef: React.RefObject<HTMLDivElement>,
    audioRef: React.RefObject<HTMLAudioElement>,
    captions: React.MutableRefObject<TextTrack | undefined>,
    timelineContainerRef: React.RefObject<HTMLDivElement>,
    currentTimeRef: React.RefObject<HTMLDivElement>,
    fgVideoOptions: FgVideoOptions,
    handleEffectChange: (
      effect: CameraEffectTypes | ScreenEffectTypes,
      blockStateChange?: boolean
    ) => Promise<void>
  ) {
    this.videoId = videoId;
    this.type = type;
    this.controls = controls;
    this.videoStream = videoStream;
    this.videoRef = videoRef;
    this.videoContainerRef = videoContainerRef;
    this.audioRef = audioRef;
    this.captions = captions;
    this.timelineContainerRef = timelineContainerRef;
    this.currentTimeRef = currentTimeRef;
    this.fgVideoOptions = fgVideoOptions;
    this.handleEffectChange = handleEffectChange;
  }

  init() {
    // Set videoStream as srcObject
    if (
      this.videoRef.current &&
      (this.fgVideoOptions.isStream ?? defaultFgVideoOptions.isStream) &&
      this.videoStream
    ) {
      this.videoRef.current.srcObject = this.videoStream!;
    }

    // Set initial track statte
    const volumeSliders =
      this.videoContainerRef.current?.querySelectorAll(".volume-slider");

    volumeSliders?.forEach((slider) => {
      const sliderElement = slider as HTMLInputElement;
      if (this.audioRef.current) {
        sliderElement.value = this.audioRef.current.muted
          ? "0"
          : this.audioRef.current.volume.toString();
      }
    });

    // Get captions and set them to hidden initially
    if (this.videoRef.current && this.videoRef.current.textTracks[0]) {
      this.captions.current = this.videoRef.current.textTracks[0];
      this.captions.current.mode = "hidden";
    }

    // Set the initial progress position
    if (this.timelineContainerRef.current) {
      this.timelineContainerRef.current.style.setProperty(
        "--progress-position",
        `${
          this.fgVideoOptions.initialProgressPosition ??
          defaultFgVideoOptions.initialProgressPosition
        }`
      );
    }

    // Set the initial current time
    if (this.currentTimeRef.current) {
      this.currentTimeRef.current.textContent = this.controls.formatDuration(
        this.fgVideoOptions.initialProgressPosition ??
          defaultFgVideoOptions.initialProgressPosition
      );
    }

    // Set the video current time
    if (this.videoRef.current) {
      this.videoRef.current.currentTime =
        this.fgVideoOptions.initialProgressPosition ??
        defaultFgVideoOptions.initialProgressPosition;
    }

    this.videoContainerRef.current?.style.setProperty(
      "--timeline-background-color",
      `${
        this.fgVideoOptions.timelineBackgroundColor ??
        defaultFgVideoOptions.timelineBackgroundColor
      }`
    );
    this.videoContainerRef.current?.style.setProperty(
      "--closed-captions-decorator-color",
      `${
        this.fgVideoOptions.closedCaptionsDecoratorColor ??
        defaultFgVideoOptions.closedCaptionsDecoratorColor
      }`
    );
    this.videoContainerRef.current?.style.setProperty(
      "--timeline-primary-background-color",
      `${
        this.fgVideoOptions.timelinePrimaryBackgroundColor ??
        defaultFgVideoOptions.timelinePrimaryBackgroundColor
      }`
    );
    this.videoContainerRef.current?.style.setProperty(
      "--timeline-secondary-background-color",
      `${
        this.fgVideoOptions.timelineSecondaryBackgroundColor ??
        defaultFgVideoOptions.timelineSecondaryBackgroundColor
      }`
    );
    this.videoContainerRef.current?.style.setProperty(
      "--primary-video-color",
      `${
        this.fgVideoOptions.primaryVideoColor ??
        defaultFgVideoOptions.primaryVideoColor
      }`
    );
    this.videoContainerRef.current?.style.setProperty(
      "--flip-video",
      `${
        this.fgVideoOptions.flipVideo ?? defaultFgVideoOptions.flipVideo
          ? -1
          : 1
      }`
    );
  }

  handleMessage(event: any) {
    switch (event.type) {
      case "acceptEffect":
        this.onAcceptEffect(event);
        break;
      default:
        break;
    }
  }

  handleVisibilityChange() {
    if (this.type !== "camera") {
      return;
    }

    if (document.hidden) {
      if (!this.videoContainerRef.current?.classList.contains("paused")) {
        this.controls.handlePausePlay();
      }
    } else {
      if (this.videoContainerRef.current?.classList.contains("paused")) {
        this.controls.handlePausePlay();
      }
    }
  }

  onAcceptEffect(event: {
    type: "acceptBlur";
    effect: CameraEffectTypes | ScreenEffectTypes;
    producerId: string;
  }) {
    if (this.videoId === event.producerId) {
      this.handleEffectChange(event.effect);
    }
  }
}

export default FgVideoController;
