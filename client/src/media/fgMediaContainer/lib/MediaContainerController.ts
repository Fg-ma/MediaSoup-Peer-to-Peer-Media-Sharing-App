import { MediaContainerOptions, MediaKinds } from "./typeConstant";
import { IncomingMediasoupMessages } from "../../../lib/MediasoupSocketController";
import { RemoteDataStreamsType } from "../../../context/mediaContext/typeConstant";

class MediaContainerController {
  constructor(
    private table_id: React.MutableRefObject<string>,
    private mediaId: string,
    private kind: MediaKinds,
    private rootMedia: HTMLVideoElement | HTMLImageElement,
    private positioningListeners: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: () => void;
      };
    }>,
    private setAspectRatio: React.Dispatch<
      React.SetStateAction<number | undefined>
    >,
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
    private remoteDataStreams: React.MutableRefObject<RemoteDataStreamsType>,
    private mediaContainerRef: React.RefObject<HTMLDivElement>,
    private mediaContainerOptions: MediaContainerOptions,
    private setInMedia: React.Dispatch<React.SetStateAction<boolean>>,
    private leaveTimer: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private movementTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  init = () => {
    this.mediaContainerRef.current?.style.setProperty(
      "--primary-media-color",
      `${this.mediaContainerOptions.primaryMediaColor}`
    );
  };

  handlePointerMove = () => {
    this.setInMedia(true);

    if (this.mediaContainerRef.current) {
      clearTimeout(this.movementTimeout.current);
      this.movementTimeout.current = undefined;
    }

    this.movementTimeout.current = setTimeout(() => {
      this.setInMedia(false);
    }, 3500);
  };

  handlePointerEnter = () => {
    this.setInMedia(true);

    this.mediaContainerRef.current?.addEventListener(
      "pointermove",
      this.handlePointerMove
    );

    if (this.leaveTimer.current) {
      clearTimeout(this.leaveTimer.current);
      this.leaveTimer.current = undefined;
    }
  };

  handlePointerLeave = () => {
    this.mediaContainerRef.current?.removeEventListener(
      "pointermove",
      this.handlePointerMove
    );

    if (this.mediaContainerRef.current) {
      clearTimeout(this.movementTimeout.current);
      this.movementTimeout.current = undefined;
    }

    this.leaveTimer.current = setTimeout(() => {
      this.setInMedia(false);
      clearTimeout(this.leaveTimer.current);
      this.leaveTimer.current = undefined;
    }, this.mediaContainerOptions.controlsVanishTime);
  };

  handleMetadataLoaded = () => {
    const width =
      this.rootMedia instanceof HTMLVideoElement
        ? this.rootMedia.videoWidth
        : this.rootMedia.width;
    const height =
      this.rootMedia instanceof HTMLVideoElement
        ? this.rootMedia.videoHeight
        : this.rootMedia.height;

    if (width && height) {
      const computedAspectRatio = width / height;
      this.positioning.current.scale.y =
        this.positioning.current.scale.x / computedAspectRatio;
      this.setAspectRatio(computedAspectRatio);
    }
  };

  handleMediasoupMessage = (event: IncomingMediasoupMessages) => {
    switch (event.type) {
      case "newConsumerWasCreated":
        if (event.header.producerType == "json")
          this.attachPositioningListeners();
        break;
      default:
        break;
    }
  };

  attachPositioningListeners = () => {
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
              data.table_id === this.table_id.current &&
              data.kind === this.kind &&
              data.mediaId === this.mediaId
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

export default MediaContainerController;
