import { VideoOptions } from "./typeConstant";
import VideoMedia from "../VideoMedia";

class VideoController {
  constructor(
    private videoMedia: VideoMedia,
    private subContainerRef: React.RefObject<HTMLDivElement>,
    private videoContainerRef: React.RefObject<HTMLDivElement>,
    private videoOptions: VideoOptions
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
}

export default VideoController;
