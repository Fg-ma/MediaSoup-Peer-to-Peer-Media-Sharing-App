import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../context/streamsContext/typeConstant";
import { EffectStylesType } from "../../context/currentEffectsStylesContext/typeConstant";
import { defaultFgVideoOptions, FgVideoOptions } from "../FgVideo";
import Controls from "../../fgVideoControls/lib/Controls";

type FgVideoMessageEvents =
  | {
      type: "effectChangeRequested";
      requestedProducerType: "camera" | "screen" | "audio";
      requestedProducerId: string;
      effect: CameraEffectTypes | ScreenEffectTypes;
      effectStyle: string;
      blockStateChange: boolean;
    }
  | {
      type: "clientEffectChanged";
      username: string;
      instance: string;
      producerType: "camera" | "screen" | "audio";
      producerId: string;
      effect: CameraEffectTypes | ScreenEffectTypes;
      effectStyle: string;
      blockStateChange: boolean;
    };

class FgVideoController {
  constructor(
    private username: string,
    private instance: string,
    private type: "camera" | "screen",
    private videoId: string,
    private controls: Controls,
    private videoStream: MediaStream | undefined,
    private setPausedState: React.Dispatch<React.SetStateAction<boolean>>,
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
    }>,
    private currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    private remoteCurrentEffectsStyles: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: EffectStylesType;
      };
    }>,
    private videoRef: React.RefObject<HTMLVideoElement>,
    private videoContainerRef: React.RefObject<HTMLDivElement>,
    private audioRef: React.RefObject<HTMLAudioElement>,
    private fgVideoOptions: FgVideoOptions,
    private handleVisualEffectChange: (
      effect: CameraEffectTypes | ScreenEffectTypes,
      blockStateChange?: boolean
    ) => Promise<void>
  ) {}

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

    this.videoContainerRef.current?.style.setProperty(
      "--primary-video-color",
      `${
        this.fgVideoOptions.primaryVideoColor ??
        defaultFgVideoOptions.primaryVideoColor
      }`
    );
  };

  onEffectChangeRequested = (event: {
    type: "effectChangeRequested";
    requestedProducerType: "camera" | "screen" | "audio";
    requestedProducerId: string | undefined;
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
    effectStyle: string;
    blockStateChange: boolean;
  }) => {
    if (
      this.fgVideoOptions.acceptsVisualEffects &&
      this.type === event.requestedProducerType &&
      this.videoId === event.requestedProducerId
    ) {
      // @ts-expect-error: ts can't verify type, videoId, and effect correlate
      this.currentEffectsStyles.current[this.type][this.videoId][event.effect] =
        event.effectStyle;

      // @ts-expect-error: ts can't verify type and effect correlate
      this.handleVisualEffectChange(event.effect, event.blockStateChange);
    }

    if (event.effect === "pause") {
      this.setPausedState((prev) => !prev);
    }
  };

  onClientEffectChanged = (event: {
    type: "clientEffectChanged";
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "audio";
    producerId: string | undefined;
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
    effectStyle: string;
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
        // @ts-expect-error: ts can't verify username, instance, videoId, and effect correlate
        this.remoteStreamEffects.current[this.username][this.instance][
          this.type
        ][this.videoId][event.effect] =
          // @ts-expect-error: ts can't verify username, instance, videoId, and effect correlate
          !this.remoteStreamEffects.current[this.username][this.instance][
            this.type
          ][this.videoId][event.effect];
      }

      // @ts-expect-error: ts can't verify username, instance, videoId, and effect correlate
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
