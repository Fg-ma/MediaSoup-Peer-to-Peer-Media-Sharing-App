import LowerVideoController from "./lowerVideoControls/lib/LowerVideoController";
import { VideoOptions } from "./typeConstant";
import TableStaticContentSocketController, {
  IncomingTableStaticContentMessages,
  onCatchUpContentDataRespondedType,
  onRequestedCatchUpContentDataType,
} from "../../lib/TableStaticContentSocketController";
import VideoMedia from "../../lib/VideoMedia";

class VideoController {
  constructor(
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private videoId: string,
    private videoMedia: VideoMedia,
    private subContainerRef: React.RefObject<HTMLDivElement>,
    private lowerVideoController: LowerVideoController,
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
    private videoContainerRef: React.RefObject<HTMLDivElement>,
    private videoOptions: VideoOptions,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  init = () => {
    this.videoContainerRef.current?.style.setProperty(
      "--primary-video-color",
      `${this.videoOptions.primaryVideoColor}`
    );
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

    const { positioning } = event.data;

    this.positioning.current = positioning;

    if ("videoTime" in event.data && "timeMeasured" in event.data) {
      this.videoMedia.video.currentTime =
        event.data.videoTime + (Date.now() - event.data.timeMeasured) / 1000;
    }

    this.setRerender((prev) => !prev);
  };
}

export default VideoController;
