import {
  UserEffectsStylesType,
  RemoteEffectStylesType,
  CameraEffectTypes,
  ScreenEffectTypes,
  RemoteStreamEffectsType,
} from "../../context/effectsContext/typeConstant";
import FgLowerVisualMediaController from "./fgLowerVisualMediaControls/lib/FgLowerVisualMediaController";
import { FgVisualMediaOptions } from "./typeConstant";
import { Permissions } from "src/context/permissionsContext/typeConstant";
import {
  IncomingMediasoupMessages,
  onClientEffectChangedType,
  onEffectChangeRequestedType,
  onResponsedCatchUpDataType,
} from "../../lib/MediasoupSocketController";
import {
  RemoteDataStreamsType,
  UserMediaType,
} from "../../context/mediaContext/typeConstant";

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
    private userMedia: React.MutableRefObject<UserMediaType>,
    private remoteStreamEffects: React.MutableRefObject<RemoteStreamEffectsType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private remoteEffectsStyles: React.MutableRefObject<RemoteEffectStylesType>,
    private remoteDataStreams: React.MutableRefObject<RemoteDataStreamsType>,
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
    private visualMediaMovementTimeout: React.MutableRefObject<
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

  onEffectChangeRequested = (event: onEffectChangeRequestedType) => {
    const { requestedProducerType, requestedProducerId } = event.header;
    const {
      effect,
      style,
      hideBackgroundColor,
      hideBackgroundStyle,
      postProcessStyle,
      blockStateChange,
    } = event.data;

    if (
      this.fgVisualMediaOptions.permissions &&
      ((this.type === "camera" &&
        this.fgVisualMediaOptions.permissions.acceptsCameraEffects) ||
        (this.type === "screen" &&
          this.fgVisualMediaOptions.permissions.acceptsScreenEffects)) &&
      this.type === requestedProducerType &&
      this.visualMediaId === requestedProducerId
    ) {
      // @ts-expect-error: ts can't verify type, visualMediaId, and effect correlate
      this.userEffectsStyles.current[this.type][this.visualMediaId][effect] =
        style;

      if (effect === "pause") {
        this.setPausedState((prev) => !prev);
      }

      if (effect === "hideBackground" && hideBackgroundColor !== undefined) {
        this.userMedia.current.camera[
          this.visualMediaId
        ].babylonScene.babylonRenderLoop.swapHideBackgroundContextFillColor(
          hideBackgroundColor
        );
      }

      if (effect === "hideBackground" && hideBackgroundStyle !== undefined) {
        this.userMedia.current.camera[
          this.visualMediaId
        ].babylonScene.babylonRenderLoop.swapHideBackgroundEffectImage(
          hideBackgroundStyle
        );
      }

      if (effect === "postProcess" && postProcessStyle !== undefined) {
        this.userMedia.current[this.type][
          this.visualMediaId
        ].babylonScene.babylonShaderController.swapPostProcessEffects(
          postProcessStyle
        );
      }

      this.handleVisualEffectChange(
        effect as CameraEffectTypes | ScreenEffectTypes,
        blockStateChange
      );
    }
  };

  onClientEffectChanged = (event: onClientEffectChangedType) => {
    const { username, instance, producerType, producerId } = event.header;
    const { blockStateChange, effect, effectStyle } = event.data;

    if (
      !this.fgVisualMediaOptions.isUser &&
      username === this.username &&
      instance === this.instance &&
      (producerType === "camera" || producerType === "screen") &&
      producerType === this.type &&
      producerId === this.visualMediaId
    ) {
      if (!blockStateChange) {
        // @ts-expect-error: ts can't verify username, instance, visualMediaId, and effect correlate
        this.remoteStreamEffects.current[username][instance][producerType][
          this.visualMediaId
        ][effect] =
          // @ts-expect-error: ts can't verify username, instance, visualMediaId, and effect correlate
          !this.remoteStreamEffects.current[username][instance][producerType][
            producerId
          ][effect];
      }

      if (effectStyle) {
        // @ts-expect-error: ts can't verify username, instance, visualMediaId, and effect correlate
        this.remoteEffectsStyles.current[username][instance][producerType][
          producerId
        ][effect] = effectStyle;
      }

      if (effect === "pause") {
        this.setPausedState((prev) => !prev);
      }
    }
  };

  onResponsedCatchUpData = (event: onResponsedCatchUpDataType) => {
    const {
      inquiredUsername,
      inquiredInstance,
      inquiredType,
      inquiredProducerId,
    } = event.header;
    const data = event.data;

    if (
      !this.fgVisualMediaOptions.isUser &&
      this.username === inquiredUsername &&
      this.instance === inquiredInstance &&
      this.type === inquiredType &&
      this.visualMediaId === inquiredProducerId &&
      data &&
      Object.keys(data.positioning).length !== 0
    ) {
      if (this.type === "camera") {
        if ("paused" in data) {
          if (data.paused) {
            this.paused.current = !this.paused.current;
            this.setPausedState((prev) => !prev);
          }

          this.fgLowerVisualMediaController.setInitTimeOffset(
            data.timeEllapsed
          );

          this.positioning.current = data.positioning;
        }
      } else if (this.type === "screen") {
        if ("paused" in data) {
          if (data.paused) {
            this.paused.current = !this.paused.current;
            this.setPausedState((prev) => !prev);
          }

          this.fgLowerVisualMediaController.setInitTimeOffset(
            data.timeEllapsed
          );

          this.positioning.current = data.positioning;
        }
      }
    }
  };

  handleMessage = (event: IncomingMediasoupMessages) => {
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
        this.attachPositioningListeners(this.fgVisualMediaOptions.permissions);
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

  handlePointerMove = () => {
    this.setInVisualMedia(true);

    if (this.visualMediaContainerRef.current) {
      clearTimeout(this.visualMediaMovementTimeout.current);
      this.visualMediaMovementTimeout.current = undefined;
    }

    this.visualMediaMovementTimeout.current = setTimeout(() => {
      this.setInVisualMedia(false);
    }, 3500);
  };

  handlePointerEnter = () => {
    this.setInVisualMedia(true);

    this.visualMediaContainerRef.current?.addEventListener(
      "pointermove",
      this.handlePointerMove
    );

    if (this.leaveVisualMediaTimer.current) {
      clearTimeout(this.leaveVisualMediaTimer.current);
      this.leaveVisualMediaTimer.current = undefined;
    }
  };

  handlePointerLeave = () => {
    this.visualMediaContainerRef.current?.removeEventListener(
      "pointermove",
      this.handlePointerMove
    );

    if (this.visualMediaContainerRef.current) {
      clearTimeout(this.visualMediaMovementTimeout.current);
      this.visualMediaMovementTimeout.current = undefined;
    }

    this.leaveVisualMediaTimer.current = setTimeout(() => {
      this.setInVisualMedia(false);
      clearTimeout(this.leaveVisualMediaTimer.current);
      this.leaveVisualMediaTimer.current = undefined;
    }, this.fgVisualMediaOptions.controlsVanishTime);
  };

  attachPositioningListeners = (permissions?: Permissions) => {
    Object.values(this.positioningListeners.current).forEach((userListners) =>
      Object.values(userListners).forEach((removeListener) => removeListener())
    );
    this.positioningListeners.current = {};

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
              permissions?.acceptsPositionScaleRotationManipulation &&
              data.table_id === this.table_id &&
              data.username === this.username &&
              data.instance === this.instance &&
              data.type === this.type &&
              data.producerId === this.visualMediaId
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
