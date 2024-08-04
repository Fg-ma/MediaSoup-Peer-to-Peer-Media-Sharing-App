import { Socket } from "socket.io-client";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../context/StreamsContext";
import { defaultFgVideoOptions, FgVideoOptions } from "../FgVideo";
import AudioMedia from "../../lib/AudioMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import CameraMedia from "../../lib/CameraMedia";
import Controls from "src/fgVideoControls/lib/Controls";

class FgVideoController {
  private type: "camera" | "screen";
  private videoId: string;
  private fgVideoOptions: FgVideoOptions;
  private videoRef: React.RefObject<HTMLVideoElement>;
  private videoStream: MediaStream | undefined;
  private videoContainerRef: React.RefObject<HTMLDivElement>;
  private audioRef: React.RefObject<HTMLAudioElement>;
  private captions: React.MutableRefObject<TextTrack | undefined>;
  private controls: Controls;
  private tracksColorSetter: () => void;
  private timelineContainerRef: React.RefObject<HTMLDivElement>;
  private currentTimeRef: React.RefObject<HTMLDivElement>;
  private handleEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;

  constructor(
    type: "camera" | "screen",
    videoId: string,
    fgVideoOptions: FgVideoOptions,
    videoRef: React.RefObject<HTMLVideoElement>,
    videoStream: MediaStream | undefined,
    videoContainerRef: React.RefObject<HTMLDivElement>,
    audioRef: React.RefObject<HTMLAudioElement>,
    captions: React.MutableRefObject<TextTrack | undefined>,
    controls: Controls,
    tracksColorSetter: () => void,
    timelineContainerRef: React.RefObject<HTMLDivElement>,
    currentTimeRef: React.RefObject<HTMLDivElement>,
    handleEffectChange: (
      effect: CameraEffectTypes | ScreenEffectTypes,
      blockStateChange?: boolean
    ) => Promise<void>
  ) {
    this.type = type;
    this.videoId = videoId;
    this.fgVideoOptions = fgVideoOptions;
    this.videoRef = videoRef;
    this.videoStream = videoStream;
    this.videoContainerRef = videoContainerRef;
    this.audioRef = audioRef;
    this.captions = captions;
    this.controls = controls;
    this.tracksColorSetter = tracksColorSetter;
    this.timelineContainerRef = timelineContainerRef;
    this.currentTimeRef = currentTimeRef;
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
    this.tracksColorSetter();

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
