import { EffectStylesType } from "../../context/currentEffectsStylesContext/CurrentEffectsStylesContext";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../context/streamsContext/StreamsContext";
import { defaultFgVideoOptions, FgVideoOptions } from "../FgVideo";
import Controls from "../../fgVideoControls/lib/Controls";

type FgVideoMessageEvents =
  | {
      type: "effectChangeRequested";
      requestedProducerType: "camera" | "screen" | "audio";
      requestedProducerId: string;
      effect: CameraEffectTypes | ScreenEffectTypes;
      effectStyle: any;
      blockStateChange: boolean;
    }
  | {
      type: "clientEffectChanged";
      username: string;
      instance: string;
      producerType: "camera" | "screen" | "audio";
      producerId: string;
      effect: CameraEffectTypes | ScreenEffectTypes;
      effectStyle: any;
      blockStateChange: boolean;
    };

class FgVideoController {
  private username: string;
  private instance: string;
  private type: "camera" | "screen";
  private videoId: string;

  private controls: Controls;

  private videoStream: MediaStream | undefined;

  private remoteStreamEffects: React.MutableRefObject<{
    [username: string]: {
      [instance: string]: {
        camera: {
          [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
        };
        screen: {
          [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
        };
        audio: { [effectType in AudioEffectTypes]: boolean };
      };
    };
  }>;
  private currentEffectsStyles: React.MutableRefObject<EffectStylesType>;
  private remoteCurrentEffectsStyles: React.MutableRefObject<{
    [username: string]: {
      [instance: string]: EffectStylesType;
    };
  }>;

  private videoRef: React.RefObject<HTMLVideoElement>;
  private videoContainerRef: React.RefObject<HTMLDivElement>;
  private audioRef: React.RefObject<HTMLAudioElement>;
  private timelineContainerRef: React.RefObject<HTMLDivElement>;
  private currentTimeRef: React.RefObject<HTMLDivElement>;

  private fgVideoOptions: FgVideoOptions;

  private handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;

  constructor(
    username: string,
    instance: string,
    type: "camera" | "screen",
    videoId: string,
    controls: Controls,
    videoStream: MediaStream | undefined,
    remoteStreamEffects: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: {
          camera: {
            [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
          };
          screen: {
            [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
          };
          audio: { [effectType in AudioEffectTypes]: boolean };
        };
      };
    }>,
    currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    remoteCurrentEffectsStyles: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: EffectStylesType;
      };
    }>,
    videoRef: React.RefObject<HTMLVideoElement>,
    videoContainerRef: React.RefObject<HTMLDivElement>,
    audioRef: React.RefObject<HTMLAudioElement>,
    timelineContainerRef: React.RefObject<HTMLDivElement>,
    currentTimeRef: React.RefObject<HTMLDivElement>,
    fgVideoOptions: FgVideoOptions,
    handleVisualEffectChange: (
      effect: CameraEffectTypes | ScreenEffectTypes,
      blockStateChange?: boolean
    ) => Promise<void>
  ) {
    this.username = username;
    this.instance = instance;
    this.type = type;
    this.videoId = videoId;
    this.controls = controls;
    this.videoStream = videoStream;
    this.remoteStreamEffects = remoteStreamEffects;
    this.currentEffectsStyles = currentEffectsStyles;
    this.remoteCurrentEffectsStyles = remoteCurrentEffectsStyles;
    this.videoRef = videoRef;
    this.videoContainerRef = videoContainerRef;
    this.audioRef = audioRef;
    this.timelineContainerRef = timelineContainerRef;
    this.currentTimeRef = currentTimeRef;
    this.fgVideoOptions = fgVideoOptions;
    this.handleVisualEffectChange = handleVisualEffectChange;
  }

  init = () => {
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
  };

  onEffectChangeRequested = (event: {
    type: "effectChangeRequested";
    requestedProducerType: "camera" | "screen" | "audio";
    requestedProducerId: string | undefined;
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
    effectStyle: any;
    blockStateChange: boolean;
  }) => {
    if (
      this.fgVideoOptions.acceptsVisualEffects &&
      this.type === event.requestedProducerType &&
      this.videoId === event.requestedProducerId
    ) {
      // @ts-ignore
      this.currentEffectsStyles.current[this.type][this.videoId][event.effect] =
        event.effectStyle;

      // @ts-ignore
      this.handleVisualEffectChange(event.effect, event.blockStateChange);
    }
  };

  onClientEffectChanged = (event: {
    type: "clientEffectChanged";
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "audio";
    producerId: string | undefined;
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
    effectStyle: any;
    blockStateChange: boolean;
  }) => {
    if (
      !this.fgVideoOptions.isUser &&
      this.username === event.username &&
      this.instance === event.instance &&
      this.type === event.producerType &&
      this.videoId === event.producerId
    ) {
      if (!event.blockStateChange) {
        // @ts-ignore
        this.remoteStreamEffects.current[this.username][this.instance][
          this.type
        ][this.videoId][event.effect] =
          // @ts-ignore
          !this.remoteStreamEffects.current[this.username][this.instance][
            this.type
          ][this.videoId][event.effect];
      }

      // @ts-ignore
      this.remoteCurrentEffectsStyles.current[this.username][this.instance][
        this.type
      ][this.videoId][event.effect] = event.effectStyle;
    }
  };

  handleMessage = (event: FgVideoMessageEvents) => {
    switch (event.type) {
      case "effectChangeRequested":
        this.onEffectChangeRequested(event);
        break;
      case "clientEffectChanged":
        this.onClientEffectChanged(event);
        break;
      default:
        break;
    }
  };

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
}

export default FgVideoController;
