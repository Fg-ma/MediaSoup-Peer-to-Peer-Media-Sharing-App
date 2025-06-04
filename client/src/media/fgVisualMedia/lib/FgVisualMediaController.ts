import {
  UserEffectsStylesType,
  RemoteEffectStylesType,
  CameraEffectTypes,
  ScreenEffectTypes,
  RemoteEffectsType,
  defaultCameraEffects,
  defaultScreenEffects,
} from "../../../../../universal/effectsTypeConstant";
import { Permissions } from "../../../context/permissionsContext/lib/typeConstant";
import FgLowerVisualMediaController from "./fgLowerVisualMediaControls/lib/FgLowerVisualMediaController";
import { FgVisualMediaOptions } from "./typeConstant";
import {
  IncomingMediasoupMessages,
  onClientClearedEffectsType,
  onClientEffectChangedType,
  onEffectChangeRequestedType,
  onRequestedClearEffectsType,
  onResponsedCatchUpDataType,
} from "../../../serverControllers/mediasoupServer/lib/typeConstant";
import {
  RemoteDataStreamsType,
  UserDataStreamsType,
  UserMediaType,
} from "../../../context/mediaContext/lib/typeConstant";
import MediasoupSocketController from "../../../serverControllers/mediasoupServer/MediasoupSocketController";
import {
  IncomingTableMessages,
  onReactionOccurredType,
} from "../../../serverControllers/tableServer/lib/typeConstant";
import {
  GroupSignals,
  MediaPositioningSignals,
  onGroupDeleteType,
  onGroupDragEndType,
  onGroupDragStartType,
  onGroupDragType,
  onMoveToType,
  onRotateToType,
  onScaleToType,
} from "../../../context/signalContext/lib/typeConstant";
import FgContentAdjustmentController from "../../../elements/fgAdjustmentElements/lib/FgContentAdjustmentControls";
import CameraMedia from "../CameraMedia";
import ScreenMedia from "../ScreenMedia";
import RemoteVisualMedia from "../RemoteVisualMedia";

class FgVisualMediaController {
  groupStartDragPosition: { x: number; y: number } | undefined;
  savedMediaPosition: { top: number; left: number } | undefined;

  constructor(
    private visualMedia: CameraMedia | ScreenMedia | RemoteVisualMedia,
    private tableId: string,
    private username: string,
    private instance: string,
    private type: "camera" | "screen",
    private visualMediaId: string,
    private fgLowerVisualMediaController: React.MutableRefObject<FgLowerVisualMediaController>,
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
    private remoteEffects: React.MutableRefObject<RemoteEffectsType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private remoteEffectsStyles: React.MutableRefObject<RemoteEffectStylesType>,
    private remoteDataStreams: React.MutableRefObject<RemoteDataStreamsType>,
    private videoRef: React.RefObject<HTMLVideoElement>,
    private visualMediaContainerRef: React.RefObject<HTMLDivElement>,
    private audioRef: React.RefObject<HTMLAudioElement>,
    private fgVisualMediaOptions: FgVisualMediaOptions,
    private handleVisualEffectChange: (
      effect: CameraEffectTypes | ScreenEffectTypes,
      blockStateChange?: boolean,
    ) => Promise<void>,
    private setInVisualMedia: React.Dispatch<React.SetStateAction<boolean>>,
    private leaveVisualMediaTimer: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private visualMediaMovementTimeout: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private aspectRatio: React.MutableRefObject<number>,
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    private fgContentAdjustmentController: React.MutableRefObject<FgContentAdjustmentController | null>,
    private bundleRef: React.RefObject<HTMLDivElement>,
    private sendGroupSignal: (signal: GroupSignals) => void,
    private userDataStreams: React.MutableRefObject<UserDataStreamsType>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  init = () => {
    // Set videoStream as srcObject
    if (this.videoRef.current && this.videoStream) {
      this.videoRef.current.srcObject = this.videoStream!;
    }

    // Set initial track state
    const volumeSliders =
      this.visualMediaContainerRef.current?.querySelectorAll(
        ".volume-slider-audio",
      );

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
      `${this.fgVisualMediaOptions.primaryVideoColor}`,
    );
  };

  handleVideoMetadataLoaded = (videoElement: HTMLVideoElement) => {
    if (videoElement) {
      const newAspectRatio = videoElement.videoWidth / videoElement.videoHeight;

      this.positioning.current.scale.y =
        this.positioning.current.scale.x / newAspectRatio;
      this.aspectRatio.current = newAspectRatio;

      this.setRerender((prev) => !prev);
    }
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
      this.visualMediaId === requestedProducerId &&
      (this.visualMedia instanceof CameraMedia ||
        this.visualMedia instanceof ScreenMedia)
    ) {
      if (
        !(this.visualMedia instanceof CameraMedia) &&
        !(this.visualMedia instanceof ScreenMedia)
      )
        return;

      // @ts-expect-error: ts can't verify type, visualMediaId, and effect correlate
      this.userEffectsStyles.current[this.type][this.visualMediaId][effect] =
        style;

      if (effect === "pause") {
        this.setPausedState((prev) => !prev);
      }

      if (effect === "hideBackground" && hideBackgroundColor !== undefined) {
        this.visualMedia.babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
          hideBackgroundColor,
        );
      }

      if (effect === "hideBackground" && hideBackgroundStyle !== undefined) {
        this.visualMedia.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
          hideBackgroundStyle,
        );
      }

      if (effect === "postProcess" && postProcessStyle !== undefined) {
        this.visualMedia.babylonScene?.babylonShaderController.swapPostProcessEffects(
          postProcessStyle,
        );
      }

      this.handleVisualEffectChange(
        effect as CameraEffectTypes | ScreenEffectTypes,
        blockStateChange,
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
        this.remoteEffects.current[username][instance][producerType][
          this.visualMediaId
        ][effect] =
          // @ts-expect-error: ts can't verify username, instance, visualMediaId, and effect correlate
          !this.remoteEffects.current[username][instance][producerType][
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

          this.fgLowerVisualMediaController.current.setInitTimeOffset(
            data.timeEllapsed,
          );

          this.positioning.current = data.positioning;
        }
      } else if (this.type === "screen") {
        if ("paused" in data) {
          if (data.paused) {
            this.paused.current = !this.paused.current;
            this.setPausedState((prev) => !prev);
          }

          this.fgLowerVisualMediaController.current.setInitTimeOffset(
            data.timeEllapsed,
          );

          this.positioning.current = data.positioning;
        }
      }
    }
  };

  onRequestedClearEffects = (event: onRequestedClearEffectsType) => {
    const { requestedProducerType, requestedProducerId } = event.header;

    if (
      ((this.type === "camera" &&
        this.fgVisualMediaOptions.permissions?.acceptsCameraEffects) ||
        (this.type === "screen" &&
          this.fgVisualMediaOptions.permissions?.acceptsScreenEffects)) &&
      requestedProducerType === this.type &&
      requestedProducerId === this.visualMediaId &&
      (this.visualMedia instanceof CameraMedia ||
        this.visualMedia instanceof ScreenMedia)
    ) {
      this.visualMedia.clearAllEffects();

      this.mediasoupSocket?.current?.sendMessage({
        type: "clientClearEffects",
        header: {
          tableId: this.tableId,
          username: this.username,
          instance: this.instance,
          producerType: this.type,
          producerId: this.visualMediaId,
        },
      });
    }
  };

  onClientClearedEffects = (event: onClientClearedEffectsType) => {
    const { username, instance, producerType, producerId } = event.header;

    if (
      !this.fgVisualMediaOptions.isUser &&
      username === this.username &&
      instance === this.instance &&
      producerType === this.type &&
      producerId === this.visualMediaId
    ) {
      this.remoteEffects.current[this.username][this.instance][this.type][
        this.visualMediaId
      ] = structuredClone(
        this.type === "camera" ? defaultCameraEffects : defaultScreenEffects,
      );

      this.setRerender((prev) => !prev);
    }
  };

  handleMediasoupMessage = (event: IncomingMediasoupMessages) => {
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
        if (event.header.producerType == "json")
          this.attachPositioningListeners(
            this.fgVisualMediaOptions.permissions,
          );
        break;
      case "requestedClearEffects":
        this.onRequestedClearEffects(event);
        break;
      case "clientClearedEffects":
        this.onClientClearedEffects(event);
        break;
      default:
        break;
    }
  };

  handleVisibilityChange = () => {
    if (this.type !== "camera") {
      return;
    }

    if (document.hidden) {
      if (!this.visualMediaContainerRef.current?.classList.contains("paused")) {
        this.fgLowerVisualMediaController.current.handlePausePlay();
      }
    } else {
      if (this.visualMediaContainerRef.current?.classList.contains("paused")) {
        this.fgLowerVisualMediaController.current.handlePausePlay();
      }
    }
  };

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
      this.handlePointerMove,
    );

    if (this.leaveVisualMediaTimer.current) {
      clearTimeout(this.leaveVisualMediaTimer.current);
      this.leaveVisualMediaTimer.current = undefined;
    }
  };

  handlePointerLeave = () => {
    this.visualMediaContainerRef.current?.removeEventListener(
      "pointermove",
      this.handlePointerMove,
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
      Object.values(userListners).forEach((removeListener) => removeListener()),
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
              data.tableId === this.tableId &&
              data.username === this.username &&
              data.instance === this.instance &&
              data.type === this.type &&
              data.producerId === this.visualMediaId
            ) {
              this.positioning.current = data.positioning;
              this.setRerender((prev) => !prev);
              this.sendGroupSignal({
                type: "groupElementMove",
                data: {
                  contentType: this.type,
                  instanceId: this.visualMediaId,
                },
              });
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

  reactionOccurred = (event: onReactionOccurredType) => {
    const { contentType, contentId } = event.header;
    const { reaction, reactionStyle } = event.data;

    if (contentType === this.type && contentId === this.visualMediaId) {
      this.fgLowerVisualMediaController.current.reactController.handleReaction(
        reaction,
        false,
        reactionStyle,
      );
    }
  };

  handleTableMessage = (event: IncomingTableMessages) => {
    switch (event.type) {
      case "reactionOccurred":
        this.reactionOccurred(event);
        break;
      default:
        break;
    }
  };

  onGroupDragStart = (signal: onGroupDragStartType) => {
    const { affected, startDragPosition } = signal.data;

    if (
      !affected.some(
        (item) => item.id === this.visualMediaId && item.type === this.type,
      )
    )
      return;

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction(
      "position",
      { rotationPointPlacement: "topLeft" },
    );

    this.groupStartDragPosition = startDragPosition;
    this.savedMediaPosition = this.positioning.current.position;
  };

  onGroupDrag = (signal: onGroupDragType) => {
    const { affected, dragPosition } = signal.data;

    if (
      !affected.some(
        (item) => item.id === this.visualMediaId && item.type === this.type,
      ) ||
      !this.groupStartDragPosition ||
      !this.savedMediaPosition ||
      !this.bundleRef.current
    )
      return;

    this.fgContentAdjustmentController.current?.movementDragFunction(
      {
        x:
          ((this.savedMediaPosition.left +
            dragPosition.x -
            this.groupStartDragPosition.x) /
            100) *
          this.bundleRef.current.clientWidth,
        y:
          ((this.savedMediaPosition.top +
            dragPosition.y -
            this.groupStartDragPosition.y) /
            100) *
          this.bundleRef.current.clientHeight,
      },
      { x: 0, y: 0 },
      {
        x:
          (this.positioning.current.position.left / 100) *
          this.bundleRef.current.clientWidth,
        y:
          (this.positioning.current.position.top / 100) *
          this.bundleRef.current.clientHeight,
      },
    );
  };

  onGroupDragEnd = (signal: onGroupDragEndType) => {
    const { affected } = signal.data;

    if (
      !affected.some(
        (item) => item.id === this.visualMediaId && item.type === this.type,
      )
    )
      return;

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction();

    this.groupStartDragPosition = undefined;
    this.savedMediaPosition = undefined;
  };

  onGroupDelete = (signal: onGroupDeleteType) => {
    const { affected } = signal.data;

    if (
      !affected.some(
        (item) => item.id === this.visualMediaId && item.type === this.type,
      )
    )
      return;

    this.fgLowerVisualMediaController.current.handleCloseVideo();
  };

  handleSignal = (signal: GroupSignals) => {
    switch (signal.type) {
      case "groupDelete":
        this.onGroupDelete(signal);
        break;
      case "groupDragStart":
        this.onGroupDragStart(signal);
        break;
      case "groupDrag":
        this.onGroupDrag(signal);
        break;
      case "groupDragEnd":
        this.onGroupDragEnd(signal);
        break;
      default:
        break;
    }
  };

  private sendUpdatePosition = () => {
    if (
      this.fgVisualMediaOptions.permissions
        ?.acceptsPositionScaleRotationManipulation &&
      this.userDataStreams.current.positionScaleRotation?.readyState === "open"
    ) {
      this.userDataStreams.current.positionScaleRotation?.send(
        JSON.stringify({
          tableId: this.tableId,
          username: this.username,
          instance: this.instance,
          type: this.type,
          producerId: this.visualMediaId,
          positioning: this.positioning.current,
        }),
      );
    }
  };

  handleMoveTo = (signal: onMoveToType) => {
    const { instanceId, contentType } = signal.header;

    if (instanceId !== this.visualMediaId || contentType !== this.type) return;

    const { position } = signal.data;

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction(
      "position",
      { rotationPointPlacement: "topLeft" },
    );

    this.fgContentAdjustmentController.current?.movementTo(
      {
        x: (position.x / 100) * (this.bundleRef.current?.clientWidth ?? 1),
        y: (position.y / 100) * (this.bundleRef.current?.clientHeight ?? 1),
      },
      {
        x:
          (this.positioning.current.position.left / 100) *
          (this.bundleRef.current?.clientWidth ?? 1),
        y:
          (this.positioning.current.position.top / 100) *
          (this.bundleRef.current?.clientHeight ?? 1),
      },
    );

    this.sendUpdatePosition();

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction();
  };

  handleRotateTo = (signal: onRotateToType) => {
    const { instanceId, contentType } = signal.header;

    if (
      !this.bundleRef.current ||
      instanceId !== this.visualMediaId ||
      contentType !== this.type
    )
      return;

    const { rotation } = signal.data;

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction();

    const box = this.bundleRef.current.getBoundingClientRect();

    this.fgContentAdjustmentController.current?.rotateTo(rotation, {
      x:
        (this.positioning.current.position.left / 100) *
          this.bundleRef.current.clientWidth +
        box.left,
      y:
        (this.positioning.current.position.top / 100) *
          this.bundleRef.current.clientHeight +
        box.top,
    });

    this.sendUpdatePosition();

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction();
  };

  handleScaleTo = (signal: onScaleToType) => {
    const { instanceId, contentType } = signal.header;

    if (
      !this.bundleRef.current ||
      instanceId !== this.visualMediaId ||
      contentType !== this.type
    )
      return;

    const { scale } = signal.data;

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction();

    const referencePoint = {
      x:
        (this.positioning.current.position.left / 100) *
        this.bundleRef.current.clientWidth,
      y:
        (this.positioning.current.position.top / 100) *
        this.bundleRef.current.clientHeight,
    };

    this.fgContentAdjustmentController.current?.scaleTo(
      "aspect",
      scale,
      referencePoint,
      referencePoint,
      this.aspectRatio.current,
    );

    this.sendUpdatePosition();

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction();
  };

  handleMediaPositioningSignal = (signal: MediaPositioningSignals) => {
    switch (signal.type) {
      case "moveTo":
        this.handleMoveTo(signal);
        break;
      case "rotateTo":
        this.handleRotateTo(signal);
        break;
      case "scaleTo":
        this.handleScaleTo(signal);
        break;
      default:
        break;
    }
  };

  handleVisualMediaMessage = (
    msg:
      | { type: "settingsChanged" }
      | { type: "toggleMiniPlayer" }
      | { type: "toggleClosedCaptions" }
      | { type: string },
  ) => {
    switch (msg.type) {
      case "settingsChanged":
        this.setRerender((prev) => !prev);
        break;
      case "toggleMiniPlayer":
        this.fgLowerVisualMediaController.current.handleMiniPlayer();
        break;
      case "toggleClosedCaptions":
        this.fgLowerVisualMediaController.current.handleClosedCaptions();
        break;
      default:
        break;
    }
  };

  handleTableScroll = () => {
    this.setSettingsActive((prev) => !prev);
  };
}

export default FgVisualMediaController;
