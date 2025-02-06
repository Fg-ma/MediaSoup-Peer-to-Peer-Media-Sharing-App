import FgLowerVideoController from "./fgLowerVideoControls/lib/FgLowerVideoController";
import { FgVideoOptions } from "./typeConstant";
import { IncomingMediasoupMessages } from "../../lib/MediasoupSocketController";
import { RemoteDataStreamsType } from "../../context/mediaContext/typeConstant";
import TableStaticContentSocketController, {
  IncomingTableStaticContentMessages,
  onCatchUpContentDataRespondedType,
  onRequestedCatchUpContentDataType,
} from "../../lib/TableStaticContentSocketController";
import VideoMedia from "../../lib/VideoMedia";

class ImageController {
  constructor(
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private table_id: React.MutableRefObject<string>,
    private videoId: string,
    private videoMedia: VideoMedia,
    private subContainerRef: React.RefObject<HTMLDivElement>,
    private fgLowerVideoController: FgLowerVideoController,
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
    private remoteDataStreams: React.MutableRefObject<RemoteDataStreamsType>,
    private videoContainerRef: React.RefObject<HTMLDivElement>,
    private fgVideoOptions: FgVideoOptions,
    private setInVideo: React.Dispatch<React.SetStateAction<boolean>>,
    private leaveVideoTimer: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private videoMovementTimeout: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  init = () => {
    this.videoContainerRef.current?.style.setProperty(
      "--primary-video-color",
      `${this.fgVideoOptions.primaryVideoColor}`
    );
  };

  handleVisibilityChange = () => {
    if (document.hidden) {
      if (!this.videoContainerRef.current?.classList.contains("paused")) {
        this.fgLowerVideoController.handlePausePlay();
      }
    } else {
      if (this.videoContainerRef.current?.classList.contains("paused")) {
        this.fgLowerVideoController.handlePausePlay();
      }
    }
  };

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
              data.kind === "video" &&
              data.videoId === this.videoId
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

  scaleCallback = () => {
    if (!this.subContainerRef.current) return;

    // Calculate the aspect ratio of the video
    const videoAspectRatio =
      this.videoMedia.video.videoWidth / this.videoMedia.video.videoHeight;

    // Get the size of the container
    const containerBox = this.subContainerRef.current.getBoundingClientRect();
    const containerWidth = containerBox.width;
    const containerHeight = containerBox.height;

    // Calculate the container's aspect ratio
    const containerAspectRatio = containerWidth / containerHeight;

    // Apply scaling based on the smaller dimension to prevent overflow
    if (containerAspectRatio > videoAspectRatio) {
      // Container is wider than the video aspect ratio
      this.videoMedia.video.style.width = "auto";
      this.videoMedia.video.style.height = "100%";
      if (this.videoMedia.hiddenVideo) {
        this.videoMedia.hiddenVideo.style.width = "auto";
        this.videoMedia.hiddenVideo.style.height = "100%";
      }
    } else {
      // Container is taller than the video aspect ratio
      this.videoMedia.video.style.width = "100%";
      this.videoMedia.video.style.height = "auto";
      if (this.videoMedia.hiddenVideo) {
        this.videoMedia.hiddenVideo.style.width = "100%";
        this.videoMedia.hiddenVideo.style.height = "auto";
      }
    }
  };

  handleTableStaticContentMessage = (
    event: IncomingTableStaticContentMessages
  ) => {
    switch (event.type) {
      case "requestedCatchUpContentData":
        this.onRequestedCatchUpContentData(event);
        break;
      case "catchUpContentDataResponded":
        this.onCatchUpContentDataResponded(event);
        break;
      default:
        break;
    }
  };

  onRequestedCatchUpContentData = (
    event: onRequestedCatchUpContentDataType
  ) => {
    const { inquiringUsername, inquiringInstance, contentType, contentId } =
      event.header;

    this.tableStaticContentSocket.current?.catchUpContentDataResponse(
      inquiringUsername,
      inquiringInstance,
      contentType,
      contentId,
      this.positioning.current,
      this.videoMedia.getVideoTime(),
      Date.now()
    );
  };

  onCatchUpContentDataResponded = (
    event: onCatchUpContentDataRespondedType
  ) => {
    const { contentType, contentId } = event.header;

    if (contentType !== "video" || contentId !== this.videoId) {
      return;
    }

    const { positioning, videoTime, timeMeasured } = event.data;

    this.positioning.current = positioning;

    this.videoMedia.video.currentTime =
      videoTime + (Date.now() - timeMeasured) / 1000;

    this.setRerender((prev) => !prev);
  };
}

export default ImageController;
