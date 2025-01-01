import {
  UserEffectsStylesType,
  RemoteEffectStylesType,
  CameraEffectTypes,
  ScreenEffectTypes,
  RemoteStreamEffectsType,
} from "../../context/effectsContext/typeConstant";
import FgLowerVideoController from "./fgLowerVideoControls/lib/FgLowerVideoController";
import { FgVideoOptions } from "./typeConstant";
import { Permissions } from "src/context/permissionsContext/typeConstant";
import {
  IncomingMediasoupMessages,
  onResponsedCatchUpDataType,
} from "../../lib/MediasoupSocketController";
import {
  RemoteDataStreamsType,
  UserMediaType,
} from "../../context/mediaContext/typeConstant";

class FgVideoController {
  constructor(
    private table_id: string,
    private username: string,
    private instance: string,
    private videoId: string,
    private fgLowerVideoController: FgLowerVideoController,
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
    private videoContainerRef: React.RefObject<HTMLDivElement>,
    private audioRef: React.RefObject<HTMLAudioElement>,
    private fgVideoOptions: FgVideoOptions,
    private handleVisualEffectChange: (
      effect: CameraEffectTypes | ScreenEffectTypes,
      blockStateChange?: boolean
    ) => Promise<void>,
    private setInVideo: React.Dispatch<React.SetStateAction<boolean>>,
    private leaveVideoTimer: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private videoMovementTimeout: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  init = () => {
    // Set videoStream as srcObject
    if (this.videoRef.current && this.videoStream) {
      this.videoRef.current.srcObject = this.videoStream!;
    }

    this.videoContainerRef.current?.style.setProperty(
      "--primary-video-color",
      `${this.fgVideoOptions.primaryVideoColor}`
    );
  };

  onResponsedCatchUpData = (event: onResponsedCatchUpDataType) => {
    const { inquiredUsername, inquiredInstance, inquiredType, inquiredId } =
      event.header;
    const data = event.data;

    if (
      inquiredUsername === this.username &&
      inquiredInstance === this.instance &&
      inquiredType === "video" &&
      inquiredId === this.videoId &&
      data &&
      Object.keys(data.positioning).length !== 0
    ) {
      this.positioning.current = data.positioning;
    }
  };

  handleMediasoupMessage = (event: IncomingMediasoupMessages) => {
    switch (event.type) {
      case "newConsumerWasCreated":
        if (event.header.producerType == "json")
          this.attachPositioningListeners(this.fgVideoOptions.permissions);
        break;
      case "responsedCatchUpData":
        this.onResponsedCatchUpData(event);
        break;
      default:
        break;
    }
  };

  handleVisibilityChange() {
    if (document.hidden) {
      if (!this.videoContainerRef.current?.classList.contains("paused")) {
        this.fgLowerVideoController.handlePausePlay();
      }
    } else {
      if (this.videoContainerRef.current?.classList.contains("paused")) {
        this.fgLowerVideoController.handlePausePlay();
      }
    }
  }

  handlePointerMove = () => {
    this.setInVideo(true);

    if (this.videoContainerRef.current) {
      clearTimeout(this.videoMovementTimeout.current);
      this.videoMovementTimeout.current = undefined;
    }

    this.videoMovementTimeout.current = setTimeout(() => {
      this.setInVideo(false);
    }, 3500);
  };

  handlePointerEnter = () => {
    this.setInVideo(true);

    this.videoContainerRef.current?.addEventListener(
      "pointermove",
      this.handlePointerMove
    );

    if (this.leaveVideoTimer.current) {
      clearTimeout(this.leaveVideoTimer.current);
      this.leaveVideoTimer.current = undefined;
    }
  };

  handlePointerLeave = () => {
    this.videoContainerRef.current?.removeEventListener(
      "pointermove",
      this.handlePointerMove
    );

    if (this.videoContainerRef.current) {
      clearTimeout(this.videoMovementTimeout.current);
      this.videoMovementTimeout.current = undefined;
    }

    this.leaveVideoTimer.current = setTimeout(() => {
      this.setInVideo(false);
      clearTimeout(this.leaveVideoTimer.current);
      this.leaveVideoTimer.current = undefined;
    }, this.fgVideoOptions.controlsVanishTime);
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
              data.kind === "video" &&
              data.producerId === this.videoId
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

export default FgVideoController;
