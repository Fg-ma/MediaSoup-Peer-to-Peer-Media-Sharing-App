import { DataConsumer } from "mediasoup-client/lib/DataConsumer";
import {
  UserEffectsStylesType,
  HideBackgroundEffectTypes,
  PostProcessEffects,
  RemoteEffectStylesType,
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../context/effectsContext/typeConstant";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import AudioMedia from "../../lib/AudioMedia";
import FgLowerVisualMediaController from "./fgLowerVisualMediaControls/lib/FgLowerVisualMediaController";
import { FgVisualMediaOptions } from "./typeConstant";

type FgVisualMediaMessageEvents =
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
      producerType: "camera" | "screen" | "screenAudio" | "audio";
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
      inquiredProducerId: string;
      data:
        | {
            paused: boolean;
            timeEllapsed: number;
            positioning: {
              position: {
                left: number;
                top: number;
              };
              scale: {
                x: number;
                y: number;
              };
              rotation: number;
            };
          }
        | {
            paused: boolean;
            timeEllapsed: number;
            positioning: {
              position: {
                left: number;
                top: number;
              };
              scale: {
                x: number;
                y: number;
              };
              rotation: number;
            };
          }
        | undefined;
    }
  | {
      type: "newConsumerWasCreated";
      producerUsername: string;
      producerInstance: string;
      producerId?: string;
      producerType: string;
    };

class FgVisualMediaController {
  constructor(
    private table_id: string,
    private username: string,
    private instance: string,
    private type: "camera" | "screen",
    private visualMediaId: string,
    private fgLowerVisualMediaController: FgLowerVisualMediaController,
    private videoStream: MediaStream | undefined,
    private positioningListeners: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: () => void;
      };
    }>,
    private positioning: React.MutableRefObject<{
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    }>,
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
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private remoteEffectsStyles: React.MutableRefObject<RemoteEffectStylesType>,
    private remoteDataStreams: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: {
          positionScaleRotation?: DataConsumer | undefined;
        };
      };
    }>,
    private videoRef: React.RefObject<HTMLVideoElement>,
    private visualMediaContainerRef: React.RefObject<HTMLDivElement>,
    private audioRef: React.RefObject<HTMLAudioElement>,
    private fgVisualMediaOptions: FgVisualMediaOptions,
    private handleVisualEffectChange: (
      effect: CameraEffectTypes | ScreenEffectTypes,
      blockStateChange?: boolean
    ) => Promise<void>,
    private setInVisualMedia: React.Dispatch<React.SetStateAction<boolean>>,
    private leaveVisualMediaTimer: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
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
      this.visualMediaContainerRef.current?.querySelectorAll(".volume-slider");

    volumeSliders?.forEach((slider) => {
      const sliderElement = slider as HTMLInputElement;
      if (this.audioRef.current) {
        sliderElement.value = this.audioRef.current.muted
          ? "0"
          : this.audioRef.current.volume.toString();
      }
    });

    this.visualMediaContainerRef.current?.style.setProperty(
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
      this.visualMediaId === event.requestedProducerId
    ) {
      // @ts-expect-error: ts can't verify type, visualMediaId, and effect correlate
      this.userEffectsStyles.current[this.type][this.visualMediaId][
        event.effect
      ] = event.data.style;

      if (event.effect === "pause") {
        this.setPausedState((prev) => !prev);
      }

      if (
        event.effect === "hideBackground" &&
        event.data.hideBackgroundColor !== undefined
      ) {
        this.userMedia.current.camera[
          this.visualMediaId
        ].babylonScene.babylonRenderLoop.swapHideBackgroundContextFillColor(
          event.data.hideBackgroundColor
        );
      }

      if (
        event.effect === "hideBackground" &&
        event.data.hideBackgroundStyle !== undefined
      ) {
        this.userMedia.current.camera[
          this.visualMediaId
        ].babylonScene.babylonRenderLoop.swapHideBackgroundEffectImage(
          event.data.hideBackgroundStyle
        );
      }

      if (
        event.effect === "postProcess" &&
        event.data.postProcessStyle !== undefined
      ) {
        this.userMedia.current[this.type][
          this.visualMediaId
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
    producerType: "camera" | "screen" | "screenAudio" | "audio";
    producerId: string | undefined;
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
    effectStyle?: string;
    blockStateChange: boolean;
  }) => {
    if (
      !this.fgVisualMediaOptions.isUser &&
      event.username === this.username &&
      event.instance === this.instance &&
      (event.producerType === "camera" || event.producerType === "screen") &&
      event.producerId === this.visualMediaId
    ) {
      if (!event.blockStateChange) {
        // @ts-expect-error: ts can't verify username, instance, visualMediaId, and effect correlate
        this.remoteStreamEffects.current[event.username][event.instance][
          event.producerType
        ][this.visualMediaId][event.effect] =
          // @ts-expect-error: ts can't verify username, instance, visualMediaId, and effect correlate
          !this.remoteStreamEffects.current[event.username][event.instance][
            event.producerType
          ][event.producerId][event.effect];
      }

      if (event.effectStyle) {
        // @ts-expect-error: ts can't verify username, instance, visualMediaId, and effect correlate
        this.remoteEffectsStyles.current[event.username][event.instance][
          this.type
        ][event.producerId][event.effect] = event.effectStyle;
      }

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
    inquiredProducerId: string;
    data:
      | {
          paused: boolean;
          timeEllapsed: number;
          positioning: {
            position: {
              left: number;
              top: number;
            };
            scale: {
              x: number;
              y: number;
            };
            rotation: number;
          };
        }
      | {
          paused: boolean;
          timeEllapsed: number;
          positioning: {
            position: {
              left: number;
              top: number;
            };
            scale: {
              x: number;
              y: number;
            };
            rotation: number;
          };
        }
      | undefined;
  }) => {
    if (
      !this.fgVisualMediaOptions.isUser &&
      this.username === event.inquiredUsername &&
      this.instance === event.inquiredInstance &&
      this.type === event.inquiredType &&
      this.visualMediaId === event.inquiredProducerId &&
      event.data &&
      Object.keys(event.data.positioning).length !== 0
    ) {
      if (this.type === "camera") {
        if ("paused" in event.data) {
          if (event.data.paused) {
            this.paused.current = !this.paused.current;
            this.setPausedState((prev) => !prev);
          }

          this.fgLowerVisualMediaController.setInitTimeOffset(
            event.data.timeEllapsed
          );

          this.positioning.current = event.data.positioning;
        }
      } else if (this.type === "screen") {
        if ("paused" in event.data) {
          if (event.data.paused) {
            this.paused.current = !this.paused.current;
            this.setPausedState((prev) => !prev);
          }

          this.fgLowerVisualMediaController.setInitTimeOffset(
            event.data.timeEllapsed
          );

          this.positioning.current = event.data.positioning;
        }
      }
    }
  };

  handleMessage = (event: FgVisualMediaMessageEvents) => {
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
      case "newConsumerWasCreated":
        this.attachPositioningListeners();
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
      if (!this.visualMediaContainerRef.current?.classList.contains("paused")) {
        this.fgLowerVisualMediaController.handlePausePlay();
      }
    } else {
      if (this.visualMediaContainerRef.current?.classList.contains("paused")) {
        this.fgLowerVisualMediaController.handlePausePlay();
      }
    }
  }

  handleMouseEnter = () => {
    this.setInVisualMedia(true);
    if (this.leaveVisualMediaTimer.current) {
      clearTimeout(this.leaveVisualMediaTimer.current);
      this.leaveVisualMediaTimer.current = undefined;
    }
  };

  handleMouseLeave = () => {
    this.leaveVisualMediaTimer.current = setTimeout(() => {
      this.setInVisualMedia(false);
      clearTimeout(this.leaveVisualMediaTimer.current);
      this.leaveVisualMediaTimer.current = undefined;
    }, this.fgVisualMediaOptions.controlsVanishTime);
  };

  // Attach message listeners
  attachPositioningListeners = () => {
    for (const remoteUsername in this.remoteDataStreams.current) {
      const remoteUserStreams = this.remoteDataStreams.current[remoteUsername];
      for (const remoteInstance in remoteUserStreams) {
        const stream = remoteUserStreams[remoteInstance].positionScaleRotation;
        if (
          stream &&
          (!this.positioningListeners.current[remoteUsername] ||
            !this.positioningListeners.current[remoteUsername][remoteInstance])
        ) {
          const handleMessage = (message: string) => {
            const data = JSON.parse(message);
            if (
              this.fgVisualMediaOptions.permissions
                ?.acceptsPositionScaleRotationManipulation &&
              data.table_id === this.table_id &&
              data.username === this.username &&
              data.instance === this.instance &&
              data.type === this.type
            ) {
              this.positioning.current = data.positioning;
              this.setRerender((prev) => !prev);
            }
          };

          stream.on("message", handleMessage);

          // Store cleanup function
          if (!this.positioningListeners.current[remoteUsername]) {
            this.positioningListeners.current[remoteUsername] = {};
          }
          this.positioningListeners.current[remoteUsername][remoteInstance] =
            () => stream.off("message", handleMessage);
        }
      }
    }
  };
}

export default FgVisualMediaController;
