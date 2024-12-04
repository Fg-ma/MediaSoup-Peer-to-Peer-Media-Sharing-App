import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../context/streamsContext/typeConstant";
import {
  EffectStylesType,
  HideBackgroundEffectTypes,
  PostProcessEffects,
} from "../../context/currentEffectsStylesContext/typeConstant";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import AudioMedia from "../../lib/AudioMedia";
import FgLowerVisualMediaController from "./fgLowerVisualMediaControls/lib/FgLowerVisualMediaController";
import { FgVisualMediaOptions } from "./typeConstant";

type FgVideoMessageEvents =
  | {
      type: "effectChangeRequested";
      requestedProducerType: "camera" | "screen" | "audio";
      requestedProducerId: string;
      effect: CameraEffectTypes | ScreenEffectTypes;
      blockStateChange: boolean;
      data: { style: string };
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
    }
  | {
      type: "responsedCatchUpData";
      inquiredUsername: string;
      inquiredInstance: string;
      inquiredType: "camera" | "screen";
      inquiredVideoId: string;
      data:
        | {
            cameraPaused: boolean;
            cameraTimeEllapsed: number;
          }
        | {
            screenPaused: boolean;
            screenTimeEllapsed: number;
          }
        | undefined;
    };

class FgVisualMediaController {
  constructor(
    private username: string,
    private instance: string,
    private type: "camera" | "screen",
    private videoId: string,
    private fgLowerVisualMediaController: FgLowerVisualMediaController,
    private videoStream: MediaStream | undefined,
    private setPausedState: React.Dispatch<React.SetStateAction<boolean>>,
    private paused: React.MutableRefObject<boolean>,
    private userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,
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
    private fgVisualMediaOptions: FgVisualMediaOptions,
    private handleVisualEffectChange: (
      effect: CameraEffectTypes | ScreenEffectTypes,
      blockStateChange?: boolean
    ) => Promise<void>,
    private setInVideo: React.Dispatch<React.SetStateAction<boolean>>,
    private leaveVideoTimer: React.MutableRefObject<NodeJS.Timeout | undefined>
  ) {}

  init = () => {
    // Set videoStream as srcObject
    if (
      this.videoRef.current &&
      this.fgVisualMediaOptions.isStream &&
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
      `${this.fgVisualMediaOptions.primaryVideoColor}`
    );
  };

  onEffectChangeRequested = (event: {
    type: "effectChangeRequested";
    requestedProducerType: "camera" | "screen" | "audio";
    requestedProducerId: string | undefined;
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
    blockStateChange: boolean;
    data: {
      style: string;
      hideBackgroundStyle?: HideBackgroundEffectTypes;
      hideBackgroundColor?: string;
      postProcessStyle?: PostProcessEffects;
    };
  }) => {
    if (
      this.fgVisualMediaOptions.permissions &&
      ((this.type === "camera" &&
        this.fgVisualMediaOptions.permissions.acceptsCameraEffects) ||
        (this.type === "screen" &&
          this.fgVisualMediaOptions.permissions.acceptsScreenEffects)) &&
      this.type === event.requestedProducerType &&
      this.videoId === event.requestedProducerId
    ) {
      // @ts-expect-error: ts can't verify type, videoId, and effect correlate
      this.currentEffectsStyles.current[this.type][this.videoId][event.effect] =
        event.data.style;

      if (event.effect === "pause") {
        this.setPausedState((prev) => !prev);
      }

      if (
        event.effect === "hideBackground" &&
        event.data.hideBackgroundColor !== undefined
      ) {
        this.userMedia.current.camera[
          this.videoId
        ].babylonScene.babylonRenderLoop.swapHideBackgroundContextFillColor(
          event.data.hideBackgroundColor
        );
      }

      if (
        event.effect === "hideBackground" &&
        event.data.hideBackgroundStyle !== undefined
      ) {
        this.userMedia.current.camera[
          this.videoId
        ].babylonScene.babylonRenderLoop.swapHideBackgroundEffectImage(
          event.data.hideBackgroundStyle
        );
      }

      if (
        event.effect === "postProcess" &&
        event.data.postProcessStyle !== undefined
      ) {
        this.userMedia.current[this.type][
          this.videoId
        ].babylonScene.babylonShaderController.swapPostProcessEffects(
          event.data.postProcessStyle
        );
      }

      // @ts-expect-error: ts can't verify type and effect correlate
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
    effectStyle: string;
    blockStateChange: boolean;
  }) => {
    if (
      !this.fgVisualMediaOptions.isUser &&
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

      if (event.effect === "pause") {
        this.setPausedState((prev) => !prev);
      }
    }
  };

  onResponsedCatchUpData = (event: {
    type: "responsedCatchUpData";
    inquiredUsername: string;
    inquiredInstance: string;
    inquiredType: "camera" | "screen";
    inquiredVideoId: string;
    data:
      | {
          cameraPaused: boolean;
          cameraTimeEllapsed: number;
        }
      | {
          screenPaused: boolean;
          screenTimeEllapsed: number;
        }
      | undefined;
  }) => {
    if (
      !this.fgVisualMediaOptions.isUser &&
      this.username === event.inquiredUsername &&
      this.instance === event.inquiredInstance &&
      this.type === event.inquiredType &&
      this.videoId === event.inquiredVideoId &&
      event.data
    ) {
      if (this.type === "camera") {
        if ("cameraPaused" in event.data) {
          if (event.data.cameraPaused) {
            this.paused.current = !this.paused.current;
            this.setPausedState((prev) => !prev);
          }

          this.fgLowerVisualMediaController.setInitTimeOffset(
            event.data.cameraTimeEllapsed
          );
        }
      } else if (this.type === "screen") {
        if ("screenPaused" in event.data) {
          if (event.data.screenPaused) {
            this.paused.current = !this.paused.current;
            this.setPausedState((prev) => !prev);
          }

          this.fgLowerVisualMediaController.setInitTimeOffset(
            event.data.screenTimeEllapsed
          );
        }
      }
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
      case "responsedCatchUpData":
        this.onResponsedCatchUpData(event);
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
        this.fgLowerVisualMediaController.handlePausePlay();
      }
    } else {
      if (this.videoContainerRef.current?.classList.contains("paused")) {
        this.fgLowerVisualMediaController.handlePausePlay();
      }
    }
  }

  handleMouseEnter = () => {
    this.setInVideo(true);
    if (this.leaveVideoTimer.current) {
      clearTimeout(this.leaveVideoTimer.current);
      this.leaveVideoTimer.current = undefined;
    }
  };

  handleMouseLeave = () => {
    this.leaveVideoTimer.current = setTimeout(() => {
      this.setInVideo(false);
      clearTimeout(this.leaveVideoTimer.current);
      this.leaveVideoTimer.current = undefined;
    }, this.fgVisualMediaOptions.controlsVanishTime);
  };
}

export default FgVisualMediaController;
