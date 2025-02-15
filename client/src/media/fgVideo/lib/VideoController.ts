import LowerVideoController from "./lowerVideoControls/LowerVideoController";
import { VideoOptions } from "./typeConstant";
import TableStaticContentSocketController, {
  IncomingTableStaticContentMessages,
  onCatchUpContentDataRespondedType,
  onRequestedCatchUpContentDataType,
} from "../../../lib/TableStaticContentSocketController";
import VideoMedia from "../VideoMedia";

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

  // handlePlaybackSpeed = () => {
  //   if (!this.videoRef.current || !this.playbackSpeedButtonRef.current) return;

  //   const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
  //   const currentPlaybackRateIndex = playbackRates.findIndex(
  //     (rate) => rate === this.videoRef.current?.playbackRate
  //   );

  //   const nextPlaybackRateIndex =
  //     (currentPlaybackRateIndex + 1) % playbackRates.length;

  //   this.videoRef.current.playbackRate = playbackRates[nextPlaybackRateIndex];
  //   this.playbackSpeedButtonRef.current.textContent = `${playbackRates[nextPlaybackRateIndex]}x`;
  // };

  // extractThumbnails = async (): Promise<string[]> => {
  //   if (!this.videoRef.current) {
  //     return [];
  //   }

  //   const thumbnails: string[] = [];
  //   const offscreenVideo = document.createElement("video");
  //   const canvas = document.createElement("canvas");
  //   const ctx = canvas.getContext("2d");
  //   const videoWidth = this.videoRef.current.videoWidth;
  //   const videoHeight = this.videoRef.current.videoHeight;
  //   const videoAspectRatio = videoWidth / videoHeight;

  //   if (!ctx) throw new Error("Failed to get 2D context");

  //   offscreenVideo.src = this.videoRef.current.src;
  //   offscreenVideo.crossOrigin = "anonymous";

  //   await new Promise<void>((resolve) => {
  //     offscreenVideo.onloadedmetadata = () => {
  //       resolve();
  //     };
  //   });

  //   const duration = offscreenVideo.duration;
  //   const thumbnailHeight = Math.max(videoHeight / this.thumbnailClarity, 90);
  //   const thumbnailWidth = Math.max(
  //     videoWidth / this.thumbnailClarity,
  //     90 * videoAspectRatio
  //   );

  //   for (let time = 0; time < duration; time += this.thumbnailInterval) {
  //     offscreenVideo.currentTime = time;

  //     await new Promise<void>((resolve) => {
  //       offscreenVideo.onseeked = () => {
  //         canvas.width = thumbnailWidth;
  //         canvas.height = thumbnailHeight;
  //         ctx.drawImage(offscreenVideo, 0, 0, thumbnailWidth, thumbnailHeight);
  //         const thumbnail = canvas.toDataURL("image/png");
  //         thumbnails.push(thumbnail);
  //         resolve();
  //       };
  //     });
  //   }

  //   return thumbnails;
  // };

  // loadThumbnails = async () => {
  //   if (this.videoRef.current) {
  //     const generatedThumbnails = await this.extractThumbnails();
  //     this.thumbnails.current = generatedThumbnails;
  //   }
  // };
}

export default VideoController;
